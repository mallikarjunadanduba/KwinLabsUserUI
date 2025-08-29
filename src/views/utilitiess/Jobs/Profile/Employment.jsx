import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import {
  createEmployment,
  deleteEmployment,
  getEmployment_Id,
  getEmploymentById,
  updateEmployment,
} from "views/API/EmploymentApi";
import Swal from "sweetalert2";

const Employment = () => {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [employmentHistory, setEmploymentHistory] = useState([]);
  const [canAddNew, setCanAddNew] = useState(true);

  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    employmentType: "",
    currentctc: "",
    skill: "",
    jobProfile: "",
    noticePeriod: "",
  });

  const noticePeriodOptions = [
    "Immediate",
    "15 Days",
    "30 Days",
    "60 Days",
    "90 Days",
  ];

  const user = JSON.parse(sessionStorage.getItem("user"));
  const jobseekerProfileId = parseInt(
    sessionStorage.getItem("jobseekerProfileId")
  );
  const headers = {
    "Content-type": "application/json",
    Authorization: "Bearer " + user.accessToken,
  };

  // Fetch employment data from API
  useEffect(() => {
    const fetchEmploymentData = async () => {
      const profileId = sessionStorage.getItem('jobseekerProfileId');

      try {
        const response = await getEmploymentById(headers,profileId);
        console.log("Employment Data:", response.data);

        if (response.data) {
          const normalizedData = (
            Array.isArray(response.data) ? response.data : [response.data]
          ).map((job) => ({
            employmentId: job.employmentId,
            companyName: job.companyName,
            jobTitle: job.jobTitle,
            skill: job.skill,
            jobProfile: job.jobProfile,
            noticePeriod: job.noticePeriod,
            currentctc: job.currentctc,
            employmentType: job.employmentType,
          }));
          setEmploymentHistory(normalizedData);
          setCanAddNew(normalizedData.length === 0);
        }
      } catch (error) {
        console.error("Error fetching employment data:", error);
        setEmploymentHistory([]);
        setCanAddNew(true);
      }
    };

    fetchEmploymentData();
  }, []);

  const handleOpen = async (index = null) => {
    if (index === null && !canAddNew) {
      Swal.fire({
        icon: "info",
        title: "Limit Reached",
        text: "You can only have one employment record. Please edit or delete the existing record.",
      });
      return;
    }

    if (index !== null) {
      const employmentId = employmentHistory[index]?.employmentId;
      console.log("Editing Employment ID:", employmentId);

      try {
        const response = await getEmployment_Id(headers, employmentId);
        console.log("API Response:", response);

        if (response) {
          setFormData({
            jobTitle: response.jobTitle || "",
            companyName: response.companyName || "",
            employmentType: response.employmentType || "",
            currentctc: response.currentctc || "",
            skill: response.skill || "",
            jobProfile: response.jobProfile || "",
            noticePeriod: response.noticePeriod || "",
            employmentId: response.employmentId || "",
          });
          setEditIndex(index);
        }
      } catch (error) {
        console.error("Error fetching employment data:", error);
      }
    } else {
      setFormData({
        jobTitle: "",
        companyName: "",
        employmentType: "",
        currentctc: "",
        skill: "",
        jobProfile: "",
        noticePeriod: "",
        employmentId: null,
      });
      setEditIndex(null);
    }

    setErrors({});
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!formData.companyName.trim()) {
      setErrors({ ...errors, companyName: "Company Name is required" });
      return;
    }
    if (!formData.jobTitle.trim()) {
      setErrors({ ...errors, jobTitle: "Job Title is required" });
      return;
    }
    if (!formData.currentctc.trim()) {
      setErrors({ ...errors, currentctc: "Current CTC is required" });
      return;
    }
    if (!formData.skill.trim()) {
      setErrors({ ...errors, skill: "Skill is required" });
      return;
    }
    if (!formData.jobProfile.trim()) {
      setErrors({ ...errors, jobProfile: "Job Profile is required" });
      return;
    }
    if (!formData.noticePeriod.trim()) {
      setErrors({ ...errors, noticePeriod: "Notice Period is required" });
      return;
    }
    if (!formData.employmentType.trim()) {
      setErrors({ ...errors, employmentType: "Employment Type is required" });
      return;
    }

    const jobSeekerId = parseInt(user?.seekerId);
    const jobseekerProfileId = parseInt(
      sessionStorage.getItem("jobseekerProfileId")
    );

    const employmentData = {
      employmentId: editIndex !== null ? employmentHistory[editIndex]?.employmentId : null,
      companyName: formData.companyName,
      currentctc: formData.currentctc,
      employmentType: formData.employmentType,
      jobProfile: formData.jobProfile,
      jobSeekerDtoList: { seekerId: jobseekerProfileId },
      jobSeekerProfileDtoList: { jobseekerProfileId: jobSeekerId },
      jobTitle: formData.jobTitle,
      noticePeriod: formData.noticePeriod,
      skill: formData.skill,
    };

    try {
      if (editIndex !== null) {
        await updateEmployment(employmentData, headers);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Employment record updated successfully!",
        });
      } else {
        await createEmployment(employmentData, headers);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Employment record created successfully!",
        });
        setCanAddNew(false);
      }

      handleClose();

      const updatedResponse = await getEmploymentById(headers, jobSeekerId);
      if (updatedResponse.data) {
        const updatedData = (
          Array.isArray(updatedResponse.data)
            ? updatedResponse.data
            : [updatedResponse.data]
        ).map((job) => ({
          employmentId: job.employmentId,
          companyName: job.companyName,
          jobTitle: job.jobTitle,
          skill: job.skill,
          jobProfile: job.jobProfile,
          noticePeriod: job.noticePeriod,
          currentctc: job.currentctc,
          employmentType: job.employmentType,
        }));
        setEmploymentHistory(updatedData);
      }
    } catch (error) {
      console.error("Error saving employment:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save employment record. Please try again.",
      });
    }
  };

  const handleDelete = async (index) => {
    const employmentId = employmentHistory[index].employmentId;

    try {
      const isDeleted = await deleteEmployment(employmentId, headers);
      if (isDeleted) {
        setEmploymentHistory(employmentHistory.filter((_, i) => i !== index));
        setCanAddNew(true);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Employment record has been deleted.",
        });
      }
    } catch (error) {
      console.error("Error deleting employment record:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete employment record. Please try again.",
      });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Employment History</Typography>
        <Tooltip
          title={
            !canAddNew
              ? "You can only have one employment record. Edit or delete the existing record."
              : "Add employment history"
          }
        >
          <span>
            <IconButton
              onClick={() => handleOpen(null)}
              disabled={!canAddNew}
              color="primary"
            >
              <Add />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Divider sx={{ my: 1 }} />
      {employmentHistory.length === 0 ? (
        <Typography variant="body2">
          Click + to add employment history.
        </Typography>
      ) : (
        employmentHistory.map((job, index) => (
          <Box
            key={index}
            sx={{
              py: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="body2">
                <strong>Company Name:</strong> {job.companyName}
              </Typography>
              <Typography variant="body2">
                <strong>Job Title:</strong> {job.jobTitle}
              </Typography>
              <Typography variant="body2">
                <strong>Employment Type:</strong> {job.employmentType}
              </Typography>
              <Typography variant="body2">
                <strong>Current CTC:</strong> ₹{job.currentctc}
              </Typography>
              <Typography variant="body2">
                <strong>Skill:</strong> {job.skill}
              </Typography>
              <Typography variant="body2">
                <strong>Job Profile:</strong> {job.jobProfile}
              </Typography>
              <Typography variant="body2">
                <strong>Notice Period:</strong> {job.noticePeriod}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Edit record">
                <IconButton onClick={() => handleOpen(index)} color="primary">
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete record">
                <IconButton
                  onClick={() => handleDelete(index)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editIndex !== null ? "Edit Employment" : "Add Employment"}
        </DialogTitle>
        <DialogContent>
          {[
            { label: "Company Name", key: "companyName" },
            { label: "Job Title", key: "jobTitle" },
            { label: "Current CTC (₹)", key: "currentctc" },
            { label: "Skill", key: "skill" },
            { label: "Job Profile", key: "jobProfile", multiline: true, rows: 3 },
          ].map(({ label, key, multiline = false, rows = 1 }) => (
            <TextField
              key={key}
              label={label}
              fullWidth
              multiline={multiline}
              rows={rows}
              value={formData[key]}
              onChange={(e) => {
                setFormData({ ...formData, [key]: e.target.value });
                setErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
              }}
              error={!!errors[key]}
              helperText={errors[key]}
              required
              sx={{ mt: 2 }}
            />
          ))}

          <FormControl fullWidth error={!!errors.employmentType} sx={{ mt: 2 }}>
            <InputLabel>Employment Type</InputLabel>
            <Select
              value={formData.employmentType}
              onChange={(e) => {
                setFormData({ ...formData, employmentType: e.target.value });
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  employmentType: "",
                }));
              }}
              label="Employment Type"
            >
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Temporary">Temporary</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Freelance">Freelance</MenuItem>
              <MenuItem value="Internship">Internship</MenuItem>
              <MenuItem value="Gig-work">Gig-work</MenuItem>
            </Select>
            {errors.employmentType && (
              <Typography variant="caption" color="error">
                {errors.employmentType}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth error={!!errors.noticePeriod} sx={{ mt: 2 }}>
            <InputLabel>Notice Period</InputLabel>
            <Select
              value={formData.noticePeriod}
              onChange={(e) => {
                setFormData({ ...formData, noticePeriod: e.target.value });
                setErrors((prevErrors) => ({ ...prevErrors, noticePeriod: "" }));
              }}
              label="Notice Period"
            >
              {noticePeriodOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {errors.noticePeriod && (
              <Typography variant="caption" color="error">
                {errors.noticePeriod}
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} variant="contained">
            {editIndex !== null ? "Update" : "Add"}
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employment;