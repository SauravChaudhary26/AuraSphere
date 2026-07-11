import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Swords, Send, Check, X as XIcon, Trophy, Star } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Badge,
  Field,
  Input,
  Textarea,
  Avatar,
  EmptyState,
  LoadingScreen,
  Spinner,
  Modal,
  cx,
} from "../components/ui";
import api from "../lib/http";
import { formatDate } from "../utils/aura";
import { handleError, handleSuccess } from "../utils/ToastMessages";

const STATUS_TONE = {
  pending: "warning",
  accepted: "jade",
  completed: "success",
  rejected: "danger",
};

const STATUS_LABEL = {
  pending: "Pending",
  accepted: "Active",
  completed: "Completed",
  rejected: "Rejected",
};

function ChallengeCard({ challenge, me, actions }) {
  const iAmReceiver = challenge.receiver?._id === me;
  const other = iAmReceiver ? challenge.sender : challenge.receiver;
  const relation = iAmReceiver ? "From" : "To";
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={other?.name} src={other?.avatar} size={40} />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-faint">{relation}</div>
            <div className="font-semibold">{other?.name || "Unknown"}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant={STATUS_TONE[challenge.status] || "neutral"} dot>
            {STATUS_LABEL[challenge.status] || challenge.status}
          </Badge>
          {challenge.rated && (
            <Badge variant="gold">
              <Star size={12} /> Rated
            </Badge>
          )}
        </div>
      </div>

      <p className="text-[15px] text-ink">{challenge.message}</p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {challenge.deadline && (
          <span className="text-xs text-muted">Due {formatDate(challenge.deadline)}</span>
        )}
        {actions && <div className="ml-auto flex gap-2">{actions}</div>}
      </div>
    </Card>
  );
}

