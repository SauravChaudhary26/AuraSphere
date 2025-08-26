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
import { styled } from "@mui/material/styles";
import TemporaryDrawer from "./Sidebar";
import { useNavigate, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

// Styled components for modern design
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px rgba(26, 35, 126, 0.3)",
    position: "sticky",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
}));

const StyledToolbar = styled(Toolbar)({
    minHeight: "70px",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
});

const LogoText = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    fontSize: "1.75rem",
    background: "linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    cursor: "pointer",
    transition: "all 0.3s ease",
    letterSpacing: "0.5px",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
    "&:hover": {
        transform: "scale(1.02)",
        filter: "brightness(1.1)",
    },
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    width: "48px",
    height: "48px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
        background: "rgba(255, 255, 255, 0.2)",
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
    },
    "&:active": {
        transform: "translateY(0)",
    },
}));

const PointsContainer = styled("div")({
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #ffd700 0%, #ffb300 50%, #ff8f00 100%)",
    color: "#1a237e",
    fontWeight: 700,
    fontSize: "16px",
    padding: "10px 20px",
    borderRadius: "25px",
    boxShadow: "0 4px 20px rgba(255, 215, 0, 0.4)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(10px)",
    marginRight: "16px",
    transition: "all 0.3s ease",
    "&:hover": {
        transform: "translateY(-2px) scale(1.02)",
        boxShadow: "0 8px 30px rgba(255, 215, 0, 0.6)",
    },
});

const StarIcon = styled("span")({
    fontSize: "20px",
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
    animation: "sparkle 2s ease-in-out infinite alternate",
    "@keyframes sparkle": {
        "0%": { transform: "scale(1)" },
        "100%": { transform: "scale(1.1)" },
    },
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 48,
    height: 48,
    background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
    color: "#1a237e",
    fontWeight: 700,
    fontSize: "1.2rem",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
        transform: "scale(1.05)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
    },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    "& .MuiPaper-root": {
        background: "rgba(26, 35, 126, 0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        marginTop: "8px",
        minWidth: "200px",
    },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    padding: "12px 20px",
    borderRadius: "8px",
    margin: "4px 8px",
    transition: "all 0.3s ease",
    "&:hover": {
        background: "rgba(255, 255, 255, 0.1)",
        transform: "translateX(4px)",
    },
}));

const StyledNavLink = styled(NavLink)({
    textDecoration: "none",
    color: "inherit",
    display: "block",
    "&:hover": {
        textDecoration: "none",
    },
});

const MenuText = styled(Typography)({
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 500,
    transition: "color 0.3s ease",
});

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
            <StyledAppBar position="static">
                <StyledToolbar>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <MenuButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={toggleDrawer("left", true)}
                        >
                            <MenuIcon />
                        </MenuButton>
                        
                        <LogoText
                            variant="h6"
                            component="div"
                            onClick={handleNavigate}
                        >
                            AuraSphere
                        </LogoText>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PointsContainer>
                            <StarIcon>⭐</StarIcon>
                            <span>{points} Aura</span>
                        </PointsContainer>

                        <Tooltip 
                            title="Profile Menu" 
                            placement="bottom"
                            sx={{
                                "& .MuiTooltip-tooltip": {
                                    background: "rgba(26, 35, 126, 0.9)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "8px",
                                },
                            }}
                        >
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <StyledAvatar
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
                        
                        <StyledMenu
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: "bottom",
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
                            <StyledNavLink to="./profile">
                                <StyledMenuItem onClick={handleCloseUserMenu}>
                                    <MenuText>Profile</MenuText>
                                </StyledMenuItem>
                            </StyledNavLink>

                            <StyledNavLink to="./dashboard">
                                <StyledMenuItem onClick={handleCloseUserMenu}>
                                    <MenuText>Dashboard</MenuText>
                                </StyledMenuItem>
                            </StyledNavLink>

                            <StyledMenuItem onClick={handleLogout}>
                                <MenuText>Logout</MenuText>
                            </StyledMenuItem>
                        </StyledMenu>
                    </Box>
                </StyledToolbar>
            </StyledAppBar>
            
            <TemporaryDrawer
                state={state}
                setState={setState}
                toggleDrawer={toggleDrawer}
            />
        </Box>
    );
}