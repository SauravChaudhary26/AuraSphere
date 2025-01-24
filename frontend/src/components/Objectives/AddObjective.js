import ReactDOM from "react-dom";
import { useState, useEffect } from "react";
import { TextField, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import "./AddObjective.css";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const AddObjective = ({ handleCloseModal, handleSubmit }) => {
   useEffect(() => {
      document.body.style.overflowY = "hidden";

      return () => {
         document.body.style.overflowY = "scroll";
      };
   }, []);

   let [formVals, setFormVals] = useState({
      title: "",
      description: "",
      targetDate: dayjs().tz("Asia/Kolkata"), // Set default to current IST time
   });

   const handleSubmitCall = async () => {
      // Convert the targetDate to IST before submission
      const formWithISTDate = {
         ...formVals,
         targetDate: formVals.targetDate.tz("Asia/Kolkata").format(),
      };
      handleSubmit(formWithISTDate);
      handleCloseModal();
      console.log(formVals.targetDate.tz("Asia/Kolkata").format());
   };

   return ReactDOM.createPortal(
      <>
         {/* Dark overlay for modal background */}
         <div className="modal-wrapper" onClick={handleCloseModal}></div>

         {/* Modal content */}
         <div className="modal">
            {/* Title input */}
            <IconButton
               aria-label="close"
               onClick={handleCloseModal}
               className="close-button"
               id="close-button"
               size="small"
            >
               <CloseIcon />
            </IconButton>
            <TextField
               id="title"
               label="Title"
               variant="standard"
               fullWidth
               margin="normal"
               onChange={(e) =>
                  setFormVals({ ...formVals, title: e.target.value })
               }
            />
            {/* Description input */}
            <TextField
               id="description"
               label="Description"
               multiline
               rows={4}
               variant="standard"
               fullWidth
               margin="normal"
               sx={{ marginBottom: "30px" }}
               onChange={(e) =>
                  setFormVals({ ...formVals, description: e.target.value })
               }
            />
            {/* Target date input */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
               <DemoContainer components={["DesktopDatePicker"]}>
                  <DemoItem label="Target Date">
                     <DatePicker
                        value={formVals.targetDate}
                        onChange={(newValue) => {
                           setFormVals({
                              ...formVals,
                              targetDate: dayjs(newValue).tz("Asia/Kolkata"),
                           });
                           console.log(
                              dayjs(newValue).tz("Asia/Kolkata").toString()
                           );
                        }}
                        slotProps={{ textField: { variant: "outlined" } }}
                     />
                  </DemoItem>
               </DemoContainer>
            </LocalizationProvider>
            {/* Submit button */}
            <Button
               variant="contained"
               color="primary"
               fullWidth
               style={{ marginTop: "20px" }}
               onClick={handleSubmitCall}
            >
               Add Objective
            </Button>
         </div>
      </>,
      document.querySelector(".modals")
   );
};

export default AddObjective;
