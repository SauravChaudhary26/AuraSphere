import "./App.css";
import Login from "./views/authentication/Login";
import Signup from "./views/authentication/Signup";
import ForgotPassword from "./views/ForgotPassword";
import Home from "./views/Home";
import Profile from "./views/Profile";
import Events from "./views/Events";
import Points from "./views/Points";
import Attendance from "./views/Attendance";
import ButtonAppBar from "./components/taskbar/Navbar";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Dashboard from "./views/Dashboard";

const theme = createTheme({
    palette: {
        primary: {
            main: "#9c27b0",
        },
    },
});

// Default layout with navbar
const DefaultLayout = () => (
    <>
        <ButtonAppBar />
        <Outlet />
    </>
);

// Layout without navbar
const NoNavbarLayout = () => <Outlet />;

const App = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Home />,
        },
        {
            path: "/login",
            element: (
                <ThemeProvider theme={theme}>
                    <Login />
                </ThemeProvider>
            ),
        },
        {
            path: "/signup",
            element: <Signup />,
        },
        {
            element: <DefaultLayout />, // Navbar applied to all other pages
            children: [
                {
                    path: "/forgot-password",
                    element: <ForgotPassword />,
                },
                {
                    path: "/profile",
                    element: <Profile />,
                },
                {
                    path: "/events",
                    element: <Events />,
                },
                {
                    path: "/points",
                    element: <Points />,
                },
                {
                    path: "/attendance",
                    element: <Attendance />,
                },
                {
                    path: "/dashboard",
                    element: <Dashboard />,
                },
                // Add more pages here as needed
            ],
        },
    ]);

    return <RouterProvider router={router} />;
};

export default App;
