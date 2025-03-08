import React, { useState } from "react";
import { Grid, TextField, Typography, Paper, Box } from "@mui/material";

const Tester = () => {
   const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
   const hours = Array.from({ length: 10 }, (_, i) => `${i + 9}:00`);

   const [schedule, setSchedule] = useState(
      days.reduce((acc, day) => {
         acc[day] = Array(10).fill("Break");
         return acc;
      }, {})
   );

   const handleChange = (day, hourIndex, value) => {
      setSchedule((prev) => ({
         ...prev,
         [day]: prev[day].map((item, index) =>
            index === hourIndex ? value : item
         ),
      }));
   };

   return (
      <Box sx={{ padding: 2 }}>
         <Typography variant="h4" gutterBottom>
            Weekly Timetable
         </Typography>
         <Grid container spacing={2}>
            <Grid item xs={2}>
               <Paper elevation={3}>
                  <Box p={2}>
                     <Typography variant="h6">Time</Typography>
                     {hours.map((hour) => (
                        <Typography key={hour}>{hour}</Typography>
                     ))}
                  </Box>
               </Paper>
            </Grid>
            {days.map((day) => (
               <Grid item xs={2} key={day}>
                  <Paper elevation={3}>
                     <Box p={2}>
                        <Typography variant="h6">{day}</Typography>
                        {hours.map((hour, index) => (
                           <TextField
                              key={index}
                              variant="outlined"
                              size="small"
                              fullWidth
                              value={schedule[day][index]}
                              onChange={(e) =>
                                 handleChange(day, index, e.target.value)
                              }
                              placeholder="Enter task"
                              margin="dense"
                           />
                        ))}
                     </Box>
                  </Paper>
               </Grid>
            ))}
         </Grid>
      </Box>
   );
};

export default Tester;
