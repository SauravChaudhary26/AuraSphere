import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import PushPinIcon from "@mui/icons-material/PushPin";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";

const ObjectiveCard = ({
    title,
    duedate,
    content,
    isPinned,
    handleDelete,
    handleEdit,
    handlePin,
}) => {
    return (
        <Card
            variant="outlined"
            sx={{
                width: 300, // Fixed width
                height: 220, // Fixed height
                boxShadow: 2, // Subtle shadow
                borderRadius: 2, // Rounded corners
                position: "relative",
                padding: 1,
            }}
        >
            {/* Pin Button */}
            <IconButton
                sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "grey", // Default grey color
                    "&:hover": { color: "#2B85FF" }, // Blue on hover
                }}
                aria-label="pin"
            >
                <PushPinIcon />
            </IconButton>

            {/* Card Content */}
            <CardContent>
                <Typography variant="h6" component="div">
                    Card Title
                </Typography>
                <Typography sx={{ fontSize: 12, color: "green" }}>
                    Due Date: Jan 25, 2024
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        mt: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 5,
                    }}
                >
                    This is the content section where a brief description or
                    note can be displayed. This is an example.
                </Typography>
            </CardContent>

            {/* Bottom Actions */}
            <CardActions
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "8px 16px",
                }}
            >
                <AwesomeButton
                    type="secondary"
                    style={{
                        minWidth: "120px",
                        marginRight: "35px",
                    }}
                >
                    Completed!!!
                </AwesomeButton>
                <IconButton
                    sx={{
                        color: "green",
                    }}
                    aria-label="edit"
                >
                    <EditIcon />
                </IconButton>
                <IconButton
                    sx={{
                        color: "red",
                    }}
                    aria-label="delete"
                >
                    <DeleteIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default ObjectiveCard;
