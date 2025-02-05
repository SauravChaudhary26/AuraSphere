import React, { Suspense } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Loader from "./components/Loader"; // Import your custom loader
import Navbar from "./components/taskbar/Navbar";

// Lazy loading pages
const Login = React.lazy(() => import("./views/authentication/Login"));
const Signup = React.lazy(() => import("./views/authentication/Signup"));
const ForgotPassword = React.lazy(() => import("./views/ForgotPassword"));
const LandingPage = React.lazy(() => import("./views/LandingPage"));
const Profile = React.lazy(() => import("./views/Profile"));
const Events = React.lazy(() => import("./views/Events"));
const Points = React.lazy(() => import("./views/Points"));
const Attendance = React.lazy(() => import("./views/Attendance"));
const Dashboard = React.lazy(() => import("./views/Dashboard"));
const Leaderboard = React.lazy(() => import("./views/Leaderboard"));
const Error = React.lazy(() => import("./views/Error"));
const Tester = React.lazy(() => import("./views/Tester"));

// Default layout with navbar
const DefaultLayout = () => (
   <>
      <Navbar />
      <Outlet />
   </>
);

// Google OAuth Wrapper
const GoogleWrapper = () => (
   <GoogleOAuthProvider clientId="440611299930-ijj44k8fgi6o720hogpva50fl8acm2sv.apps.googleusercontent.com">
      <Suspense fallback={<Loader />}>
         <Login />
      </Suspense>
   </GoogleOAuthProvider>
);

const App = () => {
   const router = createBrowserRouter([
      {
         path: "/",
         element: (
            <Suspense fallback={<Loader />}>
               <LandingPage />
            </Suspense>
         ),
      },
      {
         path: "/login",
         element: <GoogleWrapper />,
      },
      {
         path: "/signup",
         element: (
            <Suspense fallback={<Loader />}>
               <Signup />
            </Suspense>
         ),
      },
      {
         element: <DefaultLayout />, // Navbar applied to all other pages
         children: [
            {
               path: "/forgot-password",
               element: (
                  <Suspense fallback={<Loader />}>
                     <ForgotPassword />
                  </Suspense>
               ),
            },
            {
               path: "/profile",
               element: (
                  <Suspense fallback={<Loader />}>
                     <Profile />
                  </Suspense>
               ),
            },
            {
               path: "/events",
               element: (
                  <Suspense fallback={<Loader />}>
                     <Events />
                  </Suspense>
               ),
            },
            {
               path: "/points",
               element: (
                  <Suspense fallback={<Loader />}>
                     <Points />
                  </Suspense>
               ),
            },
            {
               path: "/attendance",
               element: (
                  <Suspense fallback={<Loader />}>
                     <Attendance />
                  </Suspense>
               ),
            },
            {
               path: "/dashboard",
               element: (
                  <Suspense fallback={<Loader />}>
                     <Dashboard />
                  </Suspense>
               ),
            },
            {
               path: "/leaderboard",
               element: (
                  <Suspense fallback={<Loader />}>
                     <Leaderboard />
                  </Suspense>
               ),
            },
         ],
      },
      {
         path: "/test",
         element: (
            <Suspense fallback={<Loader />}>
               <Tester />
            </Suspense>
         ),
      },
      {
         path: "*",
         element: (
            <Suspense fallback={<Loader />}>
               <Error />
            </Suspense>
         ),
      },
   ]);

   return <RouterProvider router={router} />;
};

export default App;
