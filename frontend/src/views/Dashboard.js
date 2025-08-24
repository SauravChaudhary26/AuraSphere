import "./css/Dashboard.css";
import ObjectiveCard from "../components/Objectives/ObjectiveCard";
import { useState, useEffect, useCallback } from "react";
import AddObjective from "../components/Objectives/AddObjective";
import axios from "axios";
import { handleError } from "../utils/ToastMessages";
import TypeWritter from "../components/TypeWritter";
import { useDispatch } from "react-redux";
import { fetchPoints } from "../utils/redux/pointsSlice";

const Dashboard = () => {
    const token = localStorage.getItem("token");
	const dispatch = useDispatch();

    // Opening and closing of Add Objective modal
    const [openModal, setOpenModal] = useState(false);
    const handleCloseModal = () => setOpenModal(false);

    const [allGoals, setAllGoals] = useState([]);

    // Retrieving all goals of a user
    const getAllGoals = useCallback(async () => {
        const url = "https://aurasphere-rehd.onrender.com/goals";

        try {
            const response = await axios.get(url);

            const allGoals = response.data;
			console.log(allGoals);
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
        const url = `https://aurasphere-rehd.onrender.com/goals/${goalId}`;

        try {
            await axios.delete(url);

            // getAllGoals();
            setAllGoals((prevGoals) =>
                prevGoals.filter((goal) => goal._id !== goalId)
            );
        } catch (error) {
            handleError(error);
        }
    };

    // Submiting a goal
    const handleSubmit = async (formVals) => {
        const url = "https://aurasphere-rehd.onrender.com/goals";

        try {
            const response = await axios.post(url, formVals);

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

    // Completing a goal
    const handleComplete = async (_id) => {
        const url = `https://aurasphere-rehd.onrender.com/goals/complete/${_id}`;

        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                console.log("Objective completed successfully!");
            } else {
                console.log("An error occurred while completing the objective.");
            }

			dispatch(fetchPoints());

            setAllGoals((prevGoals) =>
                prevGoals.filter((goal) => goal._id !== _id)
            );
        } catch (error) {
            console.log("Failed to complete objective. Please try again.", error);
        }
    };

    // Pinning and unpinning a goal
    const handlePin = async (_id) => {
        const url = "https://aurasphere-rehd.onrender.com/goals/pin";

        try {
            const response = await axios.patch(
                url,
                {
                    goalId: _id,
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

            <button
                className="floating-button"
                onClick={() => setOpenModal(true)}
            >
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