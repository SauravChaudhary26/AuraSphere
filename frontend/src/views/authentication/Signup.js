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

function Signup() {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    //handling input fields
    const [userinfo, setuserinfo] = useState({
        name: "",
        email: "",
        password: "",
        repeatPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        const copyInfo = { ...userinfo };
        copyInfo[name] = value;
        setuserinfo(copyInfo);
    };

    //signup api logic
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        console.log("submit was pressed");

        e.preventDefault();
        const { name, email, password, repeatPassword } = userinfo;

        if (!name || !email || !password) {
            return handleError("All fields are required");
        } else if (password.length < 5)
            return handleError("Password must be of minimum 5 characters");
        else if (password !== repeatPassword)
            return handleError("Password fields don't match");
        try {
            const url = "http://localhost:8080/auth/signup";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            const result = await response.json();
            const { message, success, error } = result;

            if (success) {
                handleSuccess(message);
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <div
            className="signup-page"
            style={{
                backgroundImage: `url(${require("../../assets/bg-3.png")})`,
                backgroundSize: "cover", // Adjusts the size of the image
                backgroundPosition: "center", // Centers the image
                width: "100vw",
                height: "100vh",
            }}
        >
            <div className="signup-Container">
                <form onSubmit={handleSubmit}>
                    {/* Logo image */}
                    <img
                        src={require("../../assets/logo-design-2.png")}
                        alt="AuraSphere Logo"
                        style={{ width: "80px", marginBottom: "5px" }}
                    />

                    {/* Initial Lines Begins */}
                    <div style={{ fontSize: "30px", marginBottom: "10px" }}>
                        Welcome To AuraSphere💫
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                        Please Sign-in to your account and start gaining Aura!!!
                    </div>
                    {/* Initial Lines Ends */}
                    <TextField
                        required
                        id="name"
                        label="Name"
                        name="name"
                        variant="outlined"
                        onChange={handleChange}
                        style={{ marginBottom: "20px", width: "90%" }}
                    />

                    {/* E-Mail Input Box Logic */}
                    <TextField
                        required
                        id="email"
                        label="E-mail"
                        name="email"
                        variant="outlined"
                        onChange={handleChange}
                        style={{ marginBottom: "20px", width: "90%" }}
                    />

                    {/* Password Input Box Handler */}
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
                                        aria-label={
                                            showPassword
                                                ? "hide the password"
                                                : "display the password"
                                        }
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
                            backgroundColor: "purple", // purple background
                            color: "white", // white text color
                            "&:hover": {
                                backgroundColor: "darkviolet", // darker purple on hover
                            },
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
                    {/* <Divider>or</Divider> */}
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        {/* Divider with text "or" */}
                        <Divider
                            variant="middle"
                            style={{ width: "100%", margin: "20px 0" }}
                        >
                            <Typography variant="caption" color="textSecondary">
                                or
                            </Typography>
                        </Divider>

                        {/* Social Media Icons */}
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
                    </div>
                </form>
            </div>
            <ToastContainer></ToastContainer>
        </div>
    );
}

export default Signup;
