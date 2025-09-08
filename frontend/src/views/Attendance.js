import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, BarChart3, BookOpen } from 'lucide-react';
import axios from 'axios';

const AttendanceTracker = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [attendance, setAttendance] = useState([]);
    const [showMarkForm, setShowMarkForm] = useState(false);
    const [newAttendance, setNewAttendance] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'present'
    });

    useEffect(() => {
        //API call to fetch courses
        const fetchCourses = async () => {
            const response = await axios.get('/courses');
            const data = response.data;
            setCourses(data);
            if (data.length > 0) {
                setSelectedCourse(data[0]._id);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            // API call to fetch attendance
            const fetchAttendance = async () => {
                 const response = await axios.get(`/attendance/${selectedCourse}`);
                const data = response.data;
                setAttendance(data);
            }
           fetchAttendance();
        }
    }, [selectedCourse]);

    const handleMarkAttendance = async () => {
        if(!newAttendance.date || !newAttendance.status || !selectedCourse) return;

        const newEntry = {
            ...newAttendance,
            courseId: selectedCourse,
        };

        const response = await axios.post(`/attendance/`, newEntry);
        const data = response.data;
        setAttendance(prev => [data, ...prev]);

        setShowMarkForm(false);
        setNewAttendance({
            date: new Date().toISOString().split('T')[0],
            status: 'present'
        });
    };

    const calculateStats = () => {
        if (attendance.length === 0) return { percentage: 0, present: 0, total: 0 };

        const present = attendance.filter(record => record.status === 'present').length;
        const total = attendance.length;
        const percentage = Math.round((present / total) * 100);

        return { percentage, present, total };
    };

    const stats = calculateStats();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-900 p-3 rounded-lg">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
                                <p className="text-gray-600">Monitor your class attendance</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowMarkForm(!showMarkForm)}
                            className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                        >
                            Mark Attendance
                        </button>
                    </div>
                </div>

                {/* Course Selection and Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Course
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        >
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Attendance Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.percentage}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Classes Attended</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.present}/{stats.total}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mark Attendance Form */}
                {showMarkForm && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Attendance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={newAttendance.date}
                                    onChange={(e) => setNewAttendance(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={newAttendance.status}
                                    onChange={(e) => setNewAttendance(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                </select>
                            </div>
                            <div className="flex items-end space-x-2">
                                <button
                                    onClick={handleMarkAttendance}
                                    className="bg-blue-900 text-white px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setShowMarkForm(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance Records */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                        <p className="text-gray-600">
                            {selectedCourse && courses.find(c => c._id === selectedCourse)?.name}
                        </p>
                    </div>

                    <div className="p-6">
                        {attendance.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No attendance records found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {attendance.map(record => (
                                    <div
                                        key={record._id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                                    >
                                        <div className="flex items-center space-x-3">
                                            {record.status === 'present' ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600" />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(record.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                record.status === 'present'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {record.status === 'present' ? 'Present' : 'Absent'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTracker;