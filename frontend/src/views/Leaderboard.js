import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import axios from "axios";
import { Typography } from "@mui/material";
import "./css/Leaderboard.css";

const Leaderboard = () => {
  const [userData, setUserData] = useState([]); // State to store fetched data
  const [error, setError] = useState(null); // State to handle errors

  const fetchData = async () => {
    try {
      const url = "http://localhost:8080/leaderboard";
      const token = localStorage.getItem("token"); // Get token from localStorage
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token in Authorization header
        },
      });

      const { message, success, userData } = response.data;
      if (success) {
        setUserData(userData); // Update state with fetched data
      } else {
        console.error("Failed to fetch leaderboard:", message);
        setError(message);
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      setError(error.message);
    }
  };

  // Useeffect to call for the leaderboard information
  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>; // Render error message if fetch fails
  }

  return (
    <div className="leaderboard-container">
      <TableContainer
        component={Paper}
        className="table-container"
        style={{ width: "50%" }}
        sx={{
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)", // Enhanced shadow
          borderRadius: "16px", // Rounded corners
          border: "1px solid rgba(0, 0, 0, 0.1)", // Light border for emphasis
          background: "linear-gradient(to bottom, #ffffff, #f9f9f9)", // Subtle gradient
        }}
      >
        <Table aria-label="leaderboard table">
          <TableHead>
            <TableRow className="table-head-row">
              <TableCell align="center" className="table-header">
                <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                  Rank
                </Typography>
              </TableCell>
              <TableCell align="center" className="table-header">
                <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                  Name
                </Typography>
              </TableCell>
              <TableCell align="center" className="table-header">
                <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                  Aura Points
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userData.map((row, index) => (
              <TableRow
                key={index} // Use index if rank is not unique
                className="table-row"
                sx={{ height: 60 }}
              >
                <TableCell align="center" className="table-cell">
                  {index + 1}
                </TableCell>
                <TableCell align="center" className="table-cell">
                  {row.name}
                </TableCell>
                <TableCell align="center" className="table-cell">
                  {row.aura}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Leaderboard;
