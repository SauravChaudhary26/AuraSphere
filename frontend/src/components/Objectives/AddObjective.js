import ReactDOM from "react-dom";
import { TextField, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";

import "./AddObjective.css";
import { useEffect } from "react";

const AddObjective = ({ handleCloseModal }) => {
    useEffect(() => {
        document.body.style.overflowY = "hidden";

        return () => {
            document.body.style.overflowY = "scroll";
        };
    }, []);

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
                />

                {/* Due date input */}

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={["MobileDatePicker"]}>
                        <DemoItem label="Due Date">
                            <MobileDatePicker defaultValue={dayjs()} />
                        </DemoItem>
                    </DemoContainer>
                </LocalizationProvider>

                {/* Submit button */}
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    style={{ marginTop: "20px" }}
                    onClick={handleCloseModal} // Close modal on button click
                >
                    Add Objective
                </Button>
            </div>
        </>,
        document.querySelector(".modals")
    );
};

export default AddObjective;
