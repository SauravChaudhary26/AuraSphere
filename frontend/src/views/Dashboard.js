import "./css/Dashboard.css";
import ObjectiveCard from "../components/Objectives/ObjectiveCard";
import { useState } from "react";
import AddObjective from "../components/Objectives/AddObjective";
import axios from "axios";
import { handleError } from "../utils/ToastMessages";

const Dashboard = () => {
    const token = localStorage.getItem("token");

    //Opening and closing of Add note Modal
    const [openModal, setOpenModal] = useState(false);
    const handleCloseModal = () => {
        return setOpenModal(false);
    };

    //retreiving all goals of a user
    // const getAllGoals = async () => {
    //     const url = "http://localhost:8080/goals";

    //     try {
    //         const response = await axios.get(url, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });

    //         const allGoals = await response.data;
    //     } catch (error) {
    //         handleError(error);
    //     }
    // };

    //Function for deleting a notecard
    const handleDelete = async () => {
        // const url = "http://localhost:8080/goals";

        // try {
        //     const response = await axios.delete(url, {
        //         headers: {
        //             Authorization: `Bearer ${token}`,
        //         },
        //     });
        // } catch (error) {
        //     handleError(error);
        // }
    };

    return (
        <>
            <div className="card-container">
                {[...Array(6)].map((_, index) => (
                    <ObjectiveCard key={index} handleDelete={handleDelete} />
                ))}
            </div>
            <button
                className="floating-button"
                onClick={() => {
                    setOpenModal(true);
                }}
            >
                +
            </button>

            {openModal && <AddObjective handleCloseModal={handleCloseModal} />}
        </>
    );
};

export default Dashboard;
