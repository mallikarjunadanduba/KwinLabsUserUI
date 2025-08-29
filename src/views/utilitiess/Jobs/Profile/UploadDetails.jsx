import React, { useEffect, useState } from "react";
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
  Grid,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import Swal from "sweetalert2";
import { createVideo, deleteVideo, getBy_ViedoId, getVideoById, updateVideo, } from "views/API/UploadDetailsApi";

const UploadDetails = () => {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [subject, setSubject] = useState("");
  const [uploads, setUploads] = useState([]);
  const [videoIds, setVideoIds] = useState([]); // New state for storing video IDs
  const [error, setError] = useState(false);

  // Extract YouTube ID from various URL formats
  const getYouTubeId = (url) => {
    if (!url) return null;

    if (url.includes('youtube.com/embed/')) {
      return url.split('embed/')[1].split('?')[0];
    }

    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1].split('&')[0];
    }

    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }

    return url;
  };

  const user = JSON.parse(sessionStorage.getItem('user'));
  const headers = {
    'Content-type': 'application/json',
    Authorization: 'Bearer ' + user.accessToken
  };

  // Load existing uploads from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const headers = {
          'Content-type': 'application/json',
          Authorization: 'Bearer ' + user.accessToken
        };
  
        const jobseekerProfileId = sessionStorage.getItem("jobseekerProfileId");
        const response = await getVideoById(headers, jobseekerProfileId); 
  
        if (response?.data) {
          const formattedUploads = response.data.map((video) => {
            const youtubeId = getYouTubeId(video.videoLink);
            return {
              subject: video.subject,
              youtubeId,
              videoLink: `https://www.youtube.com/embed/${youtubeId}`,
              originalLink: video.videoLink
            };
          });
          
          // Store video IDs separately
          const ids = response.data.map(video => video.videoId);
          setVideoIds(ids);
          setUploads(formattedUploads);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
  
    fetchVideos();
  }, []);

  const handleOpen = async (index = null) => {
    setError(false);
  
    if (index !== null) {
      try {
        setEditIndex(index);
        const videoId = videoIds[index]; // Get the video ID from the stored IDs
  
        const user = JSON.parse(sessionStorage.getItem("user"));
        const headers = {
          "Content-type": "application/json",
          Authorization: "Bearer " + user.accessToken,
        };
  
        // Fetch full video data by ID
        const response = await getBy_ViedoId( headers,videoId,);
        const video = response;
  
        if (video) {
          const youtubeId = getYouTubeId(video.videoLink);
          setVideoLink(video.videoLink); // Store the original link
          setSubject(video.subject || "");
        }
      } catch (err) {
        console.error("Failed to fetch video details:", err);
        Swal.fire("Error", "Could not fetch video details", "error");
      }
    } else {
      setEditIndex(null);
      setVideoLink("");
      setSubject("");
    }
  
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (!subject.trim() || !videoLink.trim()) {
      setError(true);
      return;
    }
  
    const user = JSON.parse(sessionStorage.getItem("user"));
    const jobSeekerId = user?.seekerId;
    const jobseekerProfileId = sessionStorage.getItem("jobseekerProfileId");
  
    const youtubeId = getYouTubeId(videoLink);
  
    const payload = {
      videoId: editIndex !== null ? videoIds[editIndex] : undefined, // Only include when updating
      jobSeekerDtoList: { seekerId: jobSeekerId },
      jobSeekerProfileDtoList: { jobseekerProfileId },
      subject,
      videoLink: youtubeId, // Send only the ID to server, not the full link
    };
  
    try {
      let response;
      if (editIndex !== null) {
        // UPDATE (PUT) existing video
        response = await updateVideo(payload, headers);
      } else {
        // CREATE (POST) new video
        response = await createVideo(payload, headers);
        setVideoIds([...videoIds, response.data.videoId]); // Push new ID
      }
  
      const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
      const newVideo = {
        youtubeId,
        subject,
        videoLink: embedUrl,
        originalLink: videoLink,
      };
  
      if (editIndex !== null) {
        const updatedUploads = [...uploads];
        updatedUploads[editIndex] = newVideo;
        setUploads(updatedUploads);
      } else {
        setUploads([...uploads, newVideo]);
      }
  
      setVideoLink("");
      setSubject("");
      setEditIndex(null);
      setOpen(false);
    } catch (error) {
      console.error("Error saving video:", error);
      Swal.fire("Error", "Failed to save video.", "error");
    }
  };
  

  const handleDelete = async (index) => {
    try {
      const videoId = videoIds[index];
      const user = JSON.parse(sessionStorage.getItem('user'));
      const headers = {
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + user.accessToken
      };
  
      // Call the API function that includes the confirmation dialog
      const result = await deleteVideo(videoId, headers);
  
      // Only update state if deletion was successful (result === true)
      if (result) {
        setUploads(prev => prev.filter((_, i) => i !== index));
        setVideoIds(prev => prev.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error("Failed to delete video:", error);
      // Error message is already handled by the deleteVideo function
    }
  };
  


  return (
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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">Video Uploads</Typography>
        <IconButton onClick={() => handleOpen(null)}>
          <Add sx={{ color: "#0095a5" }} />
        </IconButton>
      </Box>
      <Divider sx={{ my: 1 }} />

      {uploads.length === 0 ? (
        <Typography
          variant="body1"
          sx={{ color: "gray", fontStyle: "italic", textAlign: "initial", py: 2 }}
        >
          Click <Add fontSize="small" sx={{ verticalAlign: "middle" }} /> to add a video link
        </Typography>
      ) : (
        uploads.map((upload, index) => (
          <React.Fragment key={index}>
            <Grid container spacing={2} alignItems="center" sx={{ py: 1 }}>
              <Grid item xs={12} md={6}>
                {upload.videoLink && (
                  <Box
                    sx={{
                      position: "relative",
                      paddingBottom: "56.25%",
                      height: 0,
                      overflow: "hidden",
                      borderRadius: 1,
                      boxShadow: 1,
                    }}
                  >
                    <iframe
                      src={upload.videoLink}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Embedded video ${index}`}
                    />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6} display="flex" flexDirection="column">
                <Typography variant="h6" gutterBottom>{upload.subject}</Typography>
                <Box display="flex" justifyContent="flex-end">
                  <IconButton onClick={() => handleOpen(index)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(index)} color="error">
                    <Delete />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
            {index !== uploads.length - 1 && <Divider />}
          </React.Fragment>
        ))
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editIndex !== null ? "Edit Video" : "Add Video"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          <TextField
            label="YouTube Video URL"
            variant="outlined"
            fullWidth
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            error={error && !videoLink}
            helperText={
              error && !videoLink
                ? "Video link is required."
                : "Paste a YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
            }
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <TextField
            label="Subject"
            variant="outlined"
            fullWidth
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={error && !subject}
            helperText={error && !subject ? "Subject is required." : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ backgroundColor: "#0095a5" }}
          >
            {editIndex !== null ? "Update" : "Add"}
          </Button>
          <Button onClick={handleClose} sx={{ color: "#0095a5" }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UploadDetails;
