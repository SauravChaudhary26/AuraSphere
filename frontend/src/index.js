import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./utils/redux/store";
import App from "./App";
import { SocketProvider } from "./contexts/SocketContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<SocketProvider>
		<Provider store={store}>
			<App />
		</Provider>
	</SocketProvider>
);
