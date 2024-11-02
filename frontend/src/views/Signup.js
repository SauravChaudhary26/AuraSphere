import React from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import { NavLink } from "react-router-dom";
import "./css/Signup.css";
import Divider from "@mui/material/Divider";
import { Typography, Box } from "@mui/material";
import { Facebook, Twitter, GitHub } from "@mui/icons-material";
import GoogleIcon from "../assets/google-icon";

function Signup() {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    return (
        <div
            className="signup-page"
            style={{
                backgroundImage: `url(${require("../assets/bg-3.png")})`,
                backgroundSize: "cover", // Adjusts the size of the image
                backgroundPosition: "center", // Centers the image
                width: "100vw",
                height: "100vh",
            }}
        >
            <div className="signup-Container">
                <form>
                    {/* Logo image */}
                    <img
                        src={require("../assets/logo-design-2.png")}
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
                        variant="outlined"
                        style={{ marginBottom: "20px", width: "90%" }}
                    />

                    {/* E-Mail Input Box Logic */}
                    <TextField
                        required
                        id="email"
                        label="E-mail"
                        variant="outlined"
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
                        required
                        id="repeat-password"
                        label="Re-enter Password"
                        variant="outlined"
                        style={{ marginBottom: "10px", width: "90%" }}
                    />

                    <NavLink>
                        <Button
                            variant="contained"
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
                    </NavLink>
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
        </div>
    );
}

export default Signup;
