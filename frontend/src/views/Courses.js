import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
   TextField,
   Button,
   List,
   ListItem,
   ListItemText,
   Typography,
   Box,
} from "@mui/material";

const Courses = () => {
   const [list, setList] = useState([]); // State to hold the list of items
   const [name, setName] = useState(""); // State to hold the current input value

   // Handle input change
   const handleChange = (event) => {
      setName(event.target.value);
   };

   // Handle adding a new item
   const handleAdd = () => {
      if (name.trim()) {
         // Check if the input is not empty
         const newItem = { id: uuidv4(), name }; // Create a new item with a unique ID
         setList((prevList) => [...prevList, newItem]); // Update the list state
         setName(""); // Clear the input field
      }
   };

   return (
      <Box sx={{ padding: 2 }}>
         <Typography variant="h4" gutterBottom>
            Add Items to List
         </Typography>
         <TextField
            variant="outlined"
            label="Item Name"
            value={name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            onKeyDown={(event) => {
               if (event.key === "Enter") {
                  handleAdd();
               }
            }}
         />
         <Button variant="contained" color="primary" onClick={handleAdd}>
            Add Item
         </Button>
         <List sx={{ marginTop: 2 }}>
            {list.map((item) => (
               <ListItem key={item.id}>
                  <ListItemText primary={item.name} />
               </ListItem>
            ))}
         </List>
      </Box>
   );
};

export default Courses;
