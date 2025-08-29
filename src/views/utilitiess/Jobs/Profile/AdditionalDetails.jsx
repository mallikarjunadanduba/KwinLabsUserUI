import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Container,
  Divider,
} from "@mui/material";
import { Edit, Add, Delete } from "@mui/icons-material";
import { createSkill, getSkillById, getAllSkillData, updateESkill, deleteSkill } from "views/API/AdditionalDetailsApi";
import Swal from 'sweetalert2';

const AdditionalDetails = () => {
  const [open, setOpen] = useState(false);
  // Store full skill objects now, not just names.
  const [skills, setSkills] = useState([]);
  const [tempSkill, setTempSkill] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");

  // Retrieve user and jobseekerProfileId from session storage.
  const user = JSON.parse(sessionStorage.getItem("user"));
  const jobseekerProfileId = sessionStorage.getItem("jobseekerProfileId");

  const headers = {
    "Content-type": "application/json",
    Authorization: "Bearer " + user?.accessToken,
  };

  // Fetch skills when component mounts
  useEffect(() => {
    fetchSkills();
  }, []);

  //! Fetch skills
  const fetchSkills = async () => {
    try {
      const jobseekerProfileId = sessionStorage.getItem("jobseekerProfileId");
      if (!jobseekerProfileId) {
        console.error("Jobseeker Profile ID not found in session storage.");
        return;
      }
      const response = await getSkillById(jobseekerProfileId, headers);
      console.log("API Response:", response.data);
      if (Array.isArray(response.data)) {
      
        setSkills(response.data);
      } else {
        console.error("Unexpected API response format", response);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  //! Edit
  const handleOpen = async (index = null) => {
    setEditIndex(index);
    setError("");

    if (index !== null) {
   
      const selectedSkill = skills[index];
      try {
      
        const response = await getAllSkillData(selectedSkill.skillId, headers);
        console.log("Detailed Skill Data:", response);
        
        setTempSkill(response.skillName);
       
      } catch (error) {
        console.error("Error fetching detailed skill data:", error);
      }
    } else {
      setTempSkill("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTempSkill("");
    setEditIndex(null);
    setError("");
  };

  //! Handle save function for adding or updating a skill
  const handleSave = async () => {
    const trimmedSkill = tempSkill.trim();
    if (!trimmedSkill) {
      setError("Skill cannot be empty.");
      return;
    }
  
    // Check for duplicates (case insensitive)
    const lowerCaseSkills = skills.map((skill) => skill.skillName.toLowerCase());
    if (editIndex === null && lowerCaseSkills.includes(trimmedSkill.toLowerCase())) {
      setError("This skill already exists.");
      return;
    }
  
    if (!user?.seekerId || !jobseekerProfileId) {
      setError("User information is incomplete. Please log in again.");
      Swal.fire({
        target: document.getElementById("your-dialog-id"),
        icon: 'error',
        title: 'Oops...',
        text: 'User information is incomplete. Please log in again.',
        confirmButtonText: 'OK'
      }).then(() => handleClose());
      return;
    }
  
    try {
      if (editIndex !== null) {
        // Update existing skill
        const skillToUpdate = skills[editIndex];
        const updateData = {
          jobSeekerDtoList: { seekerId: user.seekerId },
          jobSeekerProfileDtoList: { jobseekerProfileId },
          skillId: skillToUpdate.skillId,
          skillName: trimmedSkill,
        };
  
        await updateESkill(updateData, headers);
        
        // Update local state
        const updatedSkills = [...skills];
        updatedSkills[editIndex] = { ...skillToUpdate, skillName: trimmedSkill };
        setSkills(updatedSkills);
      } else {
        // Add new skill
        const skillData = {
          jobSeekerDtoList: { seekerId: user.seekerId },
          jobSeekerProfileDtoList: { jobseekerProfileId },
          skillName: trimmedSkill,
        };
        
        await createSkill(skillData, headers);
        await fetchSkills(); // Wait for data refresh
      }
  
      handleClose(); // This will always close the dialog after successful operations
    } catch (error) {
      console.error("Error saving skill:", error);
    }
  };

  //! Delete a skill from the list
  const handleDelete = async (index) => {
    const skillToDelete = skills[index];
  
    if (!skillToDelete?.skillId) {
      console.error("Skill ID not found for deletion.");
      return;
    }
  
    try {
      await deleteSkill(skillToDelete.skillId, headers);
  
      // Remove the skill from state after successful API call
      setSkills(skills.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ border: "1px solid #ddd", borderRadius: 2, padding: 2, backgroundColor: "#fff" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">Skills</Typography>
        <IconButton onClick={() => handleOpen()} sx={{ color: "#0095a5" }}>
          <Add />
        </IconButton>
      </Box>

      <Divider sx={{ my: 1 }} />

      {skills.length > 0 ? (
        skills.map((skill, index) => (
          <React.Fragment key={skill.skillId || index}>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ my: 1 }}>
              <Typography variant="body1" sx={{ flexGrow: 1, whiteSpace: "pre-wrap" }}>
                {skill.skillName}
              </Typography>
              <Box>
                <IconButton onClick={() => handleOpen(index)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(index)} color="error">
                  <Delete />
                </IconButton>
              </Box>
            </Box>
            {index !== skills.length - 1 && <Divider />}
          </React.Fragment>
        ))
      ) : (
        <Typography variant="body1" sx={{ color: "gray", fontStyle: "italic" }}>
          Click + to add your skills...
        </Typography>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth id="your-dialog-id">
        <DialogTitle>{editIndex !== null ? "Edit Skill" : "Add Skill"}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Your Skill"
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            value={tempSkill}
            onChange={(e) => {
              setTempSkill(e.target.value);
              if (error) setError("");
            }}
            error={!!error}
            helperText={error}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#0095a5" },
                "&:hover fieldset": { borderColor: "#0095a5" },
                "&.Mui-focused fieldset": { borderColor: "#0095a5" },
              },
              "& .MuiInputLabel-root": { color: "#0095a5" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#0095a5" },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: "#0095a5" }}>
            {editIndex !== null ? "Update" : "Add"}
          </Button>
          <Button onClick={handleClose} sx={{ color: "#0095a5" }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdditionalDetails;
