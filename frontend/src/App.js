import "./App.css";
import Login from "./views/authentication/Login";
import Signup from "./views/authentication/Signup";
import ForgotPassword from "./views/ForgotPassword";
import LandingPage from "./views/LandingPage";
import Profile from "./views/Profile";
import Events from "./views/Events";
import Points from "./views/Points";
import Attendance from "./views/Attendance";
import Navbar from "./components/taskbar/Navbar";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Dashboard from "./views/Dashboard";
import Error from "./views/Error";

// Default layout with navbar
const DefaultLayout = () => (
    <>
        <Navbar />
        <Outlet />
    </>
);

const App = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <LandingPage />,
        },
        {
            path: "/login",
            element: <Login />,
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
        {
            path: "*",
            element: <Error />,
        },
    ]);

    return <RouterProvider router={router} />;
};

export default App;
