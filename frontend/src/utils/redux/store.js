import { configureStore } from "@reduxjs/toolkit";
import pointsReducer from "./pointsSlice";

export const store = configureStore({
    reducer: {
        points: pointsReducer,
    },
});
