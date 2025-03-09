import { useState, useEffect } from "react";
import axios from "axios";
import {
   TextField,
   Button,
   Card,
   CardContent,
   IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = "http://localhost:8080/courses";
const token = localStorage.getItem("token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

const Courses = () => {
   const [course, setCourse] = useState("");
   const [courses, setCourses] = useState([]);
   const userId = localStorage.getItem("userId"); // Fetch userId from localStorage

   useEffect(() => {
      const fetchCourses = async () => {
         try {
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
      <div style={{ maxWidth: "500px", margin: "auto", padding: "16px" }}>
         <h2
            style={{
               fontSize: "1.25rem",
               fontWeight: "bold",
               marginBottom: "16px",
            }}
         >
            Your Courses
         </h2>
         <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
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
            >
               Add
            </Button>
         </div>
         <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {courses.map((c) => (
               <Card
                  key={c._id}
                  variant="outlined"
                  style={{
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "space-between",
                     padding: "8px",
                  }}
               >
                  <CardContent>{c.name}</CardContent>
                  <IconButton
                     onClick={() => handleDeleteCourse(c._id)}
                     color="error"
                  >
                     <DeleteIcon />
                  </IconButton>
               </Card>
            ))}
         </div>
      </div>
   );
};

export default Courses;
