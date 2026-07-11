import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./utils/redux/store";
import App from "./App";
import { SocketProvider } from "./contexts/SocketContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./lib/http"; // configure axios defaults + interceptors before first request
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
