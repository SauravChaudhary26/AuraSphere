import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import CoPresentRoundedIcon from "@mui/icons-material/CoPresentRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import LeaderboardRoundedIcon from "@mui/icons-material/LeaderboardRounded";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import EventIcon from "@mui/icons-material/Event";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import PermContactCalendarRoundedIcon from "@mui/icons-material/PermContactCalendarRounded";
import LiveHelpRoundedIcon from "@mui/icons-material/LiveHelpRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { NavLink } from "react-router-dom";

const Links = [
   {
      text: "Dashboard",
      path: "/dashboard",
      icon: <SpaceDashboardRoundedIcon />,
   },
   {
      text: "Attendance",
      path: "/attendance",
      icon: <CoPresentRoundedIcon />,
   },
   {
      text: "Assignments",
      path: "/assignment",
      icon: <AssignmentRoundedIcon />,
   },
   {
      text: "Courses",
      path: "/courses",
      icon: <LocalLibraryIcon />,
   },
   {
      text: "Time Table",
      path: "/timetable",
      icon: <CalendarMonthIcon />,
   },
   {
      text: "Leaderboard",
      path: "/leaderboard",
      icon: <LeaderboardRoundedIcon />,
   },
   {
      text: "Study Room",
      path: "/studyroom",
      icon: <LocalLibraryIcon />,
   },
   {
      text: "Challenge a friend",
      path: "/challenge",
      icon: <GroupRoundedIcon />,
   },
   {
      text: "Events",
      path: "/events",
      icon: <EventIcon />,
   },
];

const extraLinks = [
   {
      text: "Report an issue",
      path: "/report-issue",
      icon: <BugReportRoundedIcon />,
   },
   {
      text: "Contact us",
      path: "/contact",
      icon: <PermContactCalendarRoundedIcon />,
   },
   { text: "Know More", path: "/information", icon: <LiveHelpRoundedIcon /> },
];

export default function TemporaryDrawer({ state, setState, toggleDrawer }) {
   const list = (anchor) => (
      <Box
         sx={{ width: 250 }}
         role="presentation"
         onClick={toggleDrawer(anchor, false)}
         onKeyDown={toggleDrawer(anchor, false)}
      >
         <List>
            {Links.map(({ text, path, icon }) => (
               <NavLink
                  to={path}
                  style={{ textDecoration: "none", color: "black" }}
                  key={text}
               >
                  <ListItem disablePadding>
                     <ListItemButton>
                        <ListItemIcon>{icon}</ListItemIcon>
                        <ListItemText primary={text} />
                     </ListItemButton>
                  </ListItem>
               </NavLink>
            ))}
         </List>
         <Divider />
         <List>
            {extraLinks.map(({ text, path, icon }) => (
               <NavLink
                  to={path}
                  style={{ textDecoration: "none", color: "black" }}
                  key={text}
               >
                  <ListItem disablePadding>
                     <ListItemButton>
                        <ListItemIcon>{icon}</ListItemIcon>
                        <ListItemText primary={text} />
                     </ListItemButton>
                  </ListItem>
               </NavLink>
            ))}
         </List>
      </Box>
   );

   return (
      <div>
         <Drawer
            anchor="left"
            open={state["left"]}
            onClose={toggleDrawer("left", false)}
         >
            {list("left")}
         </Drawer>
      </div>
   );
}
