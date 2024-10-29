import "./App.css";
import Login from "./views/Login";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./views/Signup";
import ForgotPassword from "./views/ForgotPassword";

const theme = createTheme({
    palette: {
        primary: {
            main: "#9c27b0", // a purple color code
        },
    },
});

const App = () => {
    const router = createBrowserRouter([
        {
            path: "/login",
            element: (
                <>
                    <ThemeProvider theme={theme}>
                        <Login />
                    </ThemeProvider>
                </>
            ),
        },
        {
            path: "/signup",
            element: <Signup />,
        },
        {
            path: "/forgot-password",
            element: <ForgotPassword />,
        },
    ]);

    return <RouterProvider router={router} />;
};

export default App;
