import React from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";

import "./css/Taskbar.css";

function Taskbar() {
    return (
        <>
            <div className="taskbar">
                <div className="img-container">
                    <img src="/logo-main.png" alt="aiennn"></img>
                </div>
                <div className="button-container">
                    <Link to="/login">
                        <Button variant="contained" className="login-btn">
                            Login
                        </Button>
                    </Link>
                    <Link to="/signup">
                        <Button variant="outlined" className="signup-btn">
                            Signup
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    );
}

export default Taskbar;
