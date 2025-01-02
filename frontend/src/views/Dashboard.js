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
      console.log(allGoals);
    } catch (error) {
      handleError(error);
    }
  }, [token]);

  useEffect(() => {
    console.log("useEffect was called");
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

  return (
    <>
      <div className="card-container">
        {allGoals.length > 0 ? (
          allGoals.map((goal, index) => (
            <ObjectiveCard
              key={index}
              handleDelete={handleDelete}
              _id={goal._id}
              title={goal.title}
              targetDate={goal.targetDate}
              description={goal.description}
            />
          ))
        ) : (
          <TypeWritter />
        )}
      </div>

      <button className="floating-button" onClick={() => setOpenModal(true)}>
        +
      </button>

      {openModal && <AddObjective handleCloseModal={handleCloseModal} />}
    </>
  );
};

export default Dashboard;
