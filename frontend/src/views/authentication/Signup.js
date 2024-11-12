import { React, useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import { NavLink, useNavigate } from "react-router-dom";
import ".././css/Signup.css";
import Divider from "@mui/material/Divider";
import { Typography, Box } from "@mui/material";
import { Facebook, Twitter, GitHub } from "@mui/icons-material";
import GoogleIcon from "../../assets/google-icon";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleError, handleSuccess } from "../../utils/ToastMessages";
import axios from "axios"; // Import axios

function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => event.preventDefault();
    const handleMouseUpPassword = (event) => event.preventDefault();

    // Input state for user information
    const [userinfo, setuserinfo] = useState({
        name: "",
        email: "",
        password: "",
        repeatPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setuserinfo((prev) => ({ ...prev, [name]: value }));
    };

    // Navigate hook for redirection
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, repeatPassword } = userinfo;

        if (!name || !email || !password) {
            return handleError("All fields are required");
        } else if (password.length < 5) {
            return handleError("Password must be at least 5 characters");
        } else if (password !== repeatPassword) {
            return handleError("Passwords don't match");
        }

        try {
            const url = "http://localhost:8080/auth/signup";
            const response = await axios.post(url, { name, email, password });

            const { message, success, error } = response.data;

            if (success) {
                handleSuccess(message);
                setTimeout(() => navigate("/dashboard"), 1000);
            } else if (error) {
                handleError(error.details[0]?.message || "Signup failed");
            } else {
                handleError(message || "Signup failed");
            }
        } catch (error) {
            handleError(error.response?.data?.message || "Server error");
        }
    };

    return (
        <div
            className="signup-page"
            style={{
                backgroundImage: `url(${require("../../assets/bg-3.png")})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100vw",
                height: "100vh",
            }}
        >
            <div className="signup-Container">
                <form onSubmit={handleSubmit}>
                    <img
                        src={require("../../assets/logo-design-2.png")}
                        alt="AuraSphere Logo"
                        style={{ width: "80px", marginBottom: "5px" }}
                    />
                    <div style={{ fontSize: "30px", marginBottom: "10px" }}>
                        Welcome To AuraSphere💫
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                        Please Sign-in to your account and start gaining Aura!!!
                    </div>
                    <TextField
                        required
                        id="name"
                        label="Name"
                        name="name"
                        variant="outlined"
                        onChange={handleChange}
                        style={{ marginBottom: "20px", width: "90%" }}
                    />
                    <TextField
                        required
                        id="email"
                        label="E-mail"
                        name="email"
                        variant="outlined"
                        onChange={handleChange}
                        style={{ marginBottom: "20px", width: "90%" }}
                    />
                    <FormControl
                        sx={{ width: "90%", mb: "20px" }}
                        variant="outlined"
                    >
                        <InputLabel htmlFor="outlined-adornment-password">
                            Password
                        </InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            onChange={handleChange}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        onMouseUp={handleMouseUpPassword}
                                        edge="end"
                                    >
                                        {showPassword ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Password"
                        />
                    </FormControl>
                    <TextField
                        id="repeat-password"
                        label="Re-enter Password"
                        variant="outlined"
                        type="password"
                        name="repeatPassword"
                        onChange={handleChange}
                        style={{ marginBottom: "10px", width: "90%" }}
                    />
                    <Button
                        variant="contained"
                        type="submit"
                        sx={{
                            backgroundColor: "purple",
                            color: "white",
                            "&:hover": { backgroundColor: "darkviolet" },
                            width: "90%",
                            mt: "20px",
                        }}
                    >
                        SignUp
                    </Button>
                    <div className="create-account-section">
                        <span>Already have an account?</span>
                        <span style={{ marginLeft: "4%" }}>
                            <NavLink
                                to="/login"
                                style={{ textDecoration: "none" }}
                            >
                                Sign in instead
                            </NavLink>
                        </span>
                    </div>
                    <Divider
                        variant="middle"
                        style={{ width: "100%", margin: "20px 0" }}
                    >
                        <Typography variant="caption" color="textSecondary">
                            or
                        </Typography>
                    </Divider>
                    <Box display="flex" justifyContent="center" gap={2}>
                        <IconButton
                            href="https://facebook.com"
                            style={{ color: "#3b5998" }}
                        >
                            <Facebook fontSize="large" />
                        </IconButton>
                        <IconButton
                            href="https://twitter.com"
                            style={{ color: "#1DA1F2" }}
                        >
                            <Twitter fontSize="large" />
                        </IconButton>
                        <IconButton
                            href="https://github.com"
                            style={{ color: "#333" }}
                        >
                            <GitHub fontSize="large" />
                        </IconButton>
                        <IconButton href="https://google.com">
                            <GoogleIcon width="32px" height="32px" />
                        </IconButton>
                    </Box>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}
export default Signup;
