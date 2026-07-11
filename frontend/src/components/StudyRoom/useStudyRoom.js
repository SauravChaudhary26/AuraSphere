import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setPoints } from "../../utils/redux/pointsSlice";
import { handleError, handleSuccess } from "../../utils/ToastMessages";
import { fireConfetti } from "./confetti";
import { playChime } from "./useAmbientSound";

const INITIAL_TIMER = {
  phase: "idle",
  running: false,
  phaseEndsAt: null,
  phaseDurationMs: 0,
  remainingMs: null,
  focusCount: 0,
  cycleInSet: 0,
};

const initialState = {
  view: "lobby", // "lobby" | "room" | "summary"
  publicRooms: [],
  room: null,
  participants: [],
  mySocketId: null,
  timer: INITIAL_TIMER,
  chat: [],
  reactions: [],
  auraEarned: 0,
  summary: null,
};

// Snapshot the session outcome from current state before it's cleared.
const buildSummary = (state) => {
  const me = state.participants.find((p) => p.socketId === state.mySocketId);
  const goals = me?.goals || [];
  return {
    roomName: state.room?.name || "Study room",
    emoji: state.room?.emoji || "📚",
    focusMinutes: me?.focusMinutes || 0,
    focusSessions: me?.focusSessionsCompleted || 0,
    auraEarned: state.auraEarned,
    goalsDone: goals.filter((g) => g.done).length,
    goalsTotal: goals.length,
  };
};

function reducer(state, action) {
  switch (action.type) {
    case "lobby/rooms":
      return { ...state, publicRooms: action.rooms };
    case "room/entered": {
      const rs = action.state;
      return {
        ...state,
        view: "room",
        room: rs.room,
        mySocketId: rs.mySocketId,
        participants: rs.participants,
        timer: rs.timer,
        chat: rs.chat || [],
        reactions: [],
        // Keep aura earned across a reconnect re-join of the same session.
        auraEarned: state.view === "room" ? state.auraEarned : 0,
        summary: null,
      };
    }
    case "room/participants":
      return {
        ...state,
        participants: action.participants,
        room: state.room ? { ...state.room, hostSocketId: action.hostSocketId } : state.room,
      };
    case "room/settings":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          settings: action.settings,
          name: action.settings.name,
          emoji: action.settings.emoji,
        },
      };
    case "timer/update":
      return { ...state, timer: action.timer };
    case "chat/message": {
      // Ack + broadcast can both deliver the sender's own message — dedupe by id.
      if (state.chat.some((m) => m.id === action.message.id)) return state;
      const chat = [...state.chat, action.message];
      return { ...state, chat: chat.length > 200 ? chat.slice(-200) : chat };
    }
    case "reactions/add":
      return { ...state, reactions: [...state.reactions, action.reaction] };
    case "reactions/prune":
      return { ...state, reactions: state.reactions.filter((r) => r.key !== action.key) };
    case "goals/local":
      return {
        ...state,
        participants: state.participants.map((p) =>
          p.socketId === state.mySocketId ? { ...p, goals: action.goals } : p
        ),
      };
    case "aura/earned":
      return { ...state, auraEarned: state.auraEarned + action.amount };
    case "room/summary":
      return {
        ...initialState,
        publicRooms: state.publicRooms,
        view: "summary",
        summary: buildSummary(state),
      };
    case "view/lobby":
      return { ...initialState, publicRooms: state.publicRooms };
    default:
      return state;
  }
}

