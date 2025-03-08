import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import "./css/TimetableModal.css";

const TimetableModal = ({ toggleModal, val, onSubjectChange }) => {
   const subList = [
      "Math",
      "Science",
      "English",
      "History",
      "Geography",
      "Art",
      "Music",
      "PE",
      "Computing",
      "French",
      "Spanish",
      "German",
      "Italian",
   ];

   // When a new subject is selected, notify the parent
   const handleChange = (event, newValue) => {
      onSubjectChange(newValue);
   };

   return (
      <div className="modal-overlay" onClick={toggleModal}>
         <div className="modal" onClick={(e) => e.stopPropagation()}>
            <Autocomplete
               disablePortal
               options={subList}
               value={val} // Use "value" to make it a controlled component
               onChange={handleChange}
               renderInput={(params) => (
                  <TextField {...params} label="Select Subject" fullWidth />
               )}
            />
            <div className="modal-buttons mt-4 flex justify-end">
               <Button
                  variant="contained"
                  color="primary"
                  onClick={toggleModal}
                  className="px-6 py-2"
               >
                  Done
               </Button>
            </div>
         </div>
      </div>
   );
};

export default TimetableModal;
