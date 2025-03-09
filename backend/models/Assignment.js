const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
   {
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      title: { type: String, required: true },
      description: { type: String },
      course: { type: String, required: true },
      deadline: { type: Date, required: true },
      completed: { type: Boolean, default: false },
   },
   { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
