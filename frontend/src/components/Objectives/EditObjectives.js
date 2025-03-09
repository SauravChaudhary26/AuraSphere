import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import axios from "axios";

const EditObjectives = ({
   openModal,
   handleCloseModal,
   prevTitle,
   prevDescription,
   prevTarget,
   _id,
   getAllGoals,
}) => {
   const [initialVal, setInitialVal] = useState({
      title: "",
      description: "",
      targetDate: dayjs(),
   });

   useEffect(() => {
      setInitialVal({
         title: prevTitle,
         description: prevDescription,
         targetDate: prevTarget,
      });
   }, [prevTitle, prevDescription, prevTarget]);

   const handleEdit = async () => {
      const title = initialVal.title;
      const targetDate = initialVal.targetDate;
      const description = initialVal.description;

      const url = `http://localhost:8080/goals/${_id}`;
      const token = localStorage.getItem("token");

      try {
         await axios.put(
            url,
            {
               title: title,
               description: description,
               targetDate: targetDate,
            },
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );
         getAllGoals();
         handleCloseModal();
      } catch (error) {
         console.log("error while submitting edit form ", error);
      }
   };

   return (
      <>
         <Dialog
            open={openModal}
            onClose={handleCloseModal}
            PaperProps={{
               component: "form",
            }}
         >
            <DialogTitle>Edit your objective</DialogTitle>
            <DialogContent>
               <DialogContentText>
                  Edits might take some time to reflect so hold your horses!
               </DialogContentText>
               <TextField
                  required
                  margin="dense"
                  id="title"
                  name="title"
                  label="title"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={initialVal.title}
                  onChange={(e) =>
                     setInitialVal({ ...initialVal, title: e.target.value })
                  }
               />
               <TextField
                  required
                  margin="dense"
                  id="description"
                  name="description"
                  label="description"
                  type="text"
                  fullWidth
                  multiline
                  rows={3}
                  variant="standard"
                  value={initialVal.description}
                  onChange={(e) =>
                     setInitialVal({
                        ...initialVal,
                        description: e.target.value,
                     })
                  }
               />
               <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DesktopDatePicker"]}>
                     <DemoItem label="Target Date">
                        <DatePicker
                           value={dayjs(initialVal.targetDate)} // Bind the value to state
                           onChange={(newValue) => {
                              setInitialVal({
                                 ...initialVal,
                                 targetDate: newValue, // Update state when the date changes
                              });
                           }}
                           slotProps={{ textField: { variant: "outlined" } }}
                        />
                     </DemoItem>
                  </DemoContainer>
               </LocalizationProvider>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseModal}>Cancel</Button>
               <Button onClick={handleEdit}>Save</Button>
            </DialogActions>
         </Dialog>
      </>
   );
};

export default EditObjectives;
