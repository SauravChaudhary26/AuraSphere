import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Tooltip } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import TemporaryDrawer from "./Sidebar";
import { useNavigate, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Navbar() {
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = useState(null);
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    const points = useSelector((state) => state.points.total);

    const [state, setState] = useState({
        left: false,
    });

    const toggleDrawer = (anchor, open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }

        setState({ ...state, [anchor]: open });
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const handleNavigate = () => navigate("/dashboard");

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={toggleDrawer("left", true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                        onClick={handleNavigate}
                    >
                        AuraSphere
                    </Typography>

                    <div
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							background: "linear-gradient(90deg, #4facfe, #00f2fe)",
							color: "white",
							fontWeight: "600",
							fontSize: "16px",
							padding: "6px 14px",
							borderRadius: "14px",
							boxShadow: "0 3px 8px rgba(0, 150, 255, 0.3)",
							marginRight: "10px",
						}}
					>
						<span style={{ fontSize: "18px" }}>⭐</span> {points} Aura
					</div>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Profile Menu">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar
                                    alt={
                                        localStorage.getItem("loggedInUser")
                                            ? localStorage
                                                  .getItem("loggedInUser")[0]
                                                  .toUpperCase()
                                            : "U"
                                    }
                                    src="/static/images/avatar/2.jpg"
                                />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: "45px", minWidth: "30px" }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <NavLink to="./profile" onClick={handleCloseUserMenu}>
                                <MenuItem key="profile">
                                    <Typography
                                        sx={{
                                            textAlign: "center",
                                            fontSize: "15px",
                                        }}
                                    >
                                        Profile
                                    </Typography>
                                </MenuItem>
                            </NavLink>

                            <NavLink to="./dashboard" onClick={handleCloseUserMenu}>
                                <MenuItem key="dashboard">
                                    <Typography
                                        sx={{
                                            textAlign: "center",
                                            fontSize: "15px",
                                        }}
                                    >
                                        Dashboard
                                    </Typography>
                                </MenuItem>
                            </NavLink>

                            <MenuItem key="logout" onClick={handleLogout}>
                                <Typography
                                    sx={{
                                        textAlign: "center",
                                        fontSize: "15px",
                                    }}
                                >
                                    Logout
                                </Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <TemporaryDrawer
                state={state}
                setState={setState}
                toggleDrawer={toggleDrawer}
            />
        </Box>
    );
}