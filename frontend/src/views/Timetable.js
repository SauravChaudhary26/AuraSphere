import { useState, useEffect } from 'react';
import axios from 'axios';

const Timetable = () => {
    const [courses, setCourses] = useState([]);
    const [timetable, setTimetable] = useState({});
    const [loading, setLoading] = useState(true);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const timeSlots = [
        '09:00-10:00',
        '10:00-11:00',
        '11:00-12:00',
        '12:00-13:00',
        '13:00-14:00',
        '14:00-15:00',
        '15:00-16:00',
        '16:00-17:00'
    ];

    useEffect(() => {
        fetchCoursesAndTimetable();
    }, []);

    const fetchCoursesAndTimetable = async () => {
        try {
            // Note: In your actual implementation, replace these with your axios calls
			const userId = localStorage.getItem('userId');
            const [coursesResponse, timetableResponse] = await Promise.all([
                axios.get('/courses/' + userId),
                axios.get('/timetable')
            ]);

            setCourses(coursesResponse);
			console.log("courses: " , coursesResponse);
            
            // Convert timetable array to object for easier lookup
            const timetableObj = {};
            timetableResponse.data.forEach(entry => {
                const key = `${entry.day}-${entry.timeSlot}`;
                timetableObj[key] = entry;
            });
            setTimetable(timetableObj);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleSlotChange = async (day, timeSlot, courseId) => {
        try {
            const key = `${day}-${timeSlot}`;
            
            if (courseId === '') {
                // Remove the entry
                // In your actual implementation, use:
                // await axios.delete('/timetable', { data: { day, timeSlot } });
                console.log('Removing entry for', day, timeSlot);
                
                const newTimetable = { ...timetable };
                delete newTimetable[key];
                setTimetable(newTimetable);
            } else {
                // Add/Update the entry
                // In your actual implementation, use:
                // const response = await axios.post('/timetable', { day, timeSlot, courseId });
                console.log('Adding/updating entry for', day, timeSlot, courseId);
                
                const course = courses.find(c => c._id === courseId);
                const mockResponse = {
                    data: {
                        day,
                        timeSlot,
                        courseId: { _id: courseId, name: course.name, code: course.code }
                    }
                };
                
                setTimetable({
                    ...timetable,
                    [key]: mockResponse.data
                });
            }
        } catch (error) {
            console.error('Error updating timetable:', error);
            alert('Error updating timetable. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-800 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <div className="text-white text-lg font-medium">Loading your timetable...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-800 p-6">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        My Timetable
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-navy-600 to-blue-600 text-white">
                                    <th className="p-6 text-left font-bold text-lg border-r border-white/20">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                            <span>Time</span>
                                        </div>
                                    </th>
                                    {days.map((day, index) => (
                                        <th key={day} className={`p-6 text-center font-bold text-lg min-w-48 ${
                                            index < days.length - 1 ? 'border-r border-white/20' : ''
                                        }`}>
                                            <div className="flex flex-col items-center space-y-1">
                                                <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                                                <div className="w-8 h-0.5 bg-white/40 rounded-full"></div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {timeSlots.map((timeSlot, rowIndex) => (
                                    <tr key={timeSlot} className="hover:bg-white/5 transition-colors duration-200">
                                        <td className="p-6 font-bold text-white text-lg bg-gradient-to-r from-slate-800/50 to-transparent border-r border-white/10">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
                                                <span>{timeSlot}</span>
                                            </div>
                                        </td>
                                        {days.map((day, colIndex) => {
                                            const key = `${day}-${timeSlot}`;
                                            const currentEntry = timetable[key];
                                            
                                            return (
                                                <td key={key} className={`p-4 ${
                                                    colIndex < days.length - 1 ? 'border-r border-white/10' : ''
                                                }`}>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-white/15 cursor-pointer appearance-none"
                                                            value={currentEntry?.courseId?._id || ''}
                                                            onChange={(e) => handleSlotChange(day, timeSlot, e.target.value)}
                                                        >
                                                            <option value="" className="bg-slate-800 text-white">
                                                                Free
                                                            </option>
                                                            {courses.map(course => (
                                                                <option key={course._id} value={course._id} className="bg-slate-800 text-white">
                                                                    {course.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                        {currentEntry && (
                                                            <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white -translate-y-1 translate-x-1"></div>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 inline-block">
                        <p className="text-white/80 text-lg font-medium">
                            ✨ Select courses for each time slot to build your perfect schedule
                        </p>
                        <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-white/60">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span>Scheduled</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                                <span>Available</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Custom styles for webkit browsers */}
            <style jsx>{`
                select option {
                    background-color: rgb(30 41 59) !important;
                    color: white !important;
                }
                
                /* Custom scrollbar */
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: rgba(59, 130, 246, 0.5);
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(59, 130, 246, 0.7);
                }
            `}</style>
        </div>
    );
};

export default Timetable;