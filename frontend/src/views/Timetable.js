import { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Save, Trash2 } from 'lucide-react';
import axios from "axios";
import Loader from "../components/Loader"

const Timetable = () => {
    const [courses, setCourses] = useState([]);
    const [timetable, setTimetable] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
        '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
        '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
    ];

    useEffect(() => {
        fetchCourses();
        fetchTimetable();
    }, [fetchTimetable, fetchCourses]);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/courses');
            const data = response.data;
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchTimetable = async () => {
        try {
            const response = await axios.get('/timetable');
            const data = response.data;
            setTimetable(data.schedule || {});
        } catch (error) {
            console.error('Error fetching timetable:', error);
            initializeEmptyTimetable();
        } finally {
            setLoading(false);
        }
    };

    const initializeEmptyTimetable = () => {
        const emptySchedule = {};
        days.forEach(day => {
            emptySchedule[day] = {};
            timeSlots.forEach(slot => {
                emptySchedule[day][slot] = null;
            });
        });
        setTimetable(emptySchedule);
    };

    const handleSlotChange = (day, slot, courseId) => {
        setTimetable(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [slot]: courseId || null
            }
        }));
    };

    const saveTimetable = async () => {
        setSaving(true);
        try {
            const res = await axios.post('/timetable', { schedule: timetable });

            if (res.status === 200) {
                alert('Timetable saved successfully!');
            } else {
                throw new Error('Failed to save timetable');
            }
        } catch (error) {
            console.error('Error saving timetable:', error);
            alert('Error saving timetable. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const clearTimetable = async () => {
        if (window.confirm('Are you sure you want to clear the entire timetable?')) {
            initializeEmptyTimetable();
            await axios.delete('/timetable');
        }
    };

    const getSelectedCourse = (courseId) => {
        return courses.find(course => course._id === courseId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
                                <p className="text-gray-600">Create and manage your weekly schedule</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={clearTimetable}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Clear All</span>
                            </button>
                            <button
                                onClick={saveTimetable}
                                disabled={saving}
                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                <span>{saving ? 'Saving...' : 'Save Timetable'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Timetable Grid */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="px-4 py-3 text-left font-semibold min-w-32">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4" />
                                            <span>Time / Day</span>
                                        </div>
                                    </th>
                                    {days.map(day => (
                                        <th key={day} className="px-4 py-3 text-center font-semibold min-w-48">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((slot, slotIndex) => (
                                    <tr key={slot} className={slotIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="px-4 py-3 border-r border-gray-200 font-medium text-gray-700 bg-blue-50">
                                            <div className="flex items-center space-x-2">
                                                <Clock className="h-4 w-4 text-blue-500" />
                                                <span>{slot}</span>
                                            </div>
                                        </td>
                                        {days.map(day => {
                                            const selectedCourseId = timetable[day]?.[slot];
                                            const selectedCourse = selectedCourseId ? getSelectedCourse(selectedCourseId) : null;

                                            return (
                                                <td key={`${day}-${slot}`} className="px-3 py-3 border-r border-gray-200">
                                                    <select
                                                        value={selectedCourseId || ''}
                                                        onChange={(e) => handleSlotChange(day, slot, e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors"
                                                    >
                                                        <option value="">Break</option>
                                                        {courses.map(course => (
                                                            <option key={course._id} value={course._id}>
                                                                {course.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* Display selected course info */}
                                                    {selectedCourse && (
                                                        <div className="mt-2 p-2 bg-blue-50 rounded-md border-l-4 border-blue-400">
                                                            <div className="flex items-center space-x-1">
                                                                <BookOpen className="h-3 w-3 text-blue-600" />
                                                                <span className="text-xs font-medium text-blue-800">
                                                                    {selectedCourse.name}
                                                                </span>
                                                            </div>
                                                            {selectedCourse.instructor && (
                                                                <p className="text-xs text-blue-600 mt-1">
                                                                    {selectedCourse.instructor}
                                                                </p>
                                                            )}
                                                            {selectedCourse.room && (
                                                                <p className="text-xs text-blue-500">
                                                                    Room: {selectedCourse.room}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Schedule Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="font-medium text-blue-800">Total Classes: </span>
                            <span className="text-blue-700">
                                {Object.values(timetable).reduce((total, daySchedule) =>
                                    total + Object.values(daySchedule || {}).filter(course => course).length, 0
                                )}
                            </span>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <span className="font-medium text-green-800">Available Courses: </span>
                            <span className="text-green-700">{courses.length}</span>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <span className="font-medium text-purple-800">Time Slots: </span>
                            <span className="text-purple-700">{timeSlots.length} per day</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;