export default function useStudyRoom(socket) {
  const dispatch = useDispatch();
  const [state, send] = useReducer(reducer, initialState);
  const [connected, setConnected] = useState(!!socket?.connected);

  const viewRef = useRef(state.view);
  viewRef.current = state.view;
  const roomIdRef = useRef(null);
  const prevPhaseRef = useRef("idle");
  const reactionTimeoutsRef = useRef(new Set());

  const enterRoom = useCallback((rs) => {
    roomIdRef.current = rs.room.id;
    prevPhaseRef.current = rs.timer.phase;
    send({ type: "room/entered", state: rs });
  }, []);

  const toSummary = useCallback(() => {
    if (viewRef.current !== "room") return;
    roomIdRef.current = null;
    send({ type: "room/summary" });
  }, []);

  /* ------------------------------------------------ socket listeners */
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setConnected(true);
      // Reconnect resilience: silently re-join the room we were in.
      if (viewRef.current === "room" && roomIdRef.current) {
        const code = roomIdRef.current;
        socket.emit("room:join", { code }, (res) => {
          // The user may have clicked Leave while this ack was in flight —
          // a stale success must not drag them back into the room.
          const stale = viewRef.current !== "room" || roomIdRef.current !== code;
          if (res?.ok && stale) {
            socket.emit("room:leave", {}, () => {});
            return;
          }
          if (stale) return;
          if (res?.ok) enterRoom(res.state);
          else {
            handleError(res?.error || "Room no longer available");
            roomIdRef.current = null;
            send({ type: "view/lobby" });
          }
        });
      }
    };
    const onDisconnect = (reason) => {
      setConnected(false);
      // A server-initiated disconnect (session replaced by another tab) stops
      // auto-reconnect in socket.io — reconnect manually so the lobby and any
      // future joins still work from this tab.
      if (reason === "io server disconnect") socket.connect();
    };
    const onSessionReplaced = () => {
      if (viewRef.current !== "room") return;
      handleError("You joined this room from another tab — this one was disconnected");
      toSummary(); // also clears roomIdRef, so this tab won't re-join and steal back
    };
    const onParticipants = ({ participants, hostSocketId }) =>
      send({ type: "room/participants", participants, hostSocketId });
    const onSettings = (settings) => send({ type: "room/settings", settings });
    const onTimer = (timer) => {
      const prev = prevPhaseRef.current;
      prevPhaseRef.current = timer.phase;
      if (timer.phase !== prev && timer.running && timer.phase !== "idle") {
        playChime(timer.phase === "focus" ? "focus" : "break");
      }
      send({ type: "timer/update", timer });
    };
    const onChat = (message) => send({ type: "chat/message", message });
    const onReaction = ({ id, emoji, name }) => {
      const key = String(id);
      send({ type: "reactions/add", reaction: { key, emoji, name, x: 5 + Math.random() * 85 } });
      const t = setTimeout(() => {
        reactionTimeoutsRef.current.delete(t);
        send({ type: "reactions/prune", key });
      }, 2600);
      reactionTimeoutsRef.current.add(t);
    };
    const onClosed = (payload) => {
      if (viewRef.current !== "room") return;
      handleError(
        payload?.reason === "inactive" ? "Room closed due to inactivity" : "The host ended the room"
      );
      toSummary();
    };
    const onKicked = () => {
      if (viewRef.current !== "room") return;
      handleError("You were removed from the room");
      toSummary();
    };
    const onAura = ({ amount, newBalance }) => {
      dispatch(setPoints(newBalance));
      handleSuccess(`+${amount} aura — focus session complete! ✨`);
      fireConfetti();
      send({ type: "aura/earned", amount });
    };
    const onLobbyRooms = ({ rooms }) => send({ type: "lobby/rooms", rooms: rooms || [] });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room:participants", onParticipants);
    socket.on("room:settings", onSettings);
    socket.on("timer:update", onTimer);
    socket.on("chat:message", onChat);
    socket.on("reaction:new", onReaction);
    socket.on("room:closed", onClosed);
    socket.on("room:kicked", onKicked);
    socket.on("room:session-replaced", onSessionReplaced);
    socket.on("aura:awarded", onAura);
    socket.on("lobby:rooms", onLobbyRooms);
    setConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:participants", onParticipants);
      socket.off("room:settings", onSettings);
      socket.off("timer:update", onTimer);
      socket.off("chat:message", onChat);
      socket.off("reaction:new", onReaction);
      socket.off("room:closed", onClosed);
      socket.off("room:kicked", onKicked);
      socket.off("room:session-replaced", onSessionReplaced);
      socket.off("aura:awarded", onAura);
      socket.off("lobby:rooms", onLobbyRooms);
    };
  }, [socket, dispatch, enterRoom, toSummary]);

  // Clear any pending reaction-prune timeouts on unmount.
  useEffect(() => {
    const timeouts = reactionTimeoutsRef.current;
    return () => {
      timeouts.forEach((t) => clearTimeout(t));
      timeouts.clear();
    };
  }, []);

  /* --------------------------------------------- lobby subscription */
  useEffect(() => {
    if (!socket || state.view !== "lobby" || !connected) return;
    socket.emit("lobby:subscribe", {}, (res) => {
      if (res?.ok) send({ type: "lobby/rooms", rooms: res.rooms || [] });
    });
    return () => {
      if (socket.connected) socket.emit("lobby:unsubscribe", {}, () => {});
    };
  }, [socket, state.view, connected]);

  /* ----------------------------------------------------- actions */
  const createRoom = useCallback(
    (settings) =>
      new Promise((resolve) => {
        if (!socket) return resolve(false);
        socket.emit("room:create", settings || {}, (res) => {
          if (res?.ok) {
            enterRoom(res.state);
            resolve(true);
          } else {
            handleError(res?.error || "Couldn't create the room");
            resolve(false);
          }
        });
      }),
    [socket, enterRoom]
  );

  const joinRoom = useCallback(
    (code) =>
      new Promise((resolve) => {
        if (!socket) return resolve(false);
        const clean = String(code || "").trim().toUpperCase();
        if (!clean) return resolve(false);
        socket.emit("room:join", { code: clean }, (res) => {
          if (res?.ok) {
            enterRoom(res.state);
            resolve(true);
          } else {
            handleError(res?.error || "Couldn't join the room");
            resolve(false);
          }
        });
      }),
    [socket, enterRoom]
  );

  const leaveRoom = useCallback(() => {
    if (socket?.connected) socket.emit("room:leave", {}, () => {});
    toSummary();
  }, [socket, toSummary]);

  const endRoom = useCallback(() => {
    if (!socket) return;
    socket.emit("room:end", {}, (res) => {
      if (!res?.ok) handleError(res?.error || "Couldn't end the room");
      else toSummary(); // no-op if the room:closed broadcast got there first
    });
  }, [socket, toSummary]);

  const timerControl = useCallback(
    (action) => {
      socket?.emit("timer:control", { action }, (res) => {
        if (!res?.ok) handleError(res?.error || "Something went wrong");
      });
    },
    [socket]
  );

  const updateSettings = useCallback(
    (patch) =>
      new Promise((resolve) => {
        if (!socket) return resolve(false);
        socket.emit("room:settings:update", patch, (res) => {
          if (res?.ok) {
            send({ type: "room/settings", settings: res.settings });
            handleSuccess("Room settings updated");
            resolve(true);
          } else {
            handleError(res?.error || "Couldn't update settings");
            resolve(false);
          }
        });
      }),
    [socket]
  );

  const kick = useCallback(
    (socketId) => {
      socket?.emit("room:kick", { socketId }, (res) => {
        if (!res?.ok) handleError(res?.error || "Couldn't remove participant");
      });
    },
    [socket]
  );

  const sendChat = useCallback(
    (text) => {
      const clean = String(text || "").trim();
      if (!clean || !socket) return;
      socket.emit("chat:send", { text: clean }, (res) => {
        if (res?.ok && res.message) send({ type: "chat/message", message: res.message });
        else if (!res?.ok) handleError(res?.error || "Couldn't send message");
      });
    },
    [socket]
  );

  const sendReaction = useCallback(
    (emoji) => {
      socket?.emit("reaction:send", { emoji }, (res) => {
        if (!res?.ok && res?.error) handleError(res.error);
      });
    },
    [socket]
  );

  const setGoals = useCallback(
    (goals) => {
      send({ type: "goals/local", goals }); // optimistic
      socket?.emit("goals:update", { goals }, (res) => {
        if (!res?.ok) handleError(res?.error || "Couldn't save goals");
      });
    },
    [socket]
  );

  const backToLobby = useCallback(() => {
    roomIdRef.current = null;
    send({ type: "view/lobby" });
  }, []);

  /* ----------------------------------------------------- derived */
  const me = state.participants.find((p) => p.socketId === state.mySocketId) || null;
  const isHost = !!state.room && state.mySocketId === state.room.hostSocketId;
  const settings = state.room?.settings;
  const chatLocked =
    !!settings && (!settings.chatEnabled || (settings.chatFocusLock && state.timer.phase === "focus"));
  const reactionsLocked = !!settings?.chatFocusLock && state.timer.phase === "focus";

  return {
    view: state.view,
    connected,
    publicRooms: state.publicRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    endRoom,
    room: state.room,
    participants: state.participants,
    mySocketId: state.mySocketId,
    isHost,
    me,
    timer: state.timer,
    timerControl,
    updateSettings,
    kick,
    chat: state.chat,
    sendChat,
    chatLocked,
    reactionsLocked,
    sendReaction,
    reactions: state.reactions,
    myGoals: me?.goals || [],
    setGoals,
    auraEarned: state.auraEarned,
    summary: state.summary,
    backToLobby,
  };
}
