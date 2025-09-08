import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import axios from "axios";

const courseRoute = "/courses";

const Courses = () => {
    const [course, setCourse] = useState("");
    const [courses, setCourses] = useState([]);

    const handleAddCourse = async () => {
        if (course.trim() !== "" && !courses.some((c) => c.name === course)) {
            const res = await axios.post(courseRoute, { name: course.trim() });
            const newCourse = res.data;
            setCourses(prev => [...prev, newCourse]);
            setCourse("");
        }
    };

    const handleDeleteCourse = async (courseId) => {
        setCourses(prev => prev.filter(c => c._id !== courseId));
        await axios.delete(courseRoute, { 
            data: { courseId }
        })
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleAddCourse();
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            const res = await axios.get(courseRoute);
            setCourses(res.data);
        };

        fetchCourses();
    }, []);

    return (
        <div
            className="min-h-screen"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}
        >
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">

                    <h1 className="text-3xl font-bold text-white mb-8 text-center">
                        Courses
                    </h1>

                    {/* Add Course */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Enter course name..."
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                            <button
                                onClick={handleAddCourse}
                                disabled={!course.trim()}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Course List */}
                    <div className="space-y-3">
                        {courses.map((c) => (
                            <div
                                key={c._id}
                                className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between"
                            >
                                <span className="text-white font-medium">
                                    {c.name}
                                </span>

                                <button
                                    onClick={() => handleDeleteCourse(c._id)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {courses.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-slate-400">
                                    No courses yet. Add one above!
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Courses;