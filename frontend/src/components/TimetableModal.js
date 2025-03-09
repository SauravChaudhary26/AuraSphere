import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import React, { useEffect } from "react";
import axios from "axios";
import "./css/TimetableModal.css";

const TimetableModal = ({ toggleModal, val, onSubjectChange }) => {
   const userId = localStorage.getItem("userId");
   const [subList, setSubList] = React.useState([]);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const url = `http://localhost:8080/courses/${userId}`;
            const response = await axios.get(url);

            const temp = response.data.map((course) => {
               return course.name;
            });
            setSubList(temp);
         } catch (error) {
            console.error(error);
         }
      };
      fetchData();
   }, [userId]);

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
