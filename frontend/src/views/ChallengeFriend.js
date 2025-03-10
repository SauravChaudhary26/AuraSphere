import React, { useState, useEffect } from "react";
import axios from "axios";
import {
   Container,
   TextField,
   Button,
   Card,
   CardContent,
   Typography,
   Grid,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   FormControlLabel,
   Checkbox,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { handleError } from "../utils/ToastMessages";

const API_USERS_URL = "http://localhost:8080/users";
const API_CHALLENGES_URL = "http://localhost:8080/challenges";

const token = localStorage.getItem("token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

const ChallengeAFriend = () => {
   const [searchTerm, setSearchTerm] = useState("");
   const [searchResults, setSearchResults] = useState([]);
   const [pendingChallenges, setPendingChallenges] = useState([]);
   const [ongoingChallenges, setOngoingChallenges] = useState([]);
   const [selectedFriend, setSelectedFriend] = useState(null);
   const [challengeForm, setChallengeForm] = useState({
      message: "",
      deadline: dayjs(),
      rated: false,
   });

   const userId = localStorage.getItem("userId");

   useEffect(() => {
      if (searchTerm.trim() !== "") {
         const fetchUsers = async () => {
            try {
               const res = await axios.get(API_USERS_URL, {
                  params: { search: searchTerm },
               });
               const filteredUsers = res.data.filter(
                  (user) => user._id !== userId
               );
               setSearchResults(filteredUsers);
            } catch (error) {
               toast.error("Error searching users");
            }
         };
         fetchUsers();
      } else {
         setSearchResults([]);
      }
   }, [searchTerm]);

   const fetchChallenges = async () => {
      try {
         const response = await axios.get(`${API_CHALLENGES_URL}`);
         const challenges = response.data;
         console.log(challenges);
         const pending = challenges.filter(
            (c) =>
               c.status === "pending" &&
               (c.receiver._id === userId || c.sender._id === userId)
         );
         const ongoing = challenges.filter(
            (c) =>
               c.status === "accepted" &&
               (c.receiver._id === userId || c.sender._id === userId)
         );

         setPendingChallenges(pending);
         setOngoingChallenges(ongoing);
      } catch (error) {
         handleError("Error fetching challenges");
      }
   };

   useEffect(() => {
      if (userId) {
         fetchChallenges();
      }
   }, [userId]);

   const openChallengeDialog = (friend) => {
      setSelectedFriend(friend);
      setChallengeForm({ message: "", deadline: dayjs(), rated: false });
   };

   const handleCloseDialog = () => {
      setSelectedFriend(null);
   };

   const handleSendChallenge = async () => {
      try {
         if (!selectedFriend || !challengeForm.message) {
            handleError("Please select a friend and enter a message");
            return;
         }

         const payload = {
            sender: userId,
            receiver: selectedFriend._id,
            message: challengeForm.message,
            deadline: challengeForm.deadline.toISOString(),
            rated: challengeForm.rated,
         };

         await axios.post(API_CHALLENGES_URL, payload);
         toast.success("Challenge sent!");
         setChallengeForm({ message: "", deadline: dayjs(), rated: false });
         setSelectedFriend(null);
         fetchChallenges();
      } catch (error) {
         toast.error("Error sending challenge");
      }
   };

   const handleAcceptChallenge = async (challengeId) => {
      try {
         await axios.put(`${API_CHALLENGES_URL}/${challengeId}/accept`);
         toast.success("Challenge accepted!");
         fetchChallenges();
      } catch (error) {
         toast.error("Error accepting challenge");
      }
   };

   const handleRejectChallenge = async (challengeId) => {
      try {
         await axios.delete(`${API_CHALLENGES_URL}/${challengeId}`);
         toast.success("Challenge rejected!");
         fetchChallenges();
      } catch (error) {
         toast.error("Error rejecting challenge");
      }
   };

   const handleCompleteChallenge = async (challengeId) => {
      try {
         await axios.put(`${API_CHALLENGES_URL}/${challengeId}/complete`);
         toast.success("Challenge marked as completed!");
         fetchChallenges();
      } catch (error) {
         toast.error("Error completing challenge");
      }
   };

   return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
         <Typography variant="h4" gutterBottom align="center">
            Challenge a Friend
         </Typography>

         <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
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
                  fullWidth
               >
                  Search
               </Button>
            </Grid>
         </Grid>

         {searchResults.length > 0 && (
            <>
               <Typography variant="h6" gutterBottom>
                  Search Results
               </Typography>
               {searchResults.map((user) => (
                  <Card key={user._id} sx={{ mb: 2 }}>
                     <CardContent
                        sx={{
                           display: "flex",
                           justifyContent: "space-between",
                        }}
                     >
                        <Typography variant="body1">{user.name}</Typography>
                        <Button
                           variant="outlined"
                           color="primary"
                           startIcon={<SendIcon />}
                           onClick={() => openChallengeDialog(user)}
                        >
                           Challenge
                        </Button>
                     </CardContent>
                  </Card>
               ))}
            </>
         )}

         <Dialog open={Boolean(selectedFriend)} onClose={handleCloseDialog}>
            <DialogTitle>Challenge {selectedFriend?.name}</DialogTitle>
            <DialogContent>
               <TextField
                  margin="dense"
                  label="Your Challenge"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={challengeForm.message}
                  onChange={(e) =>
                     setChallengeForm({
                        ...challengeForm,
                        message: e.target.value,
                     })
                  }
               />
               <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                     label="Deadline"
                     value={challengeForm.deadline}
                     onChange={(newValue) =>
                        setChallengeForm({
                           ...challengeForm,
                           deadline: newValue,
                        })
                     }
                  />
               </LocalizationProvider>
               <FormControlLabel
                  control={
                     <Checkbox
                        checked={challengeForm.rated}
                        onChange={(e) =>
                           setChallengeForm({
                              ...challengeForm,
                              rated: e.target.checked,
                           })
                        }
                     />
                  }
                  label="Rated Challenge"
               />
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseDialog}>Cancel</Button>
               <Button
                  onClick={handleSendChallenge}
                  variant="contained"
                  color="primary"
               >
                  Send Challenge
               </Button>
            </DialogActions>
         </Dialog>

         <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Ongoing Challenges
         </Typography>
         {ongoingChallenges.map((challenge) => (
            <Card key={challenge._id} sx={{ mb: 2 }}>
               <CardContent>
                  <Typography variant="body1">{challenge.message}</Typography>
                  <Button
                     variant="contained"
                     color="success"
                     onClick={() => handleCompleteChallenge(challenge._id)}
                  >
                     Complete Challenge
                  </Button>
               </CardContent>
            </Card>
         ))}

         <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Pending Challenges
         </Typography>
         {pendingChallenges.map((challenge) => (
            <Card key={challenge._id} sx={{ mb: 2 }}>
               <CardContent>
                  <Typography variant="body1">{challenge.message}</Typography>
                  <Button
                     variant="contained"
                     color="primary"
                     onClick={() => handleAcceptChallenge(challenge._id)}
                  >
                     Accept
                  </Button>
                  <Button
                     variant="contained"
                     color="error"
                     onClick={() => handleRejectChallenge(challenge._id)}
                  >
                     Reject
                  </Button>
               </CardContent>
            </Card>
         ))}
      </Container>
   );
};

export default ChallengeAFriend;
