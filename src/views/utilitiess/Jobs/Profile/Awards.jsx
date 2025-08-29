import React, { useState, useRef, useEffect } from "react";
import {
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Divider,
    Grid
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import axios from "axios";
import { BaseUrl } from "BaseUrl";
import { createAwards, deleteAwards, getAwardsById, getAwardsId, updateAward } from "views/API/AwardsApi";
import AuthImage from "ImageUrlExtracter/AuthImage";

const Awards = () => {
    const [certifications, setCertifications] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [newCert, setNewCert] = useState({
        awardName: "",
        fileName: ""
    });
    const [errors, setErrors] = useState({ awardName: false });
    const [fileName, setFileName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const inputRef = useRef(null);

    const user = JSON.parse(sessionStorage.getItem('user'));
    const headers = {
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + user.accessToken
    };

    const ImageUrl = `${BaseUrl}/file/downloadFile/?filePath=`;

    // Fetch awards from API
    useEffect(() => {
        const fetchAwards = async () => {
            const ProfileId = sessionStorage.getItem("jobseekerProfileId");

            try {
                const response = await getAwardsById(headers, ProfileId)
                console.log(response.data)
                if (response.data) {
                    setCertifications(response.data);
                }
            } catch (error) {
                console.error("Error fetching awards:", error);

            }
        };

        fetchAwards();
    }, []);

    const handleOpenDialog = async (index = null) => {
        if (index !== null) {
            const cert = certifications[index];

            try {
                // Fetch award details by ID
                const response = await getAwardsId(headers, cert.awardId);
                console.log(response);

                if (response) {
                    setNewCert({
                        awardName: response.awardName,
                        fileName: response.fileName,
                    });

                    setFileName(response.fileName);

                    // **Save the filePath for previewing the image**
                    setSelectedFile(`${ImageUrl}${response.filePath}`);
                }
            } catch (error) {
                console.error("Error fetching award details:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to fetch award details.",
                });
                return;
            }

            setEditingIndex(index);
        } else {
            // Reset for adding new award
            setNewCert({ awardName: "", fileName: "" });
            setFileName("");
            setSelectedFile(null);
            setEditingIndex(null);
        }

        setOpenDialog(true);
    };




    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingIndex(null);
    };

    const handleChange = (e, field) => {
        setNewCert((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
    };

    const onFileChange = (e) => {
        setFileName(e.target.files[0].name);
        setSelectedFile(e.target.files[0]);
    };

    const onFileUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setErrors((prevErrors) => ({ ...prevErrors, selectedFile: true }));
            Swal.fire({
                icon: "error",
                title: "Upload Failed",
                text: "Please select a file before uploading!",
            });
            return;
        }

        const data = new FormData();
        data.append("file", selectedFile);

        try {
            Swal.fire({
                title: "Uploading...",
                text: "Please wait while your file is being uploaded.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await axios.post(`${BaseUrl}/file/uploadFile`, data, {
                headers: {
                    "content-type": "multipart/form-data",
                    Authorization: "Bearer " + user.accessToken,
                },
            });

            if (response.data.responseCode === 201 && response.data.status === "SUCCESS") {
                const { fileName, fileDownloadUri } = response.data;
                const url = new URL(fileDownloadUri);
                const filePath = url.searchParams.get('filePath');
                setNewCert((prev) => ({
                    ...prev,
                    fileName: fileName,
                    filePath: filePath,
                    uploadedFileUrl: fileDownloadUri,
                    selectedFile: null,
                }));

                setFileName(fileName);

                Swal.fire({
                    target: document.getElementById("your-dialog-id"),
                    icon: "success",
                    title: "File Uploaded",
                    text: response.data.message,
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error("File upload failed", error);
            Swal.fire({
                icon: "error",
                title: "Upload Failed",
                text: "File upload failed. Please try again.",
            });
        }
    };


    const handleSaveCertification = async (e) => {
        e.preventDefault();

        let newErrors = { awardName: false };

        if (!newCert.awardName.trim()) {
            newErrors.awardName = true;
            setErrors(newErrors);
            return;
        }


        const user = sessionStorage.getItem("user");
        const jobSeekerId = user?.seekerId;
        const jobseekerProfileId = sessionStorage.getItem("jobseekerProfileId");



        let payload;

        if (editingIndex !== null) {
            // Payload for updating an existing award (PUT)
            payload = {
                awardId: certifications[editingIndex].awardId, // Include award ID for update
                awardName: newCert.awardName,
                fileName: fileName,
                filePath: newCert.filePath,
                jobSeekerDtoList: { seekerId: jobSeekerId },
                jobSeekerProfileDtoList: { jobseekerProfileId: jobseekerProfileId },
            };
        } else {
            // Payload for creating a new award (POST)
            payload = {
                awardName: newCert.awardName,
                fileName: fileName,
                jobSeekerDtoList: { seekerId: jobSeekerId },
                jobSeekerProfileDtoList: { jobseekerProfileId: jobseekerProfileId },
            };
        }

        try {


            if (editingIndex !== null) {
                // Call updateAward (PUT request)
                await updateAward(payload, headers);
            } else {
                // Call createAwards (POST request)
                await createAwards(payload, headers);
            }

            // Refresh awards list
            const response = await getAwardsById(headers, jobseekerProfileId);
            setCertifications(response.data || []);

            // Reset form fields
            setNewCert({ awardName: "", fileName: "" });
            setFileName("");
            setErrors({ awardName: false });
            setSelectedFile(null);
            setEditingIndex(null);
            setOpenDialog(false);
        } catch (error) {
            console.error("Error saving award:", error);
            Swal.fire("Error", error.message, "error");
            throw error;


        }
    };



    const handleDeleteCertification = async (index, awardId) => {
        try {
            const isDeleted = await deleteAwards(awardId, headers);

            if (isDeleted) {
                // Remove the certification from the UI using the index
                setCertifications((prev) => prev.filter((_, i) => i !== index));
            }
        } catch (error) {
            console.error("Error deleting award:", error);
        }
    };






    return (
        <Box sx={{ maxWidth: "xl", border: "1px solid #ddd", borderRadius: 2, padding: 2, backgroundColor: "#fff" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">Awards</Typography>
                <IconButton onClick={() => handleOpenDialog()} sx={{ color: "#0095a5" }}><Add /></IconButton>
            </Box>
            <Divider sx={{ my: 1 }} />

            {certifications.length === 0 ? (
                <Typography variant="body1" sx={{ color: "gray", fontStyle: "italic", textAlign: "initial", py: 2 }}>
                    Click <Add fontSize="small" sx={{ verticalAlign: "middle" }} /> to add awards
                </Typography>
            ) : (
                <AnimatePresence>
                    {certifications.map((cert, index) => {
                        const imageUrl = cert.filePath ? `${ImageUrl}${cert.filePath}` : ""; // Use the correct file path

                        return (
                            <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Paper sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2, display: "flex", alignItems: "center" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        {/* Show Image if Available */}
                                        {cert.filePath && (
                                            <AuthImage
                                                filePath={cert.filePath}
                                                alt={cert.awardName}
                                                style={{ width: 200, height: 100, borderRadius: 5 }}
                                            />
                                        )}

                                        <Typography variant="subtitle1"><strong>Name:</strong> {cert.awardName}</Typography>
                                    </Box>
                                    <Box sx={{ marginLeft: "auto" }}>
                                        <IconButton onClick={() => handleOpenDialog(index, cert.awardId)} color="primary"><Edit /></IconButton>
                                        <IconButton color="error" onClick={() => handleDeleteCertification(index, cert.awardId)}><Delete /></IconButton>
                                    </Box>
                                </Paper>
                            </motion.div>
                        );
                    })}


                </AnimatePresence>

            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth id="your-dialog-id">
                <DialogTitle>{editingIndex !== null ? "Edit Award" : "Add Award"}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Award Name*"
                        value={newCert.awardName}
                        onChange={(e) => handleChange(e, "awardName")}
                        margin="normal"
                        required
                        error={errors.awardName}
                        helperText={errors.awardName ? "Award Name is required" : ""}
                    />



                    <Box mt={2}>
                        <Grid item xs={12}>
                            <TextField
                                margin="normal"
                                fullWidth
                                label="File Name"
                                value={fileName}
                                disabled
                                error={!!fileError}
                                helperText={fileError}
                                InputProps={{
                                    endAdornment: (
                                        <Button variant="contained" color="primary" onClick={onFileUpload}>
                                            Upload
                                        </Button>
                                    )
                                }}
                            />
                            <input type="file" onChange={onFileChange} ref={inputRef} style={{ marginTop: 20 }} />
                        </Grid>
                    </Box>
                </DialogContent>


                <DialogActions>
                    <Button onClick={handleSaveCertification} variant="contained" sx={{ backgroundColor: "#0095a5" }}>
                        {editingIndex !== null ? "Save" : "Add"}
                    </Button>
                    <Button onClick={handleCloseDialog} sx={{ color: "#0095a5" }}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Awards;




