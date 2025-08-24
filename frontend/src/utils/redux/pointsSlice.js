import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk to fetch latest points from backend
export const fetchPoints = createAsyncThunk("points/fetchPoints", async () => {
    const response = await axios.get("/points");
	console.log(response)
    return response.data;
});

const pointsSlice = createSlice({
    name: "points",
    initialState: {
        total: 0,
        status: "idle", // idle | loading | succeeded | failed
        error: null,
    },
    reducers: {
        //direct setter for manual updates
        setPoints: (state, action) => {
            state.total = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPoints.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchPoints.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.total = action.payload;
            })
            .addCase(fetchPoints.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export const { setPoints } = pointsSlice.actions;
export default pointsSlice.reducer;