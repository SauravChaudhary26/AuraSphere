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

// Dummy endpoints for now
const API_USERS_URL = "http://localhost:5000/api/users";
const API_CHALLENGES_URL = "http://localhost:5000/api/challenges";
const token = localStorage.getItem("token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

const ChallengeAFriend = () => {
   const [searchTerm, setSearchTerm] = useState("");
   const [searchResults, setSearchResults] = useState([]);
   const [receivedChallenges, setReceivedChallenges] = useState([]);
   const [ongoingChallenges, setOngoingChallenges] = useState([]);
   const [selectedFriend, setSelectedFriend] = useState(null);
   const [challengeForm, setChallengeForm] = useState({
      message: "",
      deadline: dayjs(),
      rated: false,
   });
   const userId = localStorage.getItem("userId");

   // Dummy search function - replace with an API call if needed
   const handleSearch = async () => {
      try {
         // Dummy data (replace with axios.get(API_USERS_URL) when ready)
         const dummyUsers = [
            { _id: "1", name: "Alice" },
            { _id: "2", name: "Bob" },
            { _id: "3", name: "Charlie" },
            { _id: "4", name: "David" },
         ];
         // Exclude the current user and filter by search term
         const filteredUsers = dummyUsers.filter(
            (user) =>
               user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
               user._id !== userId
         );
         setSearchResults(filteredUsers);
      } catch (error) {
         console.error("Error searching users", error);
         toast.error("Error searching users");
      }
   };

   // Open the challenge dialog for a selected friend
   const openChallengeDialog = (friend) => {
      setSelectedFriend(friend);
      setChallengeForm({
         message: "",
         deadline: dayjs(),
         rated: false,
      });
   };

   // Close the challenge dialog
   const handleCloseDialog = () => {
      setSelectedFriend(null);
   };

   // Dummy function to send a challenge (replace with API call)
   const handleSendChallenge = async () => {
      try {
         if (!selectedFriend || !selectedFriend._id || !challengeForm.message) {
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
         // Example API call:
         // await axios.post(API_CHALLENGES_URL, payload);
         toast.success("Challenge sent!");
         // Clear the form and close the dialog
         setChallengeForm({
            message: "",
            deadline: dayjs(),
            rated: false,
         });
         setSelectedFriend(null);
      } catch (error) {
         console.error("Error sending challenge", error);
         toast.error("Error sending challenge");
      }
   };

   // Dummy function to fetch challenges received (replace with API call)
   const fetchReceivedChallenges = async () => {
      try {
         // Replace with: const response = await axios.get(`${API_CHALLENGES_URL}/${userId}`);
         const dummyChallenges = [
            {
               _id: "c1",
               sender: { _id: "1", name: "Alice" },
               message: "Let's challenge each other!",
               deadline: dayjs().add(1, "day").toISOString(),
               rated: true,
            },
            {
               _id: "c2",
               sender: { _id: "3", name: "Charlie" },
               message: "Wanna play a challenge?",
               deadline: dayjs().add(2, "days").toISOString(),
               rated: false,
            },
         ];
         setReceivedChallenges(dummyChallenges);
      } catch (error) {
         console.error("Error fetching challenges", error);
         handleError("Error fetching challenges");
      }
   };

   // Accept a challenge: remove from received and add to ongoing
   const handleAcceptChallenge = (challengeId) => {
      const challenge = receivedChallenges.find((ch) => ch._id === challengeId);
      if (challenge) {
         setReceivedChallenges((prev) =>
            prev.filter((ch) => ch._id !== challengeId)
         );
         // Here you would also update the backend so that both users see the challenge as ongoing
         setOngoingChallenges((prev) => [...prev, challenge]);
         toast.success("Challenge accepted!");
      }
   };

   // Reject a challenge: simply remove from received
   const handleRejectChallenge = (challengeId) => {
      setReceivedChallenges((prev) =>
         prev.filter((ch) => ch._id !== challengeId)
      );
      toast.info("Challenge rejected.");
   };

   // Complete an ongoing challenge: remove it from ongoing challenges.
   // In production, you would notify the backend to remove the challenge for both users.
   const handleCompleteChallenge = (challengeId) => {
      setOngoingChallenges((prev) =>
         prev.filter((ch) => ch._id !== challengeId)
      );
      toast.success("Challenge completed!");
   };

   useEffect(() => {
      if (userId) {
         fetchReceivedChallenges();
      }
   }, [userId]);

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
                  onClick={handleSearch}
                  fullWidth
               >
                  Search
               </Button>
            </Grid>
         </Grid>
         <Typography variant="h6" gutterBottom>
            Search Results
         </Typography>
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
            ))
         )}

         {/* Challenge Dialog */}
         <Dialog open={Boolean(selectedFriend)} onClose={handleCloseDialog}>
            <DialogTitle>
               {selectedFriend
                  ? `Challenge ${selectedFriend.name}`
                  : "Challenge"}
            </DialogTitle>
            <DialogContent>
               <TextField
                  margin="dense"
                  label="Your Challenge"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={challengeForm.message}
                  onChange={(e) =>
                     setChallengeForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                     }))
                  }
               />
               <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                     label="Deadline"
                     value={challengeForm.deadline}
                     onChange={(newValue) =>
                        setChallengeForm((prev) => ({
                           ...prev,
                           deadline: newValue,
                        }))
                     }
                     slotProps={{
                        textField: { fullWidth: true, margin: "dense" },
                     }}
                  />
               </LocalizationProvider>
               <FormControlLabel
                  control={
                     <Checkbox
                        checked={challengeForm.rated}
                        onChange={(e) =>
                           setChallengeForm((prev) => ({
                              ...prev,
                              rated: e.target.checked,
                           }))
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

         {/* Challenges Received */}
         <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Challenges Received
         </Typography>
         {receivedChallenges.length === 0 ? (
            <Typography variant="body1">No challenges received.</Typography>
         ) : (
            receivedChallenges.map((challenge) => (
               <Card key={challenge._id} sx={{ mb: 2 }}>
                  <CardContent>
                     <Typography variant="body1">
                        Challenge from <strong>{challenge.sender.name}</strong>
                     </Typography>
                     <Typography variant="body2">
                        {challenge.message}
                     </Typography>
                     <Typography variant="body2">
                        Deadline:{" "}
                        {dayjs(challenge.deadline).format("MMM D, YYYY h:mm A")}
                     </Typography>
                     <Typography variant="caption">
                        {challenge.rated
                           ? "Rated Challenge"
                           : "Unrated Challenge"}
                     </Typography>
                     <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item>
                           <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() =>
                                 handleAcceptChallenge(challenge._id)
                              }
                           >
                              Accept
                           </Button>
                        </Grid>
                        <Grid item>
                           <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() =>
                                 handleRejectChallenge(challenge._id)
                              }
                           >
                              Reject
                           </Button>
                        </Grid>
                     </Grid>
                  </CardContent>
               </Card>
            ))
         )}

         {/* Ongoing Challenges */}
         <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Ongoing Challenges
         </Typography>
         {ongoingChallenges.length === 0 ? (
            <Typography variant="body1">No ongoing challenges.</Typography>
         ) : (
            ongoingChallenges.map((challenge) => (
               <Card key={challenge._id} sx={{ mb: 2 }}>
                  <CardContent>
                     <Typography variant="body1">
                        Ongoing challenge with{" "}
                        <strong>{challenge.sender.name}</strong>
                     </Typography>
                     <Typography variant="body2">
                        {challenge.message}
                     </Typography>
                     <Typography variant="body2">
                        Deadline:{" "}
                        {dayjs(challenge.deadline).format("MMM D, YYYY h:mm A")}
                     </Typography>
                     <Typography variant="caption">
                        {challenge.rated
                           ? "Rated Challenge"
                           : "Unrated Challenge"}
                     </Typography>
                     <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item>
                           <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() =>
                                 handleCompleteChallenge(challenge._id)
                              }
                           >
                              Complete Challenge
                           </Button>
                        </Grid>
                     </Grid>
                  </CardContent>
               </Card>
            ))
         )}
      </Container>
   );
};

export default ChallengeAFriend;
