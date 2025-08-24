import { useState, useEffect } from "react";
import axios from "axios";
import {
   Container,
   TextField,
   Button,
   Card,
   CardContent,
   Typography,
   IconButton,
   MenuItem,
   Grid,
   Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { handleError } from "../utils/ToastMessages";

const Assignments = () => {
   const userId = localStorage.getItem("userId"); // Assume userId is stored here
   const token = localStorage.getItem("token");

   // State for the assignment form
   const [assignmentForm, setAssignmentForm] = useState({
      title: "",
      description: "",
      course: "",
      deadline: dayjs(),
   });

   // State for courses (for the dropdown) and assignments list
   const [courses, setCourses] = useState([]);
   const [assignments, setAssignments] = useState([]);

	useEffect(() => {
		// Fetch courses from the backend (for the dropdown)
		const fetchCourses = async () => {
			try {
				const response = await axios.get(
					`/courses/${userId}`
				);
				setCourses(response.data);
			} catch (error) {
				console.error("Error fetching courses", error);
			}
		};

		// Fetch assignments from the backend
		const fetchAssignments = async () => {
			try {
				const response = await axios.get(
					`/assignments/${userId}`
				);
				setAssignments(response.data);
			} catch (error) {
				console.error("Error fetching assignments", error);
			}
		};

		if (userId) {
			fetchCourses();
			fetchAssignments();
		}
	}, [userId, token]);

   // Handle input change for text fields
   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setAssignmentForm((prev) => ({ ...prev, [name]: value }));
   };

   // Handle changes for the date/time picker
   const handleDeadlineChange = (newValue) => {
      setAssignmentForm((prev) => ({ ...prev, deadline: newValue }));
   };

   // Create a new assignment
   const handleAddAssignment = async () => {
      // Basic validation
      if (!assignmentForm.title || !assignmentForm.course) {
         handleError("Title and course are required.");
         return;
      }
      try {
         const payload = {
            userId,
            title: assignmentForm.title,
            description: assignmentForm.description,
            course: assignmentForm.course,
            deadline: assignmentForm.deadline.toISOString(),
         };

         const response = await axios.post('/assignments', payload);
         // Assume backend returns updated assignments list
         setAssignments(response.data);
         setAssignmentForm({
            title: "",
            description: "",
            course: "",
            deadline: dayjs(),
         });
      } catch (error) {
         console.error("Error adding assignment", error);
      }
   };

   // Toggle completion of an assignment. When completed, the assignment’s text is struck through.
   const handleCompleteAssignment = async (id, currentStatus) => {
      try {
         const response = await axios.patch(`/assignments/${id}`, {
            completed: !currentStatus,
         });
         // Update the assignment list with the modified assignment
         setAssignments(
            assignments.map((a) => (a._id === id ? response.data : a))
         );
      } catch (error) {
         console.error("Error updating assignment", error);
      }
   };

   // Delete an assignment
   const handleDeleteAssignment = async (id) => {
      try {
         await axios.delete(`/assignments/${id}`);
         // Assume backend returns the updated assignments list
         setAssignments(assignments.filter((a) => a._id !== id));
      } catch (error) {
         console.error("Error deleting assignment", error);
      }
   };

   return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
         <Typography variant="h4" component="h1" gutterBottom align="center">
            Assignments
         </Typography>
         {/* Assignment Creation Form */}
         <Card sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
               Create Assignment
            </Typography>
            <Grid container spacing={2}>
               <Grid item xs={12} sm={6}>
                  <TextField
                     fullWidth
                     label="Title"
                     name="title"
                     value={assignmentForm.title}
                     onChange={handleInputChange}
                     variant="outlined"
                  />
               </Grid>
               <Grid item xs={12} sm={6}>
                  <TextField
                     select
                     fullWidth
                     label="Course"
                     name="course"
                     value={assignmentForm.course}
                     onChange={handleInputChange}
                     variant="outlined"
                  >
                     {courses.map((course) => (
                        <MenuItem key={course._id} value={course.name}>
                           {course.name}
                        </MenuItem>
                     ))}
                  </TextField>
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Description"
                     name="description"
                     value={assignmentForm.description}
                     onChange={handleInputChange}
                     variant="outlined"
                     multiline
                     rows={3}
                  />
               </Grid>
               <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                     <DateTimePicker
                        label="Submission Deadline"
                        value={assignmentForm.deadline}
                        onChange={handleDeadlineChange}
                        slotProps={{
                           textField: {
                              fullWidth: true,
                              variant: "outlined",
                           },
                        }}
                     />
                  </LocalizationProvider>
               </Grid>
               <Grid item xs={12} sm={6} display="flex" alignItems="center">
                  <Button
                     variant="contained"
                     color="primary"
                     fullWidth
                     onClick={handleAddAssignment}
                  >
                     Create Assignment
                  </Button>
               </Grid>
            </Grid>
         </Card>

         {/* Assignments List */}
         <Typography variant="h5" component="h2" gutterBottom>
            Your Assignments
         </Typography>
         <Grid container spacing={2}>
            {assignments.map((assignment) => (
               <Grid item xs={12} key={assignment._id}>
                  <Card
                     sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: assignment.completed
                           ? "grey.200"
                           : "background.paper",
                     }}
                  >
                     <CardContent sx={{ flex: 1 }}>
                        <Typography
                           variant="h6"
                           sx={{
                              textDecoration: assignment.completed
                                 ? "line-through"
                                 : "none",
                           }}
                        >
                           {assignment.title}
                        </Typography>
                        <Typography
                           variant="body2"
                           sx={{
                              textDecoration: assignment.completed
                                 ? "line-through"
                                 : "none",
                           }}
                        >
                           {assignment.description}
                        </Typography>
                        <Typography
                           variant="caption"
                           sx={{
                              textDecoration: assignment.completed
                                 ? "line-through"
                                 : "none",
                           }}
                        >
                           Course: {assignment.course} | Deadline:{" "}
                           {dayjs(assignment.deadline).format(
                              "MMM D, YYYY h:mm A"
                           )}
                        </Typography>
                     </CardContent>
                     <Box
                        sx={{
                           display: "flex",
                           flexDirection: "column",
                           gap: 1,
                        }}
                     >
                        <IconButton
                           color="success"
                           onClick={() =>
                              handleCompleteAssignment(
                                 assignment._id,
                                 assignment.completed
                              )
                           }
                        >
                           <CheckIcon />
                        </IconButton>
                        <IconButton
                           color="error"
                           onClick={() =>
                              handleDeleteAssignment(assignment._id)
                           }
                        >
                           <DeleteIcon />
                        </IconButton>
                     </Box>
                  </Card>
               </Grid>
            ))}
         </Grid>
      </Container>
   );
};

export default Assignments;