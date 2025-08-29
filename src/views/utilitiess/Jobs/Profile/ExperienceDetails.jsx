import React, { useEffect, useState } from "react";
import {
  Grid,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { createExperience, deleteExperience, getAllExperiences, updateExperience } from "views/API/ExperienceApi";
import Swal from 'sweetalert2';


const ExperienceDetails = () => {
  const [experience, setExperience] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newExperience, setNewExperience] = useState({
    companyName: "",
    designation: "",
    startDate: null,
    endDate: null,
    years: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    companyName: "",
    designation: "",
    startDate: "",
    endDate: "",
  });


   //todo:headers and tokens
   const user = JSON.parse(sessionStorage.getItem('user'));
   const headers = {
     'Content-type': 'application/json',
     Authorization: 'Bearer ' + user.accessToken
   };

  const validateFields = () => {
    let tempErrors = {};
    let isValid = true;

    if (!newExperience.companyName.trim()) {
      tempErrors.companyName = "Company Name is required";
      isValid = false;
    }
    if (!newExperience.designation.trim()) {
      tempErrors.designation = "Designation is required";
      isValid = false;
    }
    if (!newExperience.startDate) {
      tempErrors.startDate = "Start Date is required";
      isValid = false;
    }
    if (!newExperience.endDate) {
      tempErrors.endDate = "End Date is required";
      isValid = false;
    } else if (newExperience.startDate && newExperience.endDate && dayjs(newExperience.endDate).isBefore(dayjs(newExperience.startDate))) {
      tempErrors.endDate = "End Date cannot be before Start Date";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };


  const handleChange = (e, field) => {
    setNewExperience((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" })); // Clear error when user types
  };


  const handleDateChange = (value, field) => {
    setNewExperience((prev) => {
      const updatedExperience = { ...prev, [field]: value };

      if (updatedExperience.startDate && updatedExperience.endDate) {
        updatedExperience.years = calculateYearsOfExperience(
          updatedExperience.startDate,
          updatedExperience.endDate
        ).toFixed(2);
      }
      return updatedExperience;
    });

    setErrors((prev) => ({ ...prev, [field]: "" })); // Clear error when user selects a date
  }

//!UseEffect
  useEffect(() => {
    fetchExperiences();
  }, []);



  //todo fetch data 
  const fetchExperiences = async () => {
    try {
      // Retrieve jobseekerProfileId dynamically from session storage
      const profileId = sessionStorage.getItem('jobseekerProfileId');
     
  
      const response = await getAllExperiences(profileId, headers);
      console.log(response);
  
      const formattedExperiences = response.map((exp) => ({
        experienceId: exp.experienceId,
        companyName: exp.companyName,
        designation: exp.designation,
        startDate: dayjs(exp.fromDate),
        endDate: dayjs(exp.toDate),
        years: calculateYearsOfExperience(exp.fromDate, exp.toDate).toFixed(2),
        description: exp.description || "",
      }));
  
      setExperience(formattedExperiences);
    } catch (error) {
      console.error("Error fetching experiences:", error);
    
    }
  };
  

  const calculateYearsOfExperience = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diffInMonths = end.diff(start, "month");
    return diffInMonths / 12;
  };

  const handleOpenDialog = (index = null) => {
    if (index !== null) {
      const selectedExperience = experience[index];
      setNewExperience({
        ...selectedExperience,
        startDate: selectedExperience.startDate ? dayjs(selectedExperience.startDate) : null,
        endDate: selectedExperience.endDate ? dayjs(selectedExperience.endDate) : null,
      });
      setEditingIndex(index);
    } else {
      setNewExperience({
        companyName: "",
        designation: "",
        startDate: null,
        endDate: null,
        years: "",
        description: "",
      });
      setEditingIndex(null);
    }
    setErrors({}); // Reset errors
    setOpenDialog(true);
  };


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewExperience({
      companyName: "",
      designation: "",
      startDate: null,
      endDate: null,
      years: "",
      description: "",
    });
    setEditingIndex(null);
    setErrors({});
  };

//todo : post nad updated api 
 
const handleSaveExperience = async () => {
  if (!validateFields()) return;

  const user = JSON.parse(sessionStorage.getItem("user"));
  const jobSeekerId = user?.seekerId;
  const jobseekerProfileId = sessionStorage.getItem("jobseekerProfileId");

 

  // Format data as per the required format
  const formattedExperience = {
    experienceId: newExperience.experienceId || null, 
    companyName: newExperience.companyName,
    designation: newExperience.designation,
    fromDate: newExperience.startDate ? newExperience.startDate.toISOString() : "",
    toDate: newExperience.endDate ? newExperience.endDate.toISOString() : "",
    jobSeekerDtoList: { seekerId: jobSeekerId },
    jobSeekerProfileDtoList: { jobseekerProfileId: jobseekerProfileId },
  };

  try {
    if (newExperience.experienceId) {
     
      await updateExperience( formattedExperience, headers); 
    } else {
     
      await createExperience(formattedExperience, headers);
    }
    fetchExperiences(); 
    handleCloseDialog();
  } catch (error) {
    console.error("Error saving experience:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while saving the experience.",
      confirmButtonText: "OK",
    });
  }
};
  
//! delete 
const handleRemoveExperience = async (index,experienceId) => {

  try {
    const isDeleted = await deleteExperience(experienceId, headers);
    
    if (isDeleted) {
      setExperience((prev) => prev.filter((_, i) => i !== index));
    }
  } catch (error) {
    console.error("Error deleting experience:", error);
  }
};



  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: "xl", border: "1px solid #ddd", borderRadius: 2, padding: 2, backgroundColor: "#fff" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold" >Experience</Typography>
          <IconButton onClick={() => handleOpenDialog()} style={{ color: "#0095a5" }}><Add /></IconButton>
        </Box>
        <Divider sx={{ my: 1 }} />
        {experience.length === 0 ? (
          <Typography variant="body1" sx={{ color: "gray", fontStyle: "italic", textAlign: "initial", py: 2 }}>
            Click <Add fontSize="small" sx={{ verticalAlign: "middle" }} /> to add experience
          </Typography>
        ) : (
          <AnimatePresence>
            {experience.map((exp, index) => (
              <motion.div
                key={exp.experienceId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      <strong>Company:</strong> {exp.companyName}
                    </Typography>
                    <Typography variant="subtitle1">
                      <strong>Designation:</strong> {exp.designation}
                    </Typography>
                    <Typography variant="subtitle1">
                      <strong>Start Date:</strong>{" "}
                      {exp.startDate.format("DD-MM-YYYY")}
                    </Typography>
                    <Typography variant="subtitle1">
                      <strong>End Date:</strong>{" "}
                      {exp.endDate.format("DD-MM-YYYY")}
                    </Typography>
                    <Typography variant="subtitle1">
                      <strong>Experience:</strong> {exp.years} years
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => handleOpenDialog(index)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleRemoveExperience(index, exp.experienceId)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth id="your-dialog-id">
        <DialogTitle>{editingIndex !== null ? "Edit Experience" : "Add Experience"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                value={newExperience.companyName}
                onChange={(e) => handleChange(e, "companyName")}
                variant="outlined"
                error={!!errors.companyName}
                helperText={errors.companyName}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#0095a5" }, // Default border color
                    "&:hover fieldset": { borderColor: "#0095a5" }, // Hover effect
                    "&.Mui-focused fieldset": { borderColor: "#0095a5" }, // Focused effect
                  },
                  "& .MuiInputLabel-root": {
                    color: "#0095a5", // Label color
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#0095a5", // Focused label color
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newExperience.description}
                onChange={(e) => handleChange(e, "description")}
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#0095a5" },
                    "&:hover fieldset": { borderColor: "#0095a5" },
                    "&.Mui-focused fieldset": { borderColor: "#0095a5" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#0095a5",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#0095a5",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Designation"
                value={newExperience.designation}
                onChange={(e) => handleChange(e, "designation")}
                variant="outlined"
                error={!!errors.designation}
                helperText={errors.designation}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#0095a5" }, // Default border color
                    "&:hover fieldset": { borderColor: "#0095a5" }, // Hover effect
                    "&.Mui-focused fieldset": { borderColor: "#0095a5" }, // Focused effect
                  },
                  "& .MuiInputLabel-root": {
                    color: "#0095a5", // Label color
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#0095a5", // Focused label color
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="Start Date"
                value={newExperience.startDate}
                onChange={(value) => handleDateChange(value, "startDate")}
                slotProps={{
                  textField: { error: !!errors.startDate, helperText: errors.startDate },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#0095a5" }, // Default border color
                    "&:hover fieldset": { borderColor: "#0095a5" }, // Hover effect
                    "&.Mui-focused fieldset": { borderColor: "#0095a5" }, // Focused effect
                  },
                  "& .MuiInputLabel-root": {
                    color: "#0095a5", // Label color
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#0095a5", // Focused label color
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="End Date"
                value={newExperience.endDate}
                onChange={(value) => handleDateChange(value, "endDate")}
                slotProps={{
                  textField: { error: !!errors.endDate, helperText: errors.endDate },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#0095a5" }, // Default border color
                    "&:hover fieldset": { borderColor: "#0095a5" }, // Hover effect
                    "&.Mui-focused fieldset": { borderColor: "#0095a5" }, // Focused effect
                  },
                  "& .MuiInputLabel-root": {
                    color: "#0095a5", // Label color
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#0095a5", // Focused label color
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveExperience} variant="contained" sx={{ backgroundColor: "#0095a5" }} >
            {editingIndex !== null ? "Save" : "Add"}
          </Button>
          <Button onClick={handleCloseDialog} sx={{ color: "#0095a5" }}>Cancel</Button>

        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ExperienceDetails;
