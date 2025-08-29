import React, { useEffect } from "react";
import { AppBar, Toolbar, IconButton, useMediaQuery, Button, Box, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo/kwin_labs_Logo-removebg-preview.png";
import { useLocation } from "react-router-dom";

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setOpen(!open);
  };

 
  const handleAccountClick = () => {
    navigate("/login");
  };

  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#contact-section") {
      setTimeout(() => {
        scrollToContact();
      }, 100); // Delay for smooth scrolling after route change
    }
  }, [location]);

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      const offset = 100; // Adjust this value based on your header height
      const elementPosition = contactSection.getBoundingClientRect().top + window.scrollY;
      
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  

  const handleGoToContact = () => {
    if (location.pathname !== "/") {
      navigate("/#contact-section");
    } else {
      scrollToContact();
    }
  };


  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "white",
        boxShadow: "none",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "64px" }}> {/* Reduced minHeight */}
        {/* Logo and Title */}
        <Box
          display="flex"
          alignItems="center"
          sx={{
            "&:hover": {
              transform: "scale(1.05)", // Slight zoom on hover
              transition: "transform 0.3s ease-in-out",
            },
          }}
        >
          <img
            src={logo}
            onClick={() => navigate("/")}
            alt="Logo"
            style={{
              height: "80px", // Increased logo size
              marginRight: "16px", // Adjusted margin for better spacing
              filter: "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2))", // Add shadow
            }}
          />
        </Box>

        {/* Navigation Links */}
        {isMobile ? (
          <IconButton
            edge="end"
            onClick={toggleMenu}
            sx={{
              display: { xs: "block", sm: "none" },
              color: "#00afb5",
            }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button variant="contained" onClick={() => { toggleMenu(); navigate("/"); }} sx={{ backgroundColor: "#00afb5", color: "white", fontWeight: "bold", borderRadius: "25px", "&:hover": { backgroundColor: "#00afb5" } }}>Home</Button>
            {/* <Button sx={{ color: "#000", fontWeight: "bold", "&:hover": { backgroundColor: "transparent" } }}>About Us</Button>
            <Button sx={{ color: "#000", fontWeight: "bold", "&:hover": { backgroundColor: "transparent" } }}>Products</Button> */}
            <Button variant="contained" onClick={() => {

              scrollToContact();

              handleGoToContact();

            }} sx={{ backgroundColor: "#00afb5", color: "white", fontWeight: "bold", borderRadius: "25px", "&:hover": { backgroundColor: "#00afb5" } }}>Contact Us</Button>
            <Button
              sx={{
                backgroundColor: "#00afb5",
                color: "white",
                fontWeight: "bold",
                padding: "8px 16px",
                borderRadius: "25px",
                "&:hover": { backgroundColor: "#00afb5" }, // Remove hover effect
              }}
              endIcon={<ArrowForwardIcon />}
              onClick={handleAccountClick}
            >
              My Account
            </Button>
          </Box>
        )}
      </Toolbar>

      {/* Mobile Menu */}
      {isMobile && open && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: "110px", // Adjusted top position to match the reduced header height
            right: 0,
            backgroundColor: "white",
            width: "100%",
            boxShadow: 2,
            maxHeight: "300px", // Set the desired height
            overflowY: "auto", // Enable scrolling if the content overflows
            borderRadius: "0px 0px 10px 10px", // Optional: rounded bottom edges for styling
          }}
        >
          <Button onClick={() => { toggleMenu(); navigate("/"); }} sx={{ color: "#00afb5", "&:hover": { backgroundColor: "transparent" } }}>Home</Button>
          {/* <Button onClick={toggleMenu} sx={{ color: theme.palette.primary.main, "&:hover": { backgroundColor: "transparent" } }}>About Us</Button>
          <Button onClick={toggleMenu} sx={{ color: theme.palette.primary.main, "&:hover": { backgroundColor: "transparent" } }}>Products</Button> */}
          <Button onClick={() => { toggleMenu(); scrollToContact(); handleGoToContact(); }} sx={{ color: "#00afb5", "&:hover": { backgroundColor: "transparent" } }}>Contact Us</Button>
          <Button
            onClick={() => {
              toggleMenu();
              handleAccountClick();

            }}
            sx={{
              backgroundColor: "#00afb5",
              color: "white",
              fontWeight: "bold",
              padding: "8px 16px",
              borderRadius: "25px",
              marginTop: "8px",
              marginBottom: "8px",
              width: "50%",
              alignSelf: "center",
              "&:hover": { backgroundColor: "#00afb5" }, // Remove hover effect
            }}
            endIcon={<ArrowForwardIcon />}
          >
            My Account
          </Button>
        </Box>
      )}
    </AppBar>
  );
};

export default Header;