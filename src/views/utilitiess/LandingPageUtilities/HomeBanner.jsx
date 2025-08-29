import React from "react";
import { Container, Grid, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles"; 
import { useNavigate } from "react-router-dom"; 
import imageSrc from "../../../assets/images/homebanner/image_2025_03_04T09_45_33_265Z-removebg-preview.png"; // Ensure the correct path to your image

const StyledBanner = styled("div")({
  backgroundColor: "white",  
  backgroundSize: "100% 200%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "400px",
  marginTop: "50px",
});

const StyledImage = styled("img")(({ theme }) => ({
  width: "100%",
  maxWidth: "500px", // Adjust size if needed
  borderRadius: "10px",

  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
  }
}));

function HomeBanner() {
  const navigate = useNavigate(); 

  const handleSubscribeClick = () => {
    navigate("/login"); 
  };

  return (
    <StyledBanner style={{ marginTop: "-1px" }}>
      <Container>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <StyledImage 
              src={imageSrc} 
              alt="Banner" // Add an alt attribute for accessibility
            />
          </Grid>
          <Grid item xs={12} md={7} style={{ textAlign: "center", marginTop: "50px" }}>
            <Typography
              variant="h1"
              component="div"
              sx={{
                color: "#00afb5",
                fontFamily: "Georgia, serif",
                marginBottom: "10px",
                fontWeight: "bold",
              }}
            >
              WELCOME TO KWINLABS
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                color: "#444444",
                marginTop: "10px",
                fontWeight: "bold",
              }}
            >
              Empower Your Workforce with Seamless Learning & Growth
            </Typography>
            <Typography
              variant="h5"
              component="div"
              sx={{
                color: "#444444",
                marginTop: "10px",
                fontStyle: "italic",
              }}
            >
              Bridging the gap between Talent and Opportunity
            </Typography>
            <Button
              variant="contained"
              sx={{
                marginTop: "20px",
                backgroundColor: "#00afb5",
                fontSize: "16px",
                padding: "12px 20px",
                borderRadius: "25px"
              }}
              onClick={handleSubscribeClick}
            >
              Subscribe
            </Button>
          </Grid>
        </Grid>
        <br />
      </Container>
    </StyledBanner>
  );
}

export default HomeBanner;