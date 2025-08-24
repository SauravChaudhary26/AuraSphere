import { React, useState } from "react";
import axios from "axios";
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
import ".././css/Login.css";
import Divider from "@mui/material/Divider";
import { Typography, Box, ThemeProvider, createTheme } from "@mui/material";
import { Facebook, Twitter, GitHub } from "@mui/icons-material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleError, handleSuccess } from "../../utils/ToastMessages";
import GoogleLogin from "./GoogleLogin.js";

function Login() {
   // show and hide password logic
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
      email: "",
      password: "",
   });

   const handleChange = (e) => {
      const { name, value } = e.target;
      const copyInfo = { ...userinfo };
      copyInfo[name] = value;
      setuserinfo(copyInfo);
   };

   //handling submit and sending data to backend
   const navigate = useNavigate();
   const handleSubmit = async (e) => {
      e.preventDefault();
      const { email, password } = userinfo;

      // Input validation
      if (!email || !password) {
         return handleError("Email and password are required");
      } else if (password.length < 5) {
         return handleError("Password should be greater than 4 characters");
      }

      try {
         const url = "https://aurasphere-rehd.onrender.com/auth/login";
         const response = await axios.post(url, { email, password });

         if (response && response.data) {
            const { message, success, jwtToken, name, userId } = response.data;

            if (success) {
               handleSuccess(message);
               console.log(jwtToken);
               localStorage.setItem("token", jwtToken);
               localStorage.setItem("loggedInUser", name);
               localStorage.setItem("userId", userId);

               // Redirect after delay
               setTimeout(() => navigate("/dashboard"), 1000);
            } else {
               handleError(response.data.error || "Unexpected error occurred");
            }
         } else {
            handleError("No response data received");
         }
      } catch (error) {
         if (error.response) {
            // Server responded with a status outside 2xx range
            handleError(error.response.data.message || "An error occurred");
         } else if (error.request) {
            // Request made but no response
            console.log(error.request);
            handleError("No response from server. Please try again later.");
         } else {
            // Error in setting up the request
            console.error("Error:", error.message);
            handleError("An error occurred while processing your request.");
         }
      }
   };

   const theme = createTheme({
      palette: {
         primary: {
            main: "#9c27b0",
         },
      },
   });

   return (
      <ThemeProvider theme={theme}>
         <div
            className="loginpage"
            style={{
               backgroundImage: `url(${require("../../assets/bg-3.png")})`,
               backgroundSize: "cover", // Adjusts the size of the image
               backgroundPosition: "center", // Centers the image
               width: "100vw",
               height: "100vh",
            }}
         >
            <div className="loginContainer">
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

                  {/* E-Mail Input Box Logic */}
                  <TextField
                     id="outlined-basic"
                     label="E-mail"
                     variant="outlined"
                     style={{ marginBottom: "20px", width: "90%" }}
                     name="email"
                     onChange={handleChange}
                     value={userinfo.email}
                  />

                  {/* Password Input Box Handler */}
                  <FormControl
                     sx={{ width: "90%", mb: "0px" }}
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
                        value={userinfo.password}
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

                  <span className="forgotP">
                     <NavLink
                        style={{ textDecoration: "none" }}
                        to="/forgot-password"
                     >
                        Forgot Password?
                     </NavLink>
                  </span>

                  <Button
                     variant="contained"
                     type="submit"
                     sx={{
                        backgroundColor: "rgb(107, 70, 224)", // primary color
                        color: "rgb(255, 255, 255)", // white text for contrast
                        "&:hover": {
                           backgroundColor: "rgb(85, 55, 180)", // slightly darker shade for hover effect
                        },
                        width: "90%",
                        mt: "20px",
                     }}
                  >
                     Login
                  </Button>

                  <div className="create-account-section">
                     <span>New on our platform?</span>
                     <span style={{ marginLeft: "4%" }}>
                        <NavLink
                           to="/signup"
                           style={{ textDecoration: "none" }}
                        >
                           Create an account
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
                        <GoogleLogin />
                     </Box>
                  </div>
               </form>
            </div>
            <ToastContainer />
         </div>
      </ThemeProvider>
   );
}

export default Login;
