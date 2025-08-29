import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import { BaseUrl } from "BaseUrl";
import { useNavigate } from "react-router-dom";
import useSecureImage from "hooks/useSecureImage";

const Basic_Details = () => {
  const [coverImage, setCoverImage] = useState(" ");
  const [profileImage, setProfileImage] = useState(" ");
  const [profileData, setProfileData] = useState({
    jobseekerProfileName: "",
    description: "",
    email: "",
    mobileNumber: "",
    fileName: "",
  });

  const user = JSON.parse(sessionStorage.getItem("user"));
  const headers = {
    "Content-type": "application/json",
    Authorization: "Bearer " + user.accessToken,
  };

  const coverImageUrl = useSecureImage(coverImage, user.accessToken);
  const profileImageUrl = useSecureImage(profileImage, user.accessToken);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const jobSeekerId = parseInt(user?.seekerId);
        const response = await axios.get(
          `${BaseUrl}/jobseekerprofile/v1/getJobSeekerProfileByJobSeekerId/${jobSeekerId}`,
          { headers }
        );

        if (response.data) {
          setProfileData({
            jobseekerProfileName: response.data.jobseekerProfileName || "",
            description: response.data.description || "",
            email: response.data.email || "",
            mobileNumber: response.data.mobileNumber || "",
            fileName: response.data.jobseekerProfilePicName || "",
          });

          if (response.data.jobseekerProfilePicPath)
            setProfileImage(response.data.jobseekerProfilePicPath);
          if (response.data.jobseekerProfileCoverPicPath)
            setCoverImage(response.data.jobseekerProfileCoverPicPath);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "xl",
        mx: "auto",
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        backgroundImage: coverImageUrl
          ? `url(${coverImageUrl})`
          : "linear-gradient(to right, #1f4037, #99f2c8)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        minHeight: 450,
        display: 'flex',
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Dark overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 3, sm: 5 },
          py: { xs: 4, sm: 6 },
        }}
      >
        {/* Left Side */}
        <Box
          sx={{
            flex: 1,
            textAlign: { xs: "center", md: "left" },
            mb: { xs: 4, md: 0 },
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", md: "flex-start" },
            justifyContent: "center",
          }}
        >

          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              mb: 2,
              px: 3,
              py: 1,
              display: "inline-block",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(6px)",
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {profileData.jobseekerProfileName}
          </Typography>

          <Typography variant="subtitle1" sx={{ color: "#e0f7fa", mb: 1, width: '80%' }}>
            {profileData.description}
          </Typography>

          <Typography variant="body2" sx={{ color: "#cfd8dc" }}>
            📞 {profileData.mobileNumber}
          </Typography>
          <Typography variant="body2" sx={{ color: "#cfd8dc" }}>
            ✉️ {profileData.email}
          </Typography>
        </Box>

        {/* Right Side - Avatar Card */}
        <Box
          sx={{
            width: 200,
            height: 200,
            borderRadius: "16px",
            backgroundColor: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
          }}
        >
          <Avatar
            sx={{
              width: 160,
              height: 160,
              border: "4px solid #fff",
              backgroundColor: !profileImage ? "#00acc1" : undefined,
              fontSize: 56,
            }}
          >
            {!profileImage ? (
              profileData.jobseekerProfileName?.[0]?.toUpperCase()
            ) : (
              <img
                src={profileImageUrl}
                alt="Profile"
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
              />
            )}
          </Avatar>
        </Box>
      </Box>
    </Box>
  );
};

export default Basic_Details;
