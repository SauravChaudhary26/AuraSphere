const Event = require("../models/Event");

const listEvents = async (req, res, next) => {
  try {
    // Upcoming first; include recent past so the UI can show "passed".
    const events = await Event.find({ userId: req.userId }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const { title, type, date, color, notes } = req.body;
    if (!title || !date) return res.status(400).json({ message: "Title and date are required" });
    const event = await Event.create({ userId: req.userId, title, type, date, color, notes });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { listEvents, createEvent, updateEvent, deleteEvent };
