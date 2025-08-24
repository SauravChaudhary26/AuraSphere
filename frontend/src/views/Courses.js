import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    IconButton,
    Stack,
    Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = "/courses";

const Courses = () => {
   const [course, setCourse] = useState("");
   const [courses, setCourses] = useState([]);
   const userId = localStorage.getItem("userId"); // Fetch userId from localStorage

   useEffect(() => {
      const fetchCourses = async () => {
         try {
            console.log("fetching courses");
            const response = await axios.get(`${API_URL}/${userId}`);
            setCourses(response.data);
         } catch (error) {
            console.error("Error fetching courses", error);
         }
      };

      if (userId) fetchCourses();
   }, [userId]);

   const handleAddCourse = async () => {
      if (course.trim() !== "" && !courses.some((c) => c.name === course)) {
         try {
            const response = await axios.post(API_URL, {
               userId,
               name: course,
            });
            setCourses(response.data); // Update courses with new list
            setCourse("");
         } catch (error) {
            console.error("Error adding course", error);
         }
      }
   };

   const handleDeleteCourse = async (courseId) => {
      try {
         const response = await axios.delete(API_URL, {
            data: { userId, courseId },
         });
         setCourses(response.data); // Update courses after deletion
      } catch (error) {
         console.error("Error deleting course", error);
      }
   };

   const handleKeyPress = (e) => {
      if (e.key === "Enter") {
         handleAddCourse();
      }
   };

   return (
    <Box
        sx={{
            maxWidth: 600,
            mx: "auto",
            my: 3,
            p: 3,
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
        }}
    >
        <Typography variant="h5" fontWeight="bold" mb={2}>
            Your Courses
        </Typography>

        <Stack direction="row" spacing={2} mb={3}>
            <TextField
                fullWidth
                label="Enter course name"
                variant="outlined"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddCourse}
                sx={{ whiteSpace: "nowrap", px: 3 }}
            >
                Add
            </Button>
        </Stack>

        <Stack spacing={2}>
            {courses.map((c) => (
                <Paper
                    key={c._id}
                    variant="outlined"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        borderRadius: 2,
                        transition: "0.3s",
                        ":hover": {
                            boxShadow: 4,
                            backgroundColor: "grey.100",
                        },
                    }}
                >
                    <Typography variant="body1" fontWeight={500}>
                        {c.name}
                    </Typography>
                    <IconButton
                        onClick={() => handleDeleteCourse(c._id)}
                        color="error"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Paper>
            ))}
        </Stack>
    </Box>
   );
};

export default Courses;