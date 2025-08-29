import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import Swal from "sweetalert2";
import { BaseUrl } from "BaseUrl";
import {
  saveOrUpdateJobSeekerProfilePic,
  saveOrUpdateJobSeekerProfileCoverPic
} from "views/API/jobSeekerProfileApi";
import AuthImage from "ImageUrlExtracter/AuthImage";
import useSecureImage from "hooks/useSecureImage";

const BasicDetails = () => {
  const [coverImage, setCoverImage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const [profileData, setProfileData] = useState({
    jobseekerProfileName: "",
    description: "",
    email: "",
    mobileNumber: "",
    fileName: ""
  });
  const [openEdit, setOpenEdit] = useState(false);
  const [errors, setErrors] = useState({});
  const [jobseekerProfileId, setJobseekerProfileId] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const headers = {
    "Content-type": "application/json",
    Authorization: "Bearer " + user.accessToken
  };
  const navigate = useNavigate();
  const coverImageUrl = useSecureImage(coverImage, user.accessToken);
  const profileImageUrl = useSecureImage(profileImage, user.accessToken);


  const validateFields = () => {
    const newErrors = {};
    let isValid = true;
    if (!profileData.jobseekerProfileName.trim()) {
      newErrors.jobseekerProfileName = "Profile name is required";
      isValid = false;
    } else if (profileData.jobseekerProfileName.trim().length < 3) {
      newErrors.jobseekerProfileName = "Profile name must be at least 3 characters";
      isValid = false;
    }
    if (!profileData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (profileData.description.trim().length > 200) {
      newErrors.description = "Description must be less than 200 characters";
      isValid = false;
    }
    if (!profileData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }
    if (!profileData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(profileData.mobileNumber.trim())) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const jobSeekerId = parseInt(user?.seekerId);
        const response = await axios.get(
          `${BaseUrl}/jobseekerprofile/v1/getJobSeekerProfileByJobSeekerId/${jobSeekerId}`,
          { headers }
        );


        if (response.data) {
          const profileId = response.data.jobseekerProfileId || null;
          setJobseekerProfileId(profileId);
          sessionStorage.setItem("jobseekerProfileId", profileId);
          setProfileData({
            jobseekerProfileName: response.data.jobseekerProfileName || "",
            description: response.data.description || "",
            email: response.data.email || "",
            mobileNumber: response.data.mobileNumber || "",
            fileName: response.data.jobseekerProfilePicName || ""
          });
          if (response.data.jobseekerProfilePicPath
          ) setProfileImage(response.data.jobseekerProfilePicPath);
          if (response.data.jobseekerProfileCoverPicPath);
          setCoverImage(response.data.jobseekerProfileCoverPicPath);
          setIsProfileCreated(true);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
  }, []);


  const uploadFile = async (file) => {
    const data = new FormData();
    data.append("file", file);
    const response = await axios.post(`${BaseUrl}/file/uploadFile`, data, {
      headers: {
        "content-type": "multipart/form-data",
        Authorization: "Bearer " + user.accessToken
      }
    });
    if (response.data.responseCode === 201 && response.data.status === "SUCCESS") {
      return response.data.fileName;
    } else {
      throw new Error("File upload failed");
    }
  };

  const uploadProfileImage = async (file) => {
    if (!jobseekerProfileId) return;
    const fileName = await uploadFile(file);
    const payload = {
      jobseekerProfileId,
      jobseekerProfilePicName: fileName,
      jobSeekerDto: { seekerId: parseInt(user?.seekerId) }
    };
    await saveOrUpdateJobSeekerProfilePic(payload, headers);
    setProfileData(prev => ({ ...prev, fileName }));
    setProfileImage(`${BaseUrl}/file/downloadFile?filePath=${fileName}`);
    return fileName;
  };

  const uploadCoverImage = async (file) => {
    const fileName = await uploadFile(file);
    const payload = {
      jobseekerProfileId,
      jobseekerProfileCoverPicName: fileName,
      jobSeekerDto: { seekerId: parseInt(user?.seekerId) }
    };
    await saveOrUpdateJobSeekerProfileCoverPic(payload, headers);
    setCoverImage(`${BaseUrl}/file/downloadFile?filePath=${fileName}`);
    return fileName;
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileName = await uploadProfileImage(file);
      Swal.fire("Success", "Profile image uploaded successfully", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileName = await uploadCoverImage(file);
      Swal.fire("Success", "Cover image uploaded successfully", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    const jobSeekerId = parseInt(user?.seekerId);
    const requestData = {
      jobseekerProfileId,
      jobSeekerDtoList: { seekerId: jobSeekerId },
      description: profileData.description,
      email: profileData.email,
      jobseekerProfileName: profileData.jobseekerProfileName,
      mobileNumber: profileData.mobileNumber,
      jobseekerProfilePicName: profileData.fileName
    };
    Swal.fire({ title: isProfileCreated ? "Updating..." : "Saving...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const response = isProfileCreated
        ? await axios.put(`${BaseUrl}/jobseekerprofile/v1/updateJobSeekerProfile`, requestData, { headers })
        : await axios.post(`${BaseUrl}/jobseekerprofile/v1/createJobSeekerProfile`, requestData, { headers });
      if (!isProfileCreated && response.data?.data?.jobseekerProfileId) {
        setJobseekerProfileId(response.data.data.jobseekerProfileId);
        sessionStorage.setItem("jobseekerProfileId", response.data.data.jobseekerProfileId);
      }
      Swal.fire({ icon: "success", title: isProfileCreated ? "Updated!" : "Saved!", timer: 2000, showConfirmButton: false });
      setIsProfileCreated(true);
      setOpenEdit(false);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Failed to save profile" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handlePrintPreview = () => {
    navigate("/jobs/digitalpreview", {
      state: {
        profileData: {
          name: profileData.jobseekerProfileName,
          about: profileData.description,
          coverImage,
          profileImage
        }
      }
    });
  };

  const handlePrintPDF = () => {
    navigate("/jobs/resumedata");
  };
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "xl",
        mx: "auto",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        backgroundImage: coverImageUrl
          ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${coverImageUrl})`
          : "linear-gradient(to right, #2c3e50, #4ca1af)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: { xs: 380, md: 450 },
        position: "relative",
        color: "#fff",
        gap: 4,
      }}
    >
      {/* Edit Cover Button */}
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}>
        <input
          type="file"
          accept="image/*"
          id="cover-image-input"
          style={{ display: "none" }}
          onChange={handleCoverImageChange}
        />
        <label htmlFor="cover-image-input">
          <Button
            component="span"
            size="small"
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              backgroundColor: "#ffffff",
              color: "#002c63",
              textTransform: "none",
              fontSize: "12px",
              borderRadius: 20,
              minWidth: { xs: "auto", sm: "64px" }, // reduce width in mobile
              px: { xs: 1, sm: 2 }, // padding X adjusted for icon-only
              "&:hover": {
                backgroundColor: "#f8a12d",
                color: "#fff",
              },
            }}
          >
            <Box sx={{ display: { xs: "none", sm: "inline" } }}>Edit Cover</Box>
          </Button>
        </label>
      </Box>


      {/* Left Side */}
      <Box
        sx={{
          flex: 1,
          textAlign: { xs: "center", md: "left" },
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: { xs: "center", md: "flex-start" },
          gap: 1,
        }}
      >
        {/* Job Seeker Name */}
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

        {/* Contact Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "#e0e0e0" }}>
            📞 {profileData.mobileNumber}
          </Typography>
          <Typography variant="body2" sx={{ color: "#e0e0e0" }}>
            ✉️ {profileData.email}
          </Typography>
          <Typography variant="body2" sx={{ color: "#e0e0e0" }}>
            {profileData.description}
          </Typography>
        </Box>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: { xs: "center", md: "flex-start" },
          }}
        >
          {isProfileCreated ? (
            <>
              <Button
                variant="outlined"
                sx={{
                  color: "#fff",
                  borderColor: "#fff",
                  "&:hover": {
                    borderColor: "#f8a12d",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
                onClick={handlePrintPreview}
              >
                Preview
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#388e3c" },
                  color: "#fff",
                }}
                onClick={handlePrintPDF}
              >
                Print PDF
              </Button>
              <IconButton
                onClick={() => setOpenEdit(true)}
                sx={{
                  backgroundColor: "#0095a5",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#f8a12d" },
                }}
              >
                <EditIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Typography variant="body2" color="#eee">
                No profile found. Click '+' to create one.
              </Typography>
              <IconButton
                onClick={() => setOpenEdit(true)}
                sx={{
                  backgroundColor: "#0095a5",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#f8a12d" },
                }}
              >
                <AddIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      {/* Right Side - Avatar */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
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
            position: "relative",
          }}
        >
          <Avatar
            sx={{
              width: 180,
              height: 180,
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

          <input
            type="file"
            accept="image/*"
            id="profile-image-input"
            style={{ display: "none" }}
            onChange={handleProfileImageChange}
          />
          <label htmlFor="profile-image-input">
            <IconButton
              component="span"
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                backgroundColor: "#0095a5",
                color: "white",
                border: "2px solid white",
                "&:hover": { backgroundColor: "#f8a12d" },
              }}
            >
              <CameraAltIcon />
            </IconButton>
          </label>
        </Box>
      </Box>

      {/* Dialog Form */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>{isProfileCreated ? "Edit Profile" : "Create Profile"}</DialogTitle>
        <DialogContent>
          <TextField
            name="jobseekerProfileName"
            label="Profile Name"
            fullWidth
            value={profileData.jobseekerProfileName}
            onChange={handleInputChange}
            error={!!errors.jobseekerProfileName}
            helperText={errors.jobseekerProfileName}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={profileData.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
            inputProps={{ maxLength: 300 }}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            name="email"
            label="Email"
            fullWidth
            value={profileData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            name="mobileNumber"
            label="Mobile Number"
            fullWidth
            value={profileData.mobileNumber}
            onChange={handleInputChange}
            error={!!errors.mobileNumber}
            helperText={errors.mobileNumber}
            inputProps={{ maxLength: 10 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ backgroundColor: "#0095a5", color: "white" }}
          >
            {isProfileCreated ? "Update" : "Save"}
          </Button>
          <Button onClick={() => setOpenEdit(false)} sx={{ color: "#0095a5" }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

};

export default BasicDetails;