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
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { createLanguage, deleteLanguage, getLanguageByProfileId, getLanguageId, updateLanguage } from "views/API/LanguageApi";

const Languages = () => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [languageId, setLanguageId] = useState(null); 
  const [languageName, setLanguageName] = useState("");
  const [languages, setLanguages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user"));
  const headers = {
    "Content-type": "application/json",
    Authorization: "Bearer " + user?.accessToken,
  };

  // Fetch languages when the component mounts
  useEffect(() => {
    const fetchLanguages = async () => {
      const jobseekerProfileId =sessionStorage.getItem("jobseekerProfileId");
      try {
        const response = await getLanguageByProfileId(headers,jobseekerProfileId);
        console.log("API Response:", response);
        setLanguages(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching languages:", error);
        setLanguages([]);
      }
    };

    fetchLanguages();
  }, []);

  // Open dialog and fetch data if editing
  const handleOpen = async (langId = null) => {
    if (langId) {
      try {
        const response = await getLanguageId(langId, headers);
        console.log("Fetched Language Details:", response);
        setLanguageId(response.languageId); // Dynamically set languageId
        setLanguageName(response.languageName || "");
        setEditId(langId);
      } catch (error) {
        console.error("Error fetching language by ID:", error);
      }
    } else {
      setLanguageId(null);
      setLanguageName("");
      setEditId(null);
    }
    setErrorMessage(""); 
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (!languageName.trim()) {
      setErrorMessage("Language name cannot be empty.");
      return;
    }
  
    const user = JSON.parse(sessionStorage.getItem("user"));
    const jobSeekerId = user?.seekerId;
    const jobseekerProfileId = sessionStorage.getItem("jobseekerProfileId");
  
    const requestData = {
      languageId: editId ? languageId : null,  // Include languageId only if editing
      jobSeekerDtoList: { seekerId: jobSeekerId },
      jobSeekerProfileDtoList: { jobseekerProfileId: jobseekerProfileId },
      languageName: languageName,
    };
  
    try {
      if (editId) {
        // Call updateLanguage when editing
        await updateLanguage(requestData, headers);
      } else {
        // Call createLanguage when adding
        await createLanguage(requestData, headers);
      }
  
      handleClose();
      
      // Refresh the language list after update
      const updatedLanguages = await getLanguageByProfileId (headers,jobseekerProfileId);
      setLanguages(Array.isArray(updatedLanguages.data) ? updatedLanguages.data : []);
      
    } catch (error) {
      console.error("Error saving language:", error);
      setErrorMessage("Error saving language. Please try again.");
    }
  };
  


  const handleDelete = async (langId) => {
    const jobseekerProfileId =sessionStorage.getItem("jobseekerProfileId");
    try {
      await deleteLanguage(langId, headers); // Call the API to delete the language
      // Refresh the language list after deletion
      const updatedLanguages = await getLanguageByProfileId(headers,jobseekerProfileId);
      setLanguages(Array.isArray(updatedLanguages.data) ? updatedLanguages.data : []);
    } catch (error) {
      console.error("Error deleting language:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: "xl", border: "1px solid #ddd", borderRadius: 2, padding: 2, backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">Languages</Typography>
        <IconButton onClick={() => handleOpen(null)}>
          <Add sx={{ color: "#0095a5" }} />
        </IconButton>
      </Box>
      <Divider sx={{ my: 1 }} />

      {languages.length === 0 ? (
        <Typography variant="body1" sx={{ color: "gray", fontStyle: "italic", textAlign: "initial", py: 2 }}>
          Click <Add fontSize="small" sx={{ verticalAlign: "middle" }} /> to add language
        </Typography>
      ) : (
        languages.map((lang) => (
          <React.Fragment key={lang.languageId}>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
              <Typography fontWeight="bold">{lang.languageName}</Typography>
              <Box>
                <IconButton onClick={() => handleOpen(lang.languageId)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(lang.languageId)} color="error">
                  <Delete />
                </IconButton>
              </Box>
            </Box>
            <Divider />
          </React.Fragment>
        ))
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Edit Language" : "Add Language"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          <TextField
            label="Language"
            variant="outlined"
            fullWidth
            value={languageName}
            onChange={(e) => {
              setLanguageName(e.target.value);
              setErrorMessage("");
            }}
            error={!!errorMessage}
            helperText={errorMessage}
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
            {editId ? "Update" : "Add"}
          </Button>
          <Button onClick={handleClose} sx={{ color: "#0095a5" }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Languages;
