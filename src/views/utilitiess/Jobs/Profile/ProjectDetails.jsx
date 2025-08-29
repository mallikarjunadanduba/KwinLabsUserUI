import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { createproject, deleteProject, getProjectById, getProjectId, updateProject } from "views/API/ProjectApi";

const ProjectDetails = () => {
    const [projects, setProjects] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [projectId, setProjectId] = useState(null);
    const [newProject, setNewProject] = useState({
        projectName: "",
        description: "",
        projectUrl: "",
        skill: "",
    });
    const [errors, setErrors] = useState({});

    const user = JSON.parse(sessionStorage.getItem('user'));
    const headers = {
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + user.accessToken
    };


    // Fetch projects details
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const jobseekerProfileId = sessionStorage.getItem("jobseekerProfileId");

            const response = await getProjectById(headers, jobseekerProfileId);
            console.log(response.data)
            setProjects(response.data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const handleChange = (e, field) => {
        setNewProject((prev) => ({ ...prev, [field]: e.target.value }));


        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleOpenDialog = async (index = null) => {
        setErrors({ projectName: "", description: "", projectUrl: "", skill: "" });

        if (index !== null) {
            const project = projects[index];

            try {

                const response = await getProjectId(headers, project.projectId);
                console.log(response);


                setNewProject({
                    projectName: response.projectName || "",
                    description: response.description || "",
                    projectUrl: response.projectUrl || "",
                    skill: response.skill || "",
                });

                setProjectId(project.projectId);
                setEditingIndex(index);
            } catch (error) {
                console.error("Error fetching project details:", error);
            }
        } else {
            setNewProject({ projectName: "", description: "", projectUrl: "", skill: "" });
            setProjectId(null);
            setEditingIndex(null);
        }

        setOpenDialog(true);
    };


    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewProject({ projectName: "", description: "", projectUrl: "", skill: "" });
        setEditingIndex(null);
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        if (!newProject.projectName.trim()) {
            newErrors.projectName = "Project Name is required";
        }
        if (!newProject.description.trim()) {
            newErrors.description = "Project Description is required";
        }
        if (!newProject.skill.trim()) {
            newErrors.skill = "Skill is required";
        }
        if (!newProject.projectUrl.trim()) {
            newErrors.projectUrl = "Project URL is required";
        } else if (!/^https?:\/\/[\w-]+(\.[\w-]+)+[/#?]?.*$/.test(newProject.projectUrl.trim())) {
            newErrors.projectUrl = "Enter a valid URL (e.g., https://example.com)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveProject = async () => {
        if (!validateForm()) {
            return; 
        }
    
        const user = JSON.parse(sessionStorage.getItem("user"));
        const jobSeekerId = parseInt(user?.seekerId);
        const jobseekerProfileId = parseInt(sessionStorage.getItem("jobseekerProfileId"));
    
        const projectData = {
            ...(projectId && { projectId }), // Only include projectId if updating
            jobSeekerDtoList: { seekerId: jobSeekerId },
            jobSeekerProfileDtoList: { jobseekerProfileId: jobseekerProfileId},
            projectName: newProject.projectName,
            description: newProject.description,
            projectUrl: newProject.projectUrl,
            skill: newProject.skill,
        };
    
        try {
            if (projectId) {
                await updateProject(projectData, headers);
            } else {
                await createproject(projectData, headers);
            }
    
            handleCloseDialog();
            fetchProjects();
        } catch (error) {
            console.error("Error saving project:", error);
        }
    };
    




    const handleRemoveProject = async (index) => {
        const project = projects[index];
    
        try {
            await deleteProject(project.projectId, headers);
            setProjects((prev) => prev.filter((_, i) => i !== index));
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };
    

    return (
        <Box sx={{ maxWidth: "xl", border: "1px solid #ddd", borderRadius: 2, padding: 2, backgroundColor: "#fff" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">Projects</Typography>
                <IconButton onClick={() => handleOpenDialog()} sx={{ color: "#0095a5" }}><Add /></IconButton>
            </Box>
            <Divider sx={{ my: 1 }} />
            {projects.length === 0 ? (
                <Typography variant="body1" sx={{ color: "gray", fontStyle: "italic", textAlign: "initial", py: 2 }}>
                    Click <Add fontSize="small" sx={{ verticalAlign: "middle" }} /> to add projects
                </Typography>
            ) : (
                <AnimatePresence>
                    {projects.map((proj, index) => (
                        <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Paper sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box>
                                    <Typography variant="subtitle1"><strong>Project:</strong> {proj.projectName}</Typography>
                                    <Typography variant="subtitle1"><strong>Description:</strong> {proj.description}</Typography>
                                    <Typography variant="subtitle1"><strong>Skill:</strong> {proj.skill}</Typography>
                                    <Typography variant="subtitle1"><strong>Project URL:</strong> <a href={proj.projectUrl} target="_blank" rel="noopener noreferrer">{proj.projectUrl}</a></Typography>
                                </Box>
                                <Box>
                                    <IconButton onClick={() => handleOpenDialog(index)} color="primary"><Edit /></IconButton>
                                    <IconButton onClick={() => handleRemoveProject(index)} color="error"><Delete /></IconButton>
                                </Box>
                            </Paper>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingIndex !== null ? "Edit Project" : "Add Project"}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Project Name*"
                        value={newProject.projectName}
                        onChange={(e) => handleChange(e, "projectName")}
                        margin="normal"
                        required
                        error={!!errors.projectName}
                        helperText={errors.projectName}
                    />
                    <TextField
                        fullWidth
                        label="Project Description*"
                        value={newProject.description}
                        onChange={(e) => handleChange(e, "description")}
                        margin="normal"
                        multiline
                        rows={4}
                        required
                        error={!!errors.description}
                        helperText={errors.description}
                    />
                    <TextField
                        fullWidth
                        label="Project URL*"
                        value={newProject.projectUrl}
                        onChange={(e) => handleChange(e, "projectUrl")}
                        margin="normal"
                        required
                        error={!!errors.projectUrl}
                        helperText={errors.projectUrl}
                    />
                    <TextField
                        fullWidth
                        label="Skill*"
                        value={newProject.skill}
                        onChange={(e) => handleChange(e, "skill")}
                        margin="normal"
                        required
                        error={!!errors.skill}
                        helperText={errors.skill}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSaveProject} variant="contained" sx={{ backgroundColor: "#0095a5" }}>{editingIndex !== null ? "Save" : "Add"}</Button>
                    <Button onClick={handleCloseDialog} sx={{ color: "#0095a5" }}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProjectDetails;
