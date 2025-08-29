import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { MenuItem } from "@mui/material";
import Swal from "sweetalert2";
import { createSocialmedia, deleteSocialMedia, getSocialmediaById, getSocialmediaDetails, updatesocialmedia } from "views/API/SocialMediaApi";

const ContactInfo = () => {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState([]);

  // Validation States
  const [platformError, setPlatformError] = useState("");
  const [urlError, setUrlError] = useState("");

  const urlPattern = /^(https?:\/\/)?([\w\d-]+\.)+[\w]{2,}(\/.*)?$/;

  const user = JSON.parse(sessionStorage.getItem("user"));
  const headers = {
    "Content-type": "application/json",
    Authorization: "Bearer " + user?.accessToken,
  };

  // Fetch data from API when component loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobseekerProfileId = sessionStorage.getItem("jobseekerProfileId");

        // Fetch social media links from API
        const response = await getSocialmediaById(headers,jobseekerProfileId);
        console.log(response);

        // Map the response to match our state structure
        const formattedLinks = response?.data?.map(item => ({
          id: item.socialmediaId, // Include the socialmediaId
          platform: item.socialmediaName,
          url: item.socialmediaLink,
        })) || [];

        setLinks(formattedLinks);
      } catch (error) {
        console.error("Error fetching social media links:", error);
      }
    };

    fetchData();
  }, []);

  const handleOpen = async (index = null) => {
    if (index !== null) {
      const socialmediaId = links[index].id;
      try {
        const response = await getSocialmediaDetails(socialmediaId, headers);
        console.log(response)
        const socialMediaData = response;

        setPlatform(socialMediaData.socialmediaName || "");
        setUrl(socialMediaData.socialmediaLink || "");
        setEditIndex(index);
      } catch (error) {
        console.error("Error fetching social media details:", error);

        return;
      }
    } else {
      setPlatform("");
      setUrl("");
      setEditIndex(null);
    }
    setPlatformError("");
    setUrlError("");
    setOpen(true);
  };


  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    let newErrors = { platform: false, url: false };

    if (!platform.trim()) {
      newErrors.platform = true;
    }
    if (!url.trim() || !urlPattern.test(url)) {
      newErrors.url = true;
    }

    if (newErrors.platform || newErrors.url) {
      setPlatformError(newErrors.platform ? "Social Media Name is required." : "");
      setUrlError(newErrors.url ? "Enter a valid URL (e.g., https://example.com)." : "");
      return;
    }

    const user = JSON.parse(sessionStorage.getItem("user"));
    const jobSeekerId = parseInt(user?.seekerId);
    const jobseekerProfileId = parseInt(sessionStorage.getItem("jobseekerProfileId"));

 

    const payload = {
      socialmediaId: editIndex !== null ? links[editIndex].id : undefined,
      socialmediaName: platform,
      socialmediaLink: url,
      jobSeekerDtoList: { seekerId: jobSeekerId },
      jobSeekerProfileDtoList: { jobseekerProfileId: jobseekerProfileId},
    };

    try {
      if (editIndex !== null) {
        // Update existing social media link
        await updatesocialmedia(payload, headers);
        const updatedLinks = [...links];
        updatedLinks[editIndex] = { ...links[editIndex], platform, url };
        setLinks(updatedLinks);
      } else {
        // Create new social media link
        await createSocialmedia(payload, headers);
        setLinks([...links, { id: payload.socialmediaId, platform, url }]);
      }

      // Reset form
      setPlatform("");
      setUrl("");
      setEditIndex(null);
      setPlatformError("");
      setUrlError("");

      handleClose();
      console.log(`Social media link ${editIndex !== null ? "updated" : "added"} successfully.`);
    } catch (error) {
      console.error(`Error ${editIndex !== null ? "updating" : "saving"} social media link:`, error);
    }
  };




  const handleDelete = async (index, socialmediaId) => {
    try {
      const isDeleted = await deleteSocialMedia(socialmediaId, headers);

      if (isDeleted) {
        // Remove the deleted link from the state
        setLinks((prev) => prev.filter((_, i) => i !== index));

        Swal.fire("Deleted!", "Your social media link has been deleted.", "success");
      }
    } catch (error) {
      console.error("Error deleting social media link:", error);
      Swal.fire("Error", "Failed to delete the link.", "error");
    }
  };


  return (
    <Box sx={{ maxWidth: "xl", border: "1px solid #ddd", borderRadius: 2, padding: 2, backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">Contact Links</Typography>
        <IconButton onClick={() => handleOpen(null)}>
          <Add sx={{ color: "#0095a5" }} />
        </IconButton>
      </Box>

      <Divider sx={{ my: 1 }} />

      {links.length === 0 ? (
        <Typography variant="body1" sx={{ color: "gray", fontStyle: "italic", textAlign: "initial", py: 2 }}>
          Click <Add fontSize="small" sx={{ verticalAlign: "middle" }} /> to add a contact link
        </Typography>
      ) : (
        links.map((link, index) => (
          <React.Fragment key={index}>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontWeight="bold">{link.platform}</Typography>
                <Typography variant="body2">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#1976d2" }}>
                    {link.url}
                  </a>
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleOpen(index)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(index, link.id)} color="error">
                  <Delete />
                </IconButton>
              </Box>
            </Box>
            {index !== links.length - 1 && <Divider />}
          </React.Fragment>
        ))
      )}

      {/* Dialog for Adding/Editing Links */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editIndex !== null ? "Edit Contact Link" : "Add Contact Link"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            select
            label="Social Media Name"
            variant="outlined"
            fullWidth
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              if (e.target.value.trim()) {
                setPlatformError("");
              }
            }}
            error={Boolean(platformError)}
            helperText={platformError}
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="LinkedIn">LinkedIn</MenuItem>
            <MenuItem value="GitHub">GitHub</MenuItem>
          </TextField>


          <TextField
            label="Social Media Link"
            variant="outlined"
            fullWidth
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (urlPattern.test(e.target.value)) {
                setUrlError("");
              }
            }}
            error={Boolean(urlError)}
            helperText={urlError}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: "#0095a5" }}>
            {editIndex !== null ? "Update" : "Add"}
          </Button>
          <Button onClick={handleClose} sx={{ color: "#0095a5" }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactInfo;