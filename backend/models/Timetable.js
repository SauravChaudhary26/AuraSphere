// models/Timetable.js
const mongoose = require("mongoose");

const timetableCellSchema = new mongoose.Schema({
   subject: { type: String, default: "Break" },
});

const timetableSchema = new mongoose.Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   timetable: {
      type: [timetableCellSchema],
      default: () => Array.from({ length: 50 }, () => ({ subject: "Break" })),
      validate: {
         validator: (val) => val.length === 50,
         message: "Timetable must have exactly 50 cells.",
      },
   },
});

module.exports = mongoose.model("Timetable", timetableSchema);
