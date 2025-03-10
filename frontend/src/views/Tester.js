import React, { useState, useEffect } from "react";
import axios from "axios";
import {
   TextField,
   Button,
   Card,
   CardContent,
   Typography,
   Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

const API_USERS_URL = "http://localhost:8080/users"; // Your user search endpoint

const ChallengeAFriend = () => {
   const [searchTerm, setSearchTerm] = useState("");
   const [searchResults, setSearchResults] = useState([]);
   const userId = localStorage.getItem("userId");

   // Use a debounced search to avoid calling the API on every keystroke
   useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
         if (searchTerm.trim()) {
            axios
               .get(API_USERS_URL, {
                  params: { search: searchTerm },
                  headers: {
                     Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
               })
               .then((res) => {
                  const filtered = res.data.filter(
                     (user) => user._id !== userId
                  );
                  setSearchResults(filtered);
               })
               .catch((error) => {
                  console.error("Error fetching users", error);
                  toast.error("Error searching users");
               });
         } else {
            setSearchResults([]);
         }
      }, 300); // delay of 300ms

      return () => clearTimeout(delayDebounceFn);
   }, [searchTerm, userId]);

   return (
      <Grid container spacing={2} alignItems="center">
         <Grid item xs={9}>
            <TextField
               fullWidth
               label="Search users"
               variant="outlined"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </Grid>
         <Grid item xs={3}>
            <Button
               variant="contained"
               color="primary"
               startIcon={<SearchIcon />}
               // You might still include an onClick handler if needed
               fullWidth
            >
               Search
            </Button>
         </Grid>
         <Grid item xs={12}>
            {searchResults.length === 0 ? (
               <Typography variant="body1">No users found.</Typography>
            ) : (
               searchResults.map((user) => (
                  <Card key={user._id} sx={{ mb: 2 }}>
                     <CardContent
                        sx={{
                           display: "flex",
                           justifyContent: "space-between",
                           alignItems: "center",
                        }}
                     >
                        <Typography variant="body1">{user.name}</Typography>
                        {/* Your button to challenge the user */}
                        <Button variant="outlined" color="primary">
                           Challenge
                        </Button>
                     </CardContent>
                  </Card>
               ))
            )}
         </Grid>
      </Grid>
   );
};

export default ChallengeAFriend;
