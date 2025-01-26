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
import Leaderboard from "./views/Leaderboard";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Dashboard from "./views/Dashboard";
import Error from "./views/Error";
import Tester from "./views/Tester";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Default layout with navbar
const DefaultLayout = () => (
   <>
      <Navbar />
      <Outlet />
   </>
);

const GoogleWrapper = () => (
   <GoogleOAuthProvider clientId="440611299930-ijj44k8fgi6o720hogpva50fl8acm2sv.apps.googleusercontent.com">
      <Login />
   </GoogleOAuthProvider>
);

const App = () => {
   const router = createBrowserRouter([
      {
         path: "/",
         element: <LandingPage />,
      },
      {
         path: "/login",
         element: <GoogleWrapper />,
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
            {
               path: "/leaderboard",
               element: <Leaderboard />,
            },
            // Add more pages here as needed
         ],
      },
      {
         path: "/test",
         element: <Tester />,
      },
      {
         path: "*",
         element: <Error />,
      },
   ]);

   return <RouterProvider router={router} />;
};

export default App;
