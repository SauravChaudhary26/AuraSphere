import { useState } from "react";
import { Modal, Button, Field, Input, Textarea } from "../ui";

/** Unified add/edit goal modal (replaces the MUI AddObjective/EditObjectives). */
export default function GoalFormModal({ open, onClose, onSubmit, initial }) {
  const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    targetDate: toInputDate(initial?.targetDate) || toInputDate(Date.now()),
  });
  const [saving, setSaving] = useState(false);
  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.title || !form.description || !form.targetDate) return;
    setSaving(true);
    try {
      await onSubmit({ ...form, targetDate: new Date(form.targetDate).toISOString() });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit goal" : "New goal"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving} disabled={!form.title || !form.description}>
            {initial ? "Save changes" : "Add goal"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Title">
          <Input name="title" value={form.title} onChange={change} placeholder="Finish DSA problem set" autoFocus />
        </Field>
        <Field label="Description">
          <Textarea name="description" value={form.description} onChange={change} placeholder="What does done look like?" />
        </Field>
        <Field label="Target date">
          <Input type="date" name="targetDate" value={form.targetDate} onChange={change} />
        </Field>
      </div>
    </Modal>
  );
}
