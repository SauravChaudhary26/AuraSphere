import React, { useState, useEffect } from "react";
import TimetableModal from "../components/TimetableModal";
import { Button } from "@mui/material";
import "./css/container.css";
import "./css/tailwind.css";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleError, handleSuccess } from "../utils/ToastMessages";

const Timetable = () => {
   // Replace this with the actual authenticated user's ID
   const userId = localStorage.getItem("token");

   const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
   const timeSlots = [
      "8 AM",
      "9 AM",
      "10 AM",
      "11 AM",
      "12 PM",
      "1 PM",
      "2 PM",
      "3 PM",
      "4 PM",
      "5 PM",
   ];

   const [timetable, setTimetable] = useState([]);
   const [editMode, setEditMode] = useState(false);
   const [modal, setModal] = useState(false);
   const [selectedCell, setSelectedCell] = useState(null);
   const [backupTimetable, setBackupTimetable] = useState([]);

   // Fetch the timetable on component mount
   useEffect(() => {
      const fetchTimetable = async () => {
         try {
            const token = localStorage.getItem("token");

            if (!token || !userId) {
               handleError("Please login to view your timetable");
               return;
            }

            const response = await axios.get(
               `http://localhost:8080/timetable/${userId}`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );
            const data = response.data;
            if (data.timetable) {
               // Add an id for each cell (for rendering)
               const mappedTimetable = data.timetable.map((cell, index) => ({
                  ...cell,
                  id: index + 1,
               }));
               setTimetable(mappedTimetable);
               setBackupTimetable(mappedTimetable);
            }
         } catch (error) {
            console.error("Error fetching timetable:", error);
         }
      };
      fetchTimetable();
   }, [userId]);

   const toggleModal = () => {
      setModal((prev) => !prev);
   };

   const handleCardClick = (cell) => {
      if (editMode) {
         setSelectedCell(cell);
         toggleModal();
      }
   };

   // Update the subject of a specific cell in state
   const handleSubjectChange = (newSubject) => {
      if (selectedCell) {
         const updatedTimetable = timetable.map((cell) =>
            cell.id === selectedCell.id
               ? { ...cell, subject: newSubject }
               : cell
         );
         setTimetable(updatedTimetable);
         setSelectedCell({ ...selectedCell, subject: newSubject });
      }
   };

   // Save the updated timetable to the backend
   const saveTimetable = async () => {
      try {
         const response = await fetch(
            `http://localhost:8080/timetable/${userId}`,
            {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               // Only send the timetable array (each cell with its subject)
               body: JSON.stringify({
                  timetable: timetable.map((cell) => ({
                     subject: cell.subject,
                  })),
               }),
            },
            {
               headers: {
                  Authorization: `Bearer ${userId}`,
               },
            }
         );
         const data = await response.json();
         if (response.ok) {
            handleSuccess("Timetable saved successfully");
            setBackupTimetable(timetable);
         } else {
            console.error("Error saving timetable:", data.error);
         }
      } catch (error) {
         console.error("Error saving timetable:", error);
      }
      setEditMode(false);
      setSelectedCell(null);
   };

   // Revert state to the backup timetable
   const cancelEdit = () => {
      setTimetable(backupTimetable);
      setEditMode(false);
      setSelectedCell(null);
   };

   return (
      <div className="outer flex flex-col items-center justify-center min-h-screen p-4">
         <div className="w-full overflow-x-auto">
            {/* Time Slot Headers */}
            <div className="flex justify-center min-w-[1000px]">
               <div className="min-w-[96px] flex-shrink-0"></div>
               <div className="grid grid-cols-10 gap-1">
                  {timeSlots.map((slot, idx) => (
                     <div
                        key={idx}
                        className="min-w-[96px] p-2 text-center font-semibold border bg-gray-100 flex-shrink-0"
                     >
                        {slot}
                     </div>
                  ))}
               </div>
            </div>

            {/* Day Labels & Timetable Cells */}
            <div className="flex justify-center min-w-[1000px]">
               <div className="flex flex-col">
                  {days.map((day, idx) => (
                     <div
                        key={idx}
                        className="h-16 min-w-[96px] flex items-center justify-center p-2 font-semibold border bg-gray-100 flex-shrink-0"
                     >
                        {day}
                     </div>
                  ))}
               </div>
               <div className="grid grid-cols-10 gap-1">
                  {timetable.map((cell) => (
                     <div
                        key={cell.id}
                        className="h-16 min-w-[96px] border flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors flex-shrink-0"
                        onClick={() => handleCardClick(cell)}
                     >
                        <span className="text-sm">{cell.subject}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Edit / Save / Cancel Buttons */}
         <div className="mt-4">
            {!editMode && (
               <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                     setBackupTimetable(timetable);
                     setEditMode(true);
                  }}
                  className="m-2 px-6 py-2 text-lg"
               >
                  Edit
               </Button>
            )}
            {editMode && (
               <div className="flex space-x-4 justify-center">
                  <Button
                     variant="contained"
                     color="success"
                     onClick={saveTimetable}
                     className="m-2 px-6 py-2 text-lg"
                  >
                     Save
                  </Button>
                  <Button
                     variant="outlined"
                     color="error"
                     onClick={cancelEdit}
                     className="m-2 px-6 py-2 text-lg"
                  >
                     Cancel
                  </Button>
               </div>
            )}
         </div>

         {/* Timetable Modal */}
         {modal && (
            <TimetableModal
               toggleModal={toggleModal}
               val={selectedCell ? selectedCell.subject : ""}
               onSubjectChange={handleSubjectChange}
            />
         )}
         <ToastContainer />
      </div>
   );
};

export default Timetable;
