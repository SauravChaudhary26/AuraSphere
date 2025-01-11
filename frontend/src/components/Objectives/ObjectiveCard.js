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

function formatDate(inputDate) {
   const date = new Date(inputDate);

   // Extract day, month, and year
   const day = date.getUTCDate();
   const month = date.toLocaleString("default", { month: "long" });
   const year = date.getUTCFullYear();

   // Determine the day suffix
   const daySuffix = (day) => {
      if (day >= 11 && day <= 13) return "th";
      switch (day % 10) {
         case 1:
            return "st";
         case 2:
            return "nd";
         case 3:
            return "rd";
         default:
            return "th";
      }
   };

   // Combine into the desired format
   return `${day}${daySuffix(day)} ${month}, ${year}`;
}

const ObjectiveCard = ({
   handleDelete,
   handleComplete,
   _id,
   description,
   title,
   targetDate,
}) => {
   const handleCardComplete = async () => {
      handleComplete(_id);
   };

   const handleCardDelete = () => {
      handleDelete(_id); // Call the handleDelete function passed from Dashboard
   };

   return (
      <Card
         variant="outlined"
         sx={{
            width: 300, // Fixed width
            height: 220, // Fixed height
            boxShadow: 2, // Subtle shadow
            borderRadius: 2, // Rounded corners
            position: "relative",
            display: "flex",
            flexDirection: "column", // Flex layout
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
         <CardContent
            sx={{
               flexGrow: 1, // Takes up remaining space
               overflow: "hidden",
            }}
         >
            <Typography variant="h6" component="div">
               {title}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "green" }}>
               {formatDate(targetDate)}
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
               {description}
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
               onPress={handleCardComplete}
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
               onClick={handleCardDelete} // Trigger handleDelete when clicked
            >
               <DeleteIcon />
            </IconButton>
         </CardActions>
      </Card>
   );
};

export default ObjectiveCard;
