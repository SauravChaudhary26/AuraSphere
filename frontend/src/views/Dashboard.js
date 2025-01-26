import "./css/Dashboard.css";
import ObjectiveCard from "../components/Objectives/ObjectiveCard";
import { useState, useEffect, useCallback } from "react";
import AddObjective from "../components/Objectives/AddObjective";
import axios from "axios";
import { handleError } from "../utils/ToastMessages";
import TypeWritter from "../components/TypeWritter";

const Dashboard = () => {
   const token = localStorage.getItem("token");

   // Opening and closing of Add Objective modal
   const [openModal, setOpenModal] = useState(false);
   const handleCloseModal = () => setOpenModal(false);

   const [allGoals, setAllGoals] = useState([]);

   // Retrieving all goals of a user
   const getAllGoals = useCallback(async () => {
      const url = "http://localhost:8080/goals";

      try {
         const response = await axios.get(url, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         const allGoals = response.data;
         setAllGoals(allGoals);
      } catch (error) {
         handleError(error);
      }
   }, [token]);

   useEffect(() => {
      getAllGoals();
   }, [getAllGoals]);

   // Deleting a goal
   const handleDelete = async (goalId) => {
      const url = `http://localhost:8080/goals/${goalId}`;

      try {
         await axios.delete(url, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         // getAllGoals();
         setAllGoals((prevGoals) =>
            prevGoals.filter((goal) => goal._id !== goalId)
         );
      } catch (error) {
         handleError(error);
      }
   };

   //Submiting a goal
   const handleSubmit = async (formVals) => {
      const url = "http://localhost:8080/goals";

      try {
         const response = await axios.post(url, formVals, {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
         });

         if (response.status === 200 || response.status === 201) {
            console.log("Objective added successfully!");
         } else {
            console.log("An error occurred while adding the objective.");
         }
      } catch (error) {
         console.log("Failed to add objective. Please try again.", error);
      }

      getAllGoals();
   };

   //Completing a goal
   const handleComplete = async (_id) => {
      const url = `http://localhost:8080/goals/${_id}`;

      const data = {
         completed: true,
      };

      try {
         const response = await axios.put(url, data, {
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
         });
         if (response.status === 200) {
            console.log("Objective completed successfully!");
         } else {
            console.log("An error occurred while completing the objective.");
         }

         setAllGoals((prevGoals) =>
            prevGoals.filter((goal) => goal._id !== _id)
         );
      } catch (error) {
         console.log("Failed to complete objective. Please try again.", error);
      }
   };

   //Pinning and unpinning a goal
   const handlePin = async (_id) => {
      const url = "http://localhost:8080/goals/pin";

      try {
         const response = await axios.patch(
            url,
            {
               goalId: _id,
            },
            {
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         console.log(response);
         getAllGoals();
         // setAllGoals((allGoals) =>
         //    allGoals.map((goal) =>
         //       goal._id === _id ? { ...goal, isPinned: !goal.isPinned } : goal
         //    )
         // );
      } catch (error) {
         console.log("error while updating goal ", error);
      }
   };

   return (
      <>
         <div className="card-container">
            {allGoals.length > 0 ? (
               allGoals.map((goal, index) => (
                  <ObjectiveCard
                     key={index}
                     handleDelete={handleDelete}
                     handleComplete={handleComplete}
                     _id={goal._id}
                     title={goal.title}
                     targetDate={goal.targetDate}
                     description={goal.description}
                     isPinned={goal.isPinned}
                     getAllGoals={getAllGoals}
                     handlePin={handlePin}
                  />
               ))
            ) : (
               <TypeWritter />
            )}
         </div>

         <button className="floating-button" onClick={() => setOpenModal(true)}>
            +
         </button>

         {openModal && (
            <AddObjective
               handleCloseModal={handleCloseModal}
               handleSubmit={handleSubmit}
            />
         )}
      </>
   );
};

export default Dashboard;
