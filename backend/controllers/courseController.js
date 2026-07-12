const Course = require("../models/course.js");

const isHexColor = (v) => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);

// Fetch all courses for a user
const getCourses = async (req, res) => {
    const userId = req.userId;
    try {
        const courses = await Course.find({ userId }).select("name color _id");
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching courses" });
    }
};

// Add a course for a user
const addCourse = async (req, res) => {
    const userId = req.userId;
    const { name, color } = req.body;
    if (!userId || !name)
        return res.status(400).json({ message: "Missing data" });

    try {
        // Check if the course already exists for the user
        const existingCourse = await Course.findOne({ userId, name });
        if (existingCourse)
            return res.status(400).json({ message: "Course already added" });

        const newCourse = await Course.create({
            userId,
            name,
            ...(isHexColor(color) ? { color } : {}),
        });
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: "Error adding course" });
    }
};

// Delete a course for a user
const deleteCourse = async (req, res) => {
    const userId = req.userId;
    const { courseId } = req.body;
    if (!userId || !courseId)
        return res.status(400).json({ message: "Missing data" });

    try {
        await Course.findOneAndDelete({ _id: courseId, userId });
        res.status(200).json({ message: "Course Deleted Successfully"});
    } catch (error) {
        res.status(500).json({ message: "Error deleting course" });
    }
};

module.exports = { getCourses, addCourse, deleteCourse };