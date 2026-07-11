import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { LoadingScreen } from "./components/ui";

const lazy = (factory) => {
  const C = React.lazy(factory);
  return (
    <Suspense fallback={<LoadingScreen />}>
      <C />
    </Suspense>
  );
};

const LandingPage = () => lazy(() => import("./views/LandingPage"));
const Login = () => lazy(() => import("./views/authentication/Login"));
const Signup = () => lazy(() => import("./views/authentication/Signup"));
const ForgotPassword = () => lazy(() => import("./views/ForgotPassword"));
const ResetPassword = () => lazy(() => import("./views/authentication/ResetPassword"));
const OAuthCallback = () => lazy(() => import("./views/authentication/OAuthCallback"));
const Dashboard = () => lazy(() => import("./views/Dashboard"));
const Courses = () => lazy(() => import("./views/Courses"));
const Timetable = () => lazy(() => import("./views/Timetable"));
const Attendance = () => lazy(() => import("./views/Attendance"));
const Assignments = () => lazy(() => import("./views/Assignment"));
const Challenges = () => lazy(() => import("./views/ChallengeFriend"));
const StudyRoom = () => lazy(() => import("./components/StudyRoom/StudyRoom"));
const Leaderboard = () => lazy(() => import("./views/Leaderboard"));
const Store = () => lazy(() => import("./views/Store"));
const Achievements = () => lazy(() => import("./views/Achievements"));
const Events = () => lazy(() => import("./views/Events"));
const Profile = () => lazy(() => import("./views/Profile"));
const Contact = () => lazy(() => import("./views/ContactUs"));
const ReportIssue = () => lazy(() => import("./views/ReportIssue"));
const ErrorPage = () => lazy(() => import("./views/Error"));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const withGoogle = (el) => <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{el}</GoogleOAuthProvider>;

const protectedRoute = (path, element) => ({
  path,
  element: <ProtectedRoute>{element}</ProtectedRoute>,
});

const router = createBrowserRouter([
  { path: "/", element: LandingPage() },
  { path: "/login", element: withGoogle(Login()) },
  { path: "/signup", element: withGoogle(Signup()) },
  { path: "/forgot-password", element: ForgotPassword() },
  { path: "/reset-password", element: ResetPassword() },
  { path: "/oauth", element: OAuthCallback() },
  { path: "/contact", element: Contact() },
  { path: "/report-issue", element: ReportIssue() },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: Dashboard() },
      { path: "/courses", element: Courses() },
      { path: "/timetable", element: Timetable() },
      { path: "/attendance", element: Attendance() },
      { path: "/assignment", element: Assignments() },
      { path: "/challenge", element: Challenges() },
      { path: "/studyroom", element: StudyRoom() },
      { path: "/leaderboard", element: Leaderboard() },
      { path: "/store", element: Store() },
      { path: "/achievements", element: Achievements() },
      { path: "/events", element: Events() },
      { path: "/profile", element: Profile() },
    ],
  },
  { path: "*", element: ErrorPage() },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={4000} theme="colored" newestOnTop />
    </>
  );
}
