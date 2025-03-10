import { useState } from "react";
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
import EditObjectives from "./EditObjectives";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

function formatDate(inputDate) {
   const date = dayjs(inputDate).tz("Asia/Kolkata").toDate();

   // Extract day, month, and year
   const day = date.getDate();
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
   getAllGoals,
   handlePin,
   isPinned,
}) => {
   const handleCardComplete = async () => {
      handleComplete(_id);
   };
   const handleCardDelete = () => {
      handleDelete(_id);
   };

   // Opening and closing of edit objective modal
   const [openModal, setOpenModal] = useState(false);
   const handleCloseModal = () => {
      setOpenModal(false);
   };
   const handleOpenModal = () => {
      // console.log(title, description, targetDate);
      setOpenModal(true);
   };
   const handleCardPin = () => {
      handlePin(_id);
   };

   return (
      <Card
         variant="outlined"
         sx={{
            width: 300, // Fixed width
            height: 220, // Fixed height
            boxShadow: 2,
            borderRadius: 2,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: 1,
         }}
      >
         {/* Pin Button */}
         <IconButton
            sx={{
               position: "absolute",
               top: 8,
               right: 8,
               color: isPinned ? "#2B85FF" : "grey",
               "&:hover": { color: "#2B85FF" },
            }}
            aria-label="pin"
            onClick={handleCardPin}
         >
            <PushPinIcon />
         </IconButton>

         {/* Card Content */}
         <CardContent
            sx={{
               flexGrow: 1,
               overflow: "hidden",
            }}
         >
            <Typography variant="h6" component="div">
               {title}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "green" }}>
               {formatDate(targetDate)} {/* Format date with custom function */}
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
               onClick={handleOpenModal}
            >
               <EditIcon />
            </IconButton>
            <EditObjectives
               openModal={openModal}
               handleCloseModal={handleCloseModal}
               prevTitle={title}
               prevDescription={description}
               prevTarget={targetDate}
               _id={_id}
               getAllGoals={getAllGoals}
            />
            <IconButton
               sx={{
                  color: "red",
               }}
               aria-label="delete"
               onClick={handleCardDelete}
            >
               <DeleteIcon />
            </IconButton>
         </CardActions>
      </Card>
   );
};

export default ObjectiveCard;
