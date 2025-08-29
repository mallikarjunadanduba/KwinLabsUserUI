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
import {
    createCertificate,
    deleteCertificate,
    getCertificateBy_Id,
    getCertificateDetails,
    updateCertificate,
} from "views/API/CertificateApi";
import AuthImage from "ImageUrlExtracter/AuthImage";

const Certification = () => {
    const [certifications, setCertifications] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [newCert, setNewCert] = useState({
        certificateName: "",
        fileName: ""
    });
    const [errors, setErrors] = useState({ certificateName: false });
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

    // Fetch certificates from API
    useEffect(() => {

        const jobseekerProfileId = sessionStorage.getItem("jobseekerProfileId");

        const fetchCertificates = async () => {

            try {
                const response = await getCertificateBy_Id(headers, jobseekerProfileId);
                console.log(response.data);
                if (response.data) {
                    setCertifications(response.data);
                }
            } catch (error) {
                console.error("Error fetching certificates:", error);
            }
        };

        fetchCertificates();
    }, []);

    const handleOpenDialog = async (index = null) => {
        if (index !== null) {
            const cert = certifications[index];

            try {
                // Fetch certificate details by ID
                const response = await getCertificateDetails(cert.certificateId, headers);
                console.log(response);

                if (response) {
                    setNewCert({
                        certificateName: response.certificateName,
                        fileName: response.fileName,
                    });

                    setFileName(response.fileName);

                    // **Save the filePath for previewing the image**
                    setSelectedFile(`${ImageUrl}${response.filePath}`);
                }
            } catch (error) {
                console.error("Error fetching certificate details:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to fetch certificate details.",
                });
                return;
            }

            setEditingIndex(index);
        } else {
            // Reset for adding new certificate
            setNewCert({ certificateName: "", fileName: "" });
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
                const { fileName } = response.data;

                setNewCert((prev) => ({
                    ...prev,
                    fileName: fileName,  // Set the uploaded file name in newCert
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

        let newErrors = { certificateName: false };

        if (!newCert.certificateName.trim()) {
            newErrors.certificateName = true;
            setErrors(newErrors);
            return;
        }

        const user = JSON.parse(sessionStorage.getItem("user"));
        const jobSeekerId = parseInt(user?.seekerId);
        const jobseekerProfileId = parseInt(sessionStorage.getItem("jobseekerProfileId"));

        if (!jobSeekerId || !jobseekerProfileId) {
            await Swal.fire({
                icon: "error",
                title: "Missing Data",
                text: "User details are missing. Please log in again.",
                confirmButtonText: "OK",
            });
            return;
        }

        let payload = {
            certificateName: newCert.certificateName,
            fileName: newCert.fileName, // Ensure fileName is included
            jobSeekerDtoList: { seekerId: jobSeekerId },
            jobSeekerProfileDtoList: { jobseekerProfileId: jobseekerProfileId },
        };

        try {
            if (editingIndex !== null) {
                // Update existing certificate
                payload.certificateId = certifications[editingIndex].certificateId;
                await updateCertificate(payload, headers);
            } else {
                // Create new certificate
                await createCertificate(payload, headers);
            }

            // Refresh certificates list
            const response = await getCertificateBy_Id(headers, jobSeekerId);
            setCertifications(response.data || []);

            // Reset form
            setNewCert({ certificateName: "", fileName: "" });
            setFileName("");
            setErrors({ certificateName: false });
            setSelectedFile(null);
            setEditingIndex(null);
            setOpenDialog(false);
        } catch (error) {
            console.error("Error saving certificate:", error);
            Swal.fire({
                icon: "error",
                title: "Save Failed",
                text: "There was an issue saving the certificate. Please try again.",
            });
        }
    };


    const handleDeleteCertification = async (index, certificateId) => {
        try {
            const isDeleted = await deleteCertificate(certificateId, headers);

            if (isDeleted) {
                // Remove the certification from the UI using the index
                setCertifications((prev) => prev.filter((_, i) => i !== index));
            }
        } catch (error) {
            console.error("Error deleting certificate:", error);
        }
    };

    return (
        <Box sx={{ maxWidth: "xl", border: "1px solid #ddd", borderRadius: 2, padding: 2, backgroundColor: "#fff" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">Certificates</Typography>
                <IconButton onClick={() => handleOpenDialog()} sx={{ color: "#0095a5" }}><Add /></IconButton>
            </Box>
            <Divider sx={{ my: 1 }} />

            {certifications.length === 0 ? (
                <Typography variant="body1" sx={{ color: "gray", fontStyle: "italic", textAlign: "initial", py: 2 }}>
                    Click <Add fontSize="small" sx={{ verticalAlign: "middle" }} /> to add certificates
                </Typography>
            ) : (
                <AnimatePresence>
                    {certifications.map((cert, index) => {
                        const imageUrl = cert.filePath ? `${ImageUrl}${cert.filePath}` : "";

                        return (
                            <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Paper sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2, display: "flex", alignItems: "center" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        {cert.filePath && (
                                            <AuthImage
                                                filePath={cert.filePath}
                                                alt={cert.certificateName}
                                                style={{ width: 200, height: 100, borderRadius: 5 }}
                                            />
                                        )}
                                        <Typography variant="subtitle1"><strong>Name:</strong> {cert.certificateName}</Typography>
                                    </Box>
                                    <Box sx={{ marginLeft: "auto" }}>
                                        <IconButton onClick={() => handleOpenDialog(index, cert.certificateId)} color="primary"><Edit /></IconButton>
                                        <IconButton color="error" onClick={() => handleDeleteCertification(index, cert.certificateId)}><Delete /></IconButton>
                                    </Box>
                                </Paper>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth id="your-dialog-id">
                <DialogTitle>{editingIndex !== null ? "Edit Certificate" : "Add Certificate"}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Certificate Name*"
                        value={newCert.certificateName}
                        onChange={(e) => handleChange(e, "certificateName")}
                        margin="normal"
                        required
                        error={errors.certificateName}
                        helperText={errors.certificateName ? "Certificate Name is required" : ""}
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

export default Certification;