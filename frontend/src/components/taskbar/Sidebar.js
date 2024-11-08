import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import CoPresentRoundedIcon from '@mui/icons-material/CoPresentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import EventIcon from '@mui/icons-material/Event';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import { NavLink } from "react-router-dom";


const iconMap = {
        0: <SpaceDashboardRoundedIcon/>,
        1: <CoPresentRoundedIcon />,
        2: <AssignmentRoundedIcon />,
        3: < LeaderboardRoundedIcon/>,
        4: <LocalLibraryIcon />,
        5: <EventIcon />,
        6: <GroupRoundedIcon />,
    };

const linkMap = {
        0: "/dashboard",
        1: "/attendance",
        2: "/assignments",
        3: "/leaderboard",
        4: "/studyroom",
        5: "/events",
        6: "/challengefriend",
    };





export default function TemporaryDrawer({ state, setState, toggleDrawer }) {
    const list = (anchor) => (
        <Box
            sx={{
                width:  250,
            }}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List>
                {[
                    "Dashboard",
                    "Attendance",
                    "Assignments",
                    "Leaderboard",
                    "Study Room",
                    "Events",
                    "Challenge a friend",
                ].map((text, index) => (
                    <NavLink
                        to={linkMap[index]}
                        style={{ textDecoration: "none", color: "black" }}
                        key={text}
                    >
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>{iconMap[index]}</ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    </NavLink>
                ))}
            </List>
            <Divider />
            <List>
                {["Report an issue", "Contact us", "Know More"].map(
                    (text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    {index % 2 === 0 ? (
                                        <EventIcon />
                                    ) : (
                                        <EventIcon />
                                    )}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    )
                )}
            </List>
        </Box>
    );

    return (
        <div>
            {["left"].map((anchor) => (
                <React.Fragment key={anchor}>
                    <Drawer
                        anchor={anchor}
                        open={state[anchor]}
                        onClose={toggleDrawer(anchor, false)}
                    >
                        {list(anchor)}
                    </Drawer>
                </React.Fragment>
            ))}
        </div>
    );
}
