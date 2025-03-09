const Course = require("../models/Course");

// Fetch all courses for a user
const getCourses = async (req, res) => {
   const { userId } = req.params;
   try {
      const courses = await Course.find({ userId }).select("name _id");
      res.status(200).json(courses);
   } catch (error) {
      res.status(500).json({ message: "Error fetching courses" });
   }
};

// Add a course for a user
const addCourse = async (req, res) => {
   const { userId, name } = req.body;
   if (!userId || !name)
      return res.status(400).json({ message: "Missing data" });

   try {
      // Check if the course already exists for the user
      const existingCourse = await Course.findOne({ userId, name });
      if (existingCourse)
         return res.status(400).json({ message: "Course already added" });

      const newCourse = await Course.create({ userId, name });
      const courses = await Course.find({ userId }).select("name _id");
      res.status(201).json(courses);
   } catch (error) {
      res.status(500).json({ message: "Error adding course" });
   }
};

// Delete a course for a user
const deleteCourse = async (req, res) => {
   const { userId, courseId } = req.body;
   if (!userId || !courseId)
      return res.status(400).json({ message: "Missing data" });

   try {
      await Course.findOneAndDelete({ _id: courseId, userId });
      const courses = await Course.find({ userId }).select("name _id");
      res.status(200).json(courses);
   } catch (error) {
      res.status(500).json({ message: "Error deleting course" });
   }
};

module.exports = { getCourses, addCourse, deleteCourse };