function Section({ title, icon, children }) {
  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ChallengeFriend() {
  const me = localStorage.getItem("userId");

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // New-challenge modal state
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState(null);
  const [message, setMessage] = useState("");
  const [deadline, setDeadline] = useState("");
  const [rated, setRated] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/challenges");
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError("Couldn't load your challenges");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Debounced user search
  const debounceRef = useRef();
  useEffect(() => {
    if (!open) return;
    const q = term.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get("/users", { params: { search: q } });
        setResults((Array.isArray(data) ? data : []).filter((u) => u._id !== me));
      } catch (err) {
        handleError("Couldn't search users");
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [term, open, me]);

  const resetForm = () => {
    setTerm("");
    setResults([]);
    setPicked(null);
    setMessage("");
    setDeadline("");
    setRated(false);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const sendChallenge = async () => {
    if (!picked) return handleError("Pick someone to challenge");
    if (!message.trim()) return handleError("Add a challenge message");
    setSending(true);
    try {
      await api.post("/challenges", {
        receiver: picked._id,
        message: message.trim(),
        deadline: deadline || null,
        rated,
      });
      handleSuccess("Challenge sent!");
      closeModal();
      load();
    } catch (err) {
      handleError(err?.response?.data?.message || "Couldn't send challenge");
    } finally {
      setSending(false);
    }
  };

  const act = async (id, path, okMsg) => {
    setBusyId(id);
    try {
      await api.put(`/challenges/${id}/${path}`);
      if (okMsg) handleSuccess(okMsg);
      await load();
    } catch (err) {
      handleError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <LoadingScreen label="Loading your challenges…" />;

  const incoming = challenges.filter((c) => c.receiver?._id === me && c.status === "pending");
  const active = challenges.filter((c) => c.receiver?._id === me && c.status === "accepted");
  const sent = challenges.filter((c) => c.sender?._id === me && c.status === "pending");
  const done = challenges.filter((c) => c.status === "completed" || c.status === "rejected");

  return (
    <>
      <PageHeader
        eyebrow="Compete"
        title="Challenges"
        subtitle="Dare a friend to keep up — complete a rated challenge to earn Aura."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus size={17} /> New challenge
          </Button>
        }
      />

      {challenges.length === 0 ? (
        <EmptyState
          icon={<Swords size={40} />}
          title="No challenges yet"
          subtitle="Challenge a friend to a focus duel and see who comes out on top."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> New challenge
            </Button>
          }
        />
      ) : (
        <>
          {incoming.length > 0 && (
            <Section title="Incoming" icon={<Send size={18} className="text-primary" />}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {incoming.map((c) => (
                  <ChallengeCard
                    key={c._id}
                    challenge={c}
                    me={me}
                    actions={
                      <>
                        <Button
                          size="sm"
                          variant="jade"
                          loading={busyId === c._id}
                          onClick={() => act(c._id, "accept", "Challenge accepted!")}
                        >
                          <Check size={15} /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busyId === c._id}
                          onClick={() => act(c._id, "reject")}
                        >
                          <XIcon size={15} /> Reject
                        </Button>
                      </>
                    }
                  />
                ))}
              </div>
            </Section>
          )}

          {active.length > 0 && (
            <Section title="Active" icon={<Swords size={18} className="text-jade" />}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((c) => (
                  <ChallengeCard
                    key={c._id}
                    challenge={c}
                    me={me}
                    actions={
                      <Button
                        size="sm"
                        variant="primary"
                        loading={busyId === c._id}
                        onClick={() => act(c._id, "complete", "Challenge complete! +25 Aura")}
                      >
                        <Trophy size={15} /> Complete
                      </Button>
                    }
                  />
                ))}
              </div>
            </Section>
          )}

          {sent.length > 0 && (
            <Section title="Sent" icon={<Send size={18} className="text-muted" />}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sent.map((c) => (
                  <ChallengeCard key={c._id} challenge={c} me={me} />
                ))}
              </div>
            </Section>
          )}

          {done.length > 0 && (
            <Section title="History" icon={<Trophy size={18} className="text-warning" />}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {done.map((c) => (
                  <ChallengeCard key={c._id} challenge={c} me={me} />
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title="New challenge"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={sendChallenge} loading={sending} disabled={!picked || !message.trim()}>
              <Send size={16} /> Send challenge
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {picked ? (
            <div className="flex items-center justify-between rounded-[11px] border border-border bg-surface-2 px-3.5 py-2.5">
              <div className="flex items-center gap-3">
                <Avatar name={picked.name} src={picked.avatar} size={36} />
                <div>
                  <div className="font-semibold">{picked.name}</div>
                  {picked.aura != null && (
                    <div className="mono text-xs text-muted">{Number(picked.aura).toLocaleString()} Aura</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPicked(null)}
                aria-label="Clear selected opponent"
                className="rounded-lg p-1 text-muted hover:bg-surface hover:text-ink"
              >
                <XIcon size={18} />
              </button>
            </div>
          ) : (
            <Field label="Find someone">
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                <Input
                  className="pl-9"
                  placeholder="Search by name…"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  aria-label="Search users to challenge"
                  autoFocus
                />
                {searching && <Spinner size={16} className="absolute right-3 top-1/2 -translate-y-1/2" />}
              </div>
              {term.trim() && (
                <div className="mt-2 max-h-52 overflow-y-auto rounded-[11px] border border-border">
                  {results.length === 0 && !searching ? (
                    <div className="px-3.5 py-3 text-sm text-muted">No users found</div>
                  ) : (
                    results.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => {
                          setPicked(u);
                          setTerm("");
                          setResults([]);
                        }}
                        className={cx(
                          "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-surface-2",
                          "border-b border-border last:border-b-0"
                        )}
                      >
                        <Avatar name={u.name} src={u.avatar} size={32} />
                        <span className="font-medium">{u.name}</span>
                        {u.aura != null && (
                          <span className="mono ml-auto text-xs text-muted">{Number(u.aura).toLocaleString()}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </Field>
          )}

          <Field label="Challenge message" required>
            <Textarea
              placeholder="e.g. Log 3 study sessions before Friday!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>

          <Field label="Deadline">
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </Field>

          <label className="flex cursor-pointer items-center justify-between rounded-[11px] border border-border bg-surface-2 px-3.5 py-2.5">
            <span className="flex items-center gap-2 text-[15px]">
              <Star size={16} className="text-primary" /> Rated challenge
            </span>
            <input
              type="checkbox"
              checked={rated}
              onChange={(e) => setRated(e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
              aria-label="Rated challenge"
            />
          </label>
        </div>
      </Modal>
    </>
  );
}
