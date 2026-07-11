import { useCallback, useEffect, useRef, useState } from "react";
import { handleError } from "../../utils/ToastMessages";

const RTC_CONFIG = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
};
const MEDIA_ERROR = "Camera/mic unavailable — check permissions";

export default function useWebRTC({ socket, mySocketId, participants, allowVideo, allowAudio }) {
  const [streams, setStreams] = useState(() => new Map());
  const [localStream, setLocalStream] = useState(null);
  const [videoOn, setVideoOn] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  const peersRef = useRef(new Map()); // socketId → { pc, polite, makingOffer, ignoreOffer, audioSender, videoSender, remoteStream }
  const outStreamRef = useRef(null);
  const audioTrackRef = useRef(null);
  const videoTrackRef = useRef(null);
  const videoOnRef = useRef(false);
  const audioOnRef = useRef(false);
  const erroredRef = useRef(false);
  const mySocketIdRef = useRef(mySocketId);
  mySocketIdRef.current = mySocketId;
  // Toggles await getUserMedia (potentially a long permission prompt); the
  // host may disallow media in that window, so re-checks read fresh refs.
  const allowVideoRef = useRef(allowVideo);
  allowVideoRef.current = allowVideo;
  const allowAudioRef = useRef(allowAudio);
  allowAudioRef.current = allowAudio;

  const getOutStream = () => {
    if (!outStreamRef.current) outStreamRef.current = new MediaStream();
    return outStreamRef.current;
  };

  const refreshLocalStream = useCallback(() => {
    const live = getOutStream().getTracks().filter((t) => t.readyState === "live");
    setLocalStream(live.length ? new MediaStream(live) : null);
  }, []);

  const emitMediaState = useCallback(() => {
    if (socket) socket.emit("media:state", { videoOn: videoOnRef.current, audioOn: audioOnRef.current });
  }, [socket]);

  const failMedia = useCallback(() => {
    setMediaError(MEDIA_ERROR);
    if (!erroredRef.current) {
      erroredRef.current = true;
      handleError(MEDIA_ERROR);
    }
  }, []);

  const closePeer = useCallback((peerId) => {
    const entry = peersRef.current.get(peerId);
    if (!entry) return;
    peersRef.current.delete(peerId);
    entry.pc.onnegotiationneeded = null;
    entry.pc.onicecandidate = null;
    entry.pc.ontrack = null;
    try { entry.pc.close(); } catch {}
    setStreams((prev) => {
      if (!prev.has(peerId)) return prev;
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  }, []);

  const createPeer = useCallback((peerId) => {
    let entry = peersRef.current.get(peerId);
    if (entry) return entry;
    const pc = new RTCPeerConnection(RTC_CONFIG);
    // Perfect negotiation: the lexicographically smaller socket id is the polite peer.
    entry = {
      pc,
      polite: mySocketIdRef.current < peerId,
      makingOffer: false,
      ignoreOffer: false,
      audioSender: null,
      videoSender: null,
      remoteStream: null,
    };
    if (audioTrackRef.current) entry.audioSender = pc.addTrack(audioTrackRef.current, getOutStream());
    if (videoTrackRef.current) entry.videoSender = pc.addTrack(videoTrackRef.current, getOutStream());

    pc.onnegotiationneeded = async () => {
      try {
        entry.makingOffer = true;
        await pc.setLocalDescription();
        socket.emit("rtc:signal", { to: peerId, data: { description: pc.localDescription } });
      } catch {
        /* pc may have closed mid-negotiation */
      } finally {
        entry.makingOffer = false;
      }
    };
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit("rtc:signal", { to: peerId, data: { candidate } });
    };
    pc.ontrack = ({ track }) => {
      // New MediaStream instance per change so consumers' effects re-run.
      const prevTracks = entry.remoteStream
        ? entry.remoteStream.getTracks().filter((t) => t !== track && t.readyState === "live")
        : [];
      entry.remoteStream = new MediaStream([...prevTracks, track]);
      setStreams((prev) => new Map(prev).set(peerId, entry.remoteStream));
    };
    peersRef.current.set(peerId, entry);
    return entry;
  }, [socket]);

  const handleSignal = useCallback(async ({ from, data } = {}) => {
    if (!from || !data) return;
    const entry = createPeer(from); // either side may see the first signal before the roster diff runs
    const { pc } = entry;
    try {
      if (data.description) {
        const desc = data.description;
        const collision = desc.type === "offer" && (entry.makingOffer || pc.signalingState !== "stable");
        entry.ignoreOffer = !entry.polite && collision;
        if (entry.ignoreOffer) return;
        if (collision) {
          // Glare: polite side abandons its own offer and accepts theirs.
          await Promise.all([
            pc.setLocalDescription({ type: "rollback" }),
            pc.setRemoteDescription(desc),
          ]);
        } else {
          await pc.setRemoteDescription(desc);
        }
        if (desc.type === "offer") {
          await pc.setLocalDescription();
          socket.emit("rtc:signal", { to: from, data: { description: pc.localDescription } });
        }
      } else if (data.candidate) {
        try {
          await pc.addIceCandidate(data.candidate);
        } catch (err) {
          if (!entry.ignoreOffer) throw err;
        }
      }
    } catch {
      /* negotiation error — next onnegotiationneeded retries */
    }
  }, [createPeer, socket]);

  const handleSignalRef = useRef(handleSignal);
  handleSignalRef.current = handleSignal;
  const closePeerRef = useRef(closePeer);
  closePeerRef.current = closePeer;

  useEffect(() => {
    if (!socket) return undefined;
    const onSignal = (payload) => handleSignalRef.current(payload);
    const onPeerLeft = (payload) => {
      if (payload && payload.socketId) closePeerRef.current(payload.socketId);
    };
    socket.on("rtc:signal", onSignal);
    socket.on("rtc:peer-left", onPeerLeft);
    return () => {
      socket.off("rtc:signal", onSignal);
      socket.off("rtc:peer-left", onPeerLeft);
    };
  }, [socket]);

  // Our own socket id changes when the signaling socket reconnects and
  // re-joins. Peers will tear down their PCs for the old id and negotiate
  // against the new one, and politeness derives from id ordering — so the
  // whole local mesh must be rebuilt, and the server's fresh participant
  // flags re-synced with our still-live tracks.
  const prevMyIdRef = useRef(null);
  useEffect(() => {
    if (!mySocketId) return;
    const prev = prevMyIdRef.current;
    prevMyIdRef.current = mySocketId;
    if (prev && prev !== mySocketId) {
      [...peersRef.current.keys()].forEach((id) => closePeer(id));
      if (audioTrackRef.current || videoTrackRef.current) emitMediaState();
    }
  }, [mySocketId, closePeer, emitMediaState]);

  // Peer lifecycle mirrors the roster: create for new peers, close for departed ones.
  useEffect(() => {
    if (!socket || !mySocketId) return;
    const current = new Set();
    (participants || []).forEach((p) => {
      if (p.socketId && p.socketId !== mySocketId) {
        current.add(p.socketId);
        createPeer(p.socketId);
      }
    });
    [...peersRef.current.keys()].forEach((id) => {
      if (!current.has(id)) closePeer(id);
    });
  }, [participants, mySocketId, socket, createPeer, closePeer]);

  const toggleAudio = useCallback(async () => {
    if (!allowAudio) return;
    let track = audioTrackRef.current;
    if (!track || track.readyState !== "live") {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ audio: true });
        track = media.getAudioTracks()[0];
      } catch {
        failMedia();
        return;
      }
      if (!allowAudioRef.current) {
        // Host disallowed audio while the permission prompt was open.
        try { track.stop(); } catch {}
        return;
      }
      audioTrackRef.current = track;
      getOutStream().addTrack(track);
      peersRef.current.forEach((entry) => {
        if (entry.audioSender) entry.audioSender.replaceTrack(track).catch(() => {});
        else entry.audioSender = entry.pc.addTrack(track, getOutStream());
      });
      audioOnRef.current = true;
    } else {
      track.enabled = !track.enabled; // mute keeps the track live (no renegotiation)
      audioOnRef.current = track.enabled;
    }
    setAudioOn(audioOnRef.current);
    setMediaError(null);
    refreshLocalStream();
    emitMediaState();
  }, [allowAudio, emitMediaState, failMedia, refreshLocalStream]);

  const stopVideo = useCallback(() => {
    const track = videoTrackRef.current;
    videoTrackRef.current = null;
    if (track) {
      try { track.stop(); } catch {} // camera light off
      getOutStream().removeTrack(track);
    }
    peersRef.current.forEach((entry) => {
      if (entry.videoSender) entry.videoSender.replaceTrack(null).catch(() => {});
    });
    videoOnRef.current = false;
    setVideoOn(false);
    refreshLocalStream();
  }, [refreshLocalStream]);

  const toggleVideo = useCallback(async () => {
    if (videoOnRef.current) {
      stopVideo();
      emitMediaState();
      return;
    }
    if (!allowVideo) return;
    let track;
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 } });
      track = media.getVideoTracks()[0];
    } catch {
      failMedia();
      return;
    }
    if (!allowVideoRef.current) {
      // Host disallowed video while the permission prompt was open.
      try { track.stop(); } catch {}
      return;
    }
    videoTrackRef.current = track;
    getOutStream().addTrack(track);
    peersRef.current.forEach((entry) => {
      if (entry.videoSender) entry.videoSender.replaceTrack(track).catch(() => {});
      else entry.videoSender = entry.pc.addTrack(track, getOutStream());
    });
    videoOnRef.current = true;
    setVideoOn(true);
    setMediaError(null);
    refreshLocalStream();
    emitMediaState();
  }, [allowVideo, emitMediaState, failMedia, refreshLocalStream, stopVideo]);

  // Host disallowed media mid-session → force off. Keyed on track existence
  // (not just the on-flags) so a capture that landed mid-flip is killed too.
  useEffect(() => {
    if (allowVideo) return;
    if (videoOnRef.current || videoTrackRef.current) {
      stopVideo();
      emitMediaState();
    }
  }, [allowVideo, stopVideo, emitMediaState]);

  useEffect(() => {
    if (allowAudio) return;
    const track = audioTrackRef.current;
    if (!track && !audioOnRef.current) return;
    // Fully release the mic (not just track.enabled=false): while audio is
    // host-disallowed the user has no control to silence it themselves.
    audioTrackRef.current = null;
    if (track) {
      try { track.stop(); } catch {}
      getOutStream().removeTrack(track);
    }
    peersRef.current.forEach((entry) => {
      if (entry.audioSender) entry.audioSender.replaceTrack(null).catch(() => {});
    });
    audioOnRef.current = false;
    setAudioOn(false);
    refreshLocalStream();
    emitMediaState();
  }, [allowAudio, emitMediaState, refreshLocalStream]);

  useEffect(() => () => {
    peersRef.current.forEach((entry) => {
      entry.pc.onnegotiationneeded = null;
      entry.pc.onicecandidate = null;
      entry.pc.ontrack = null;
      try { entry.pc.close(); } catch {}
    });
    peersRef.current.clear();
    if (outStreamRef.current) {
      outStreamRef.current.getTracks().forEach((t) => { try { t.stop(); } catch {} });
    }
    audioTrackRef.current = null;
    videoTrackRef.current = null;
  }, []);

  return { localStream, streams, videoOn, audioOn, toggleVideo, toggleAudio, mediaError };
}
