import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/http";

// Fetch the current aura balance. Backend returns { points: number }.
export const fetchPoints = createAsyncThunk("points/fetchPoints", async () => {
  const { data } = await api.get("/points");
  return typeof data === "number" ? data : data.points ?? 0;
});

const pointsSlice = createSlice({
  name: "points",
  initialState: { total: 0, status: "idle", error: null },
  reducers: {
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
