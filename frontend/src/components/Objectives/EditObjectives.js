import { useState } from "react";
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

const EditObjectives = ({
   openModal,
   handleCloseModal,
   prevTitle,
   prevDescription,
   prevTarget,
}) => {
   const [initialVal, setInitialVal] = useState({
      title: prevTitle,
      description: prevDescription,
      targetDate: prevTarget,
   });

   return (
      <>
         <Dialog
            open={openModal}
            onClose={handleCloseModal}
            PaperProps={{
               component: "form",
               onSubmit: (event) => {
                  event.preventDefault();
                  const title = initialVal.title;
                  const targetDate = initialVal.targetDate;
                  const description = initialVal.description;
                  console.log(title, description, targetDate);
                  console.log(dayjs(targetDate));

                  handleCloseModal();
               },
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
               <Button type="submit">Subscribe</Button>
            </DialogActions>
         </Dialog>
      </>
   );
};

export default EditObjectives;
