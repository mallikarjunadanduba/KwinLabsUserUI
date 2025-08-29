import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Container,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { createCourse, deleteCourse, getBycourseId, getCourseBy_Id, updateCourse,  } from "views/API/CourseApi";

const Courses = () => {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [coursesList, setCoursesList] = useState([]);
  const [errors, setErrors] = useState({ courseName: "", description: "" });

  // Headers and tokens
  const user = JSON.parse(sessionStorage.getItem("user"));
  const headers = {
    "Content-type": "application/json",
    Authorization: "Bearer " + user?.accessToken,
  };

  // Fetch courses from the server
  const fetchCourses = async () => {
   
    const jobseekerProfileId = sessionStorage.getItem("jobseekerProfileId");

    try {
      const response = await getCourseBy_Id(headers, jobseekerProfileId);
      console.log(response)
      setCoursesList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Call fetchCourses when the component mounts
  useEffect(() => {
    fetchCourses();
  }, []);

  //  Opens dialog for editing
  const handleOpen = async (index = null) => {
    if (index !== null) {
      const course = coursesList[index];  // Get the selected course
  
      try {
        // Fetch course data by ID
        const response = await getBycourseId(course.courseId,headers );
        console.log("Fetched Course Details:", response);
  
        if (response) {
          setCourseName(response.courseName);
          setDescription(response.description);
          setEditIndex(index); // Set the index to track editing
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    } else {
      // Reset fields for adding a new course
      setCourseName("");
      setDescription("");
      setEditIndex(null);
    }
  
    setErrors({ courseName: "", description: "" }); // Reset errors
    setOpen(true);
  };
  
  

  // Closes dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Saves the new/edited course
  const handleSave = async () => {
    if (!courseName.trim()) {
      setErrors({ ...errors, courseName: "Course Name is required" });
      return;
    }
    if (!description.trim()) {
      setErrors({ ...errors, description: "Description is required" });
      return;
    }

    const jobSeekerId = parseInt(user?.seekerId);
    const jobseekerProfileId = parseInt(sessionStorage.getItem("jobseekerProfileId"));

    const courseData = {
      courseId: editIndex !== null ? coursesList[editIndex]?.courseId : null, // Include courseId only if editing
      jobSeekerDtoList: { seekerId: jobSeekerId },
     jobSeekerProfileDtoList: { jobseekerProfileId: jobseekerProfileId  },
      courseName,
      description,
    };

    try {
      if (editIndex !== null) {
        // Update course if editing
        await updateCourse(courseData, headers);
      } else {
        // Create new course if adding
        await createCourse(courseData, headers);
      }

      handleClose(); // Close dialog on success

      // Refresh the course list after update
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  // Deletes a course
  const handleDelete = async (index) => {
    const courseId = coursesList[index].courseId;
  
    try {
      const isDeleted = await deleteCourse(courseId, headers);
      if (isDeleted) {
        // Remove the deleted course from the list
        setCoursesList(coursesList.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  return (
    <Container maxWidth="xl" style={{ marginTop: "20px" }}>
      <Box
        sx={{
          maxWidth: "xl",
          border: "1px solid #ddd",
          borderRadius: 2,
          padding: 2,
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Courses
          </Typography>
          <IconButton onClick={() => handleOpen(null)}>
            <Add sx={{ color: "#0095a5" }} />
          </IconButton>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Placeholder Message When No Courses Are Added */}
        {coursesList.length === 0 ? (
          <Typography
            variant="body1"
            sx={{ color: "gray", fontStyle: "italic", textAlign: "initial", py: 2 }}
          >
            Click <Add fontSize="small" sx={{ verticalAlign: "middle" }} /> to add course
          </Typography>
        ) : (
          coursesList.map((course, index) => (
            <React.Fragment key={course.courseId}>
              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
                <Box>
                  <Typography variant="body2">
                    <strong>Course Name:</strong> {course.courseName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Description:</strong> {course.description}
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => handleOpen(index)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(index)} color="error">
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
              {index !== coursesList.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}

        {/* Dialog for Adding/Editing Course */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editIndex !== null ? "Edit Course" : "Add Course"}</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField
              label="Course Name"
              variant="outlined"
              fullWidth
              value={courseName}
              error={!!errors.courseName}
              helperText={errors.courseName}
              onChange={(e) => {
                setCourseName(e.target.value);
                if (errors.courseName) setErrors({ ...errors, courseName: "" }); // Reset error
              }}
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={description}
              error={!!errors.description}
              helperText={errors.description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: "" }); // Reset error
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: "#0095a5" }}>
              {editIndex !== null ? "Update" : "Add"}
            </Button>
            <Button onClick={handleClose} sx={{ color: "#0095a5" }}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Courses;
