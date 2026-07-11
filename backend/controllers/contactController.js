const Contact = require("../models/Contact");

// Public: submit a contact-form message.
const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const ipAddress = req.ip;
    const saved = await Contact.create({ name, email, subject, message, ipAddress });
    res.status(201).json({ success: true, message: "Message sent successfully", id: saved._id });
  } catch (err) {
    next(err);
  }
};

// Admin: list messages (paginated), without IP addresses.
const listContacts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const [contacts, total] = await Promise.all([
      Contact.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-ipAddress")
        .lean(),
      Contact.countDocuments(),
    ]);

    res.json({
      success: true,
      contacts,
      pagination: { currentPage: page, totalPages: Math.ceil(total / limit), total },
    });
  } catch (err) {
    next(err);
  }
};

// Admin: update a message's status.
const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["new", "read", "responded"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-ipAddress");
    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });
    res.json({ success: true, contact });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitContact, listContacts, updateContactStatus };
