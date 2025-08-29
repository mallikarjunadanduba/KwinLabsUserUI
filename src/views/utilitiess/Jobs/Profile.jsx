import React, { useState, useRef, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { Container, Button, Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import MainCard from "ui-component/cards/MainCard";
import BasicDetails from "./Profile/BasicDetails";
import EducationDetails from "./Profile/EducationDetails";
import ExperienceDetails from "./Profile/ExperienceDetails";
import AdditionalDetails from "./Profile/AdditionalDetails";
import UploadDetails from "./Profile/UploadDetails";
import ProjectDetails from "./Profile/ProjectDetails";
import Certification from "./Profile/Certification";
import About from "./Profile/About";
import Languages from "./Profile/Languages";
import Courses from "./Profile/Courses";
import ContactInfo from "./Profile/ContactInfo";
import Awards from "./Profile/Awards";
import Employment from "./Profile/Employment";

const Profile = () => {
  const [activeSection, setActiveSection] = useState(null);
  const scrollRef = useRef(null);

  const handleButtonClick = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" }); // Increased scroll distance
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" }); // Increased scroll distance
    }
  };


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0; // Reset to start
    }
  }, []);


  const sections = [
    { label: "Employment", id: "employment" },
    { label: "Experience", id: "experience" },
    { label: "Education", id: "education" },
    { label: "Skills", id: "skills" },
    { label: "Upload Video", id: "uploadFiles" },
    { label: "Projects", id: "projects" },
    { label: "Certifications", id: "certifications" },
    { label: "Languages", id: "languages" },
    { label: "Courses", id: "courses" },
    { label: "Social Link", id: "contactInfo" },
    { label: "Awards", id: "awards" },
  ];

  const activeSectionLabel = sections.find((sec) => sec.id === activeSection)?.label || "Unknown";

  const arrowButtonStyle = {
    zIndex: 1,
    backgroundColor: '#0095a5',
    color: 'white',
    borderRadius: '50%',
    width: 32,
    height: 32,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      backgroundColor: '#007a87',
      transform: 'scale(1.05)',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
    },
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden', px: 0, py: 0 }}>
      <MainCard title="Job Profile" sx={{ px: 1, py: 1 }}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <BasicDetails />
          </Grid>

          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 1,
              overflow: "hidden",
              width: "100%",
            }}
          >
            {/* Horizontal Scroll Buttons */}
            <Box
              ref={scrollRef}
              sx={{
                display: "flex",
                overflowX: "auto",
                whiteSpace: "nowrap",
                gap: 1,
                px: 1,
                scrollBehavior: "smooth",
                width: "100%",
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
              }}
            >
              {sections.map((section) => (
                <Card key={section.id} sx={{ minWidth: 120, flexShrink: 0, m: 0, p: 0, boxShadow: "none" }}>
                  <CardContent sx={{ display: "flex", justifyContent: "center", p: 0 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        borderRadius: 20,
                        textTransform: "none",
                        px: 2,
                        py: 1,
                        fontSize: "0.875rem",
                        backgroundColor: "#0095a5",
                        minWidth: "100%",
                      }}
                      onClick={() => handleButtonClick(section.id)}
                    >
                      {section.label}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
              <IconButton onClick={scrollLeft} sx={arrowButtonStyle}>
                <ArrowBackIos fontSize="small" />
              </IconButton>
              <IconButton onClick={scrollRight} sx={arrowButtonStyle}>
                <ArrowForwardIos fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              mt: 1,
              color: "#777",
              fontSize: "0.75rem",
              animation: "fadeInOut 1.5s infinite",
              "@keyframes fadeInOut": {
                "0%": { opacity: 0.2 },
                "50%": { opacity: 1 },
                "100%": { opacity: 0.2 },
              },
            }}
          >
            Swipe left or right to see more
          </Typography>
        </Grid>
      </MainCard>

      {activeSection && (
        <Card sx={{ mt: 2, mx: 1 }}>
          <CardContent sx={{ px: 1, py: 1 }}>
            {activeSection === "education" && <EducationDetails />}
            {activeSection === "experience" && <ExperienceDetails />}
            {activeSection === "skills" && <AdditionalDetails />}
            {activeSection === "uploadFiles" && <UploadDetails />}
            {activeSection === "projects" && <ProjectDetails />}
            {activeSection === "certifications" && <Certification />}
            {activeSection === "languages" && <Languages />}
            {activeSection === "courses" && <Courses />}
            {activeSection === "contactInfo" && <ContactInfo />}
            {activeSection === "awards" && <Awards />}
            {activeSection === "employment" && <Employment />}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Profile;
