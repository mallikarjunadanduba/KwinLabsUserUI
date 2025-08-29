import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Typography, Button, Paper, Divider, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Swal from "sweetalert2";
import { fetchMcqTopic, getMcqDataByRequest } from "views/API/MCATestApi";

const PracticeInstructions = () => {
    const navigate = useNavigate();
    const [isSingleTab, setIsSingleTab] = useState(true);
    const [topicList, setTopicList] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedExpertiseLevel, setSelectedExpertiseLevel] = useState("");
    const [selectedExperience, setSelectedExperience] = useState("");
    const tabIdRef = useRef(Date.now());
    const channelRef = useRef(null);

    const totalQuestions = 20;
    const selectedMode = "PRACTICE"; 

    // Expertise level options
    const expertiseLevels = [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
        { value: "expert", label: "Expert" }
    ];

    // Experience options
    const experienceLevels = [
        { value: "0-1", label: "0-1 years" },
        { value: "1-3", label: "1-3 years" },
        { value: "3-5", label: "3-5 years" },
        { value: "5-10", label: "5-10 years" },
        { value: "10+", label: "10+ years" }
    ];

    const user = JSON.parse(sessionStorage.getItem("user"));
    const headers = {
        "Content-type": "application/json",
        Authorization: "Bearer " + user.accessToken
    };

    useEffect(() => {
        const channel = new BroadcastChannel('exam_channel');
        channelRef.current = channel;

        channel.postMessage({ type: "check", tabId: tabIdRef.current });

        channel.onmessage = (event) => {
            const { type, tabId } = event.data;
            if (type === "check") {
                channel.postMessage({ type: "active", tabId: tabIdRef.current });
            } else if (type === "active" && tabId !== tabIdRef.current) {
                setIsSingleTab(false);
            }
        };

        return () => {
            channel.close();
        };
    }, []);

    useEffect(() => {
        fetchMcqTopic(headers)
            .then(data => {
                setTopicList(data?.content || []);
            })
            .catch(err => {
                console.error("Error fetching topics:", err);
            });
    }, []);

    const handleStart = async () => {
        if (!isSingleTab) {
            alert("Another tab is open. Close it before starting.");
            return;
        }

        if (!selectedTopic) {
            Swal.fire("Incomplete", "Please select a topic", "warning");
            return;
        }

        if (!selectedExpertiseLevel) {
            Swal.fire("Incomplete", "Please select expertise level", "warning");
            return;
        }

        if (!selectedExperience) {
            Swal.fire("Incomplete", "Please select experience level", "warning");
            return;
        }

        const selectedTopicObj = topicList.find(topic => topic.topicId === selectedTopic);
        if (!selectedTopicObj) {
            Swal.fire("Error", "Invalid topic selected", "error");
            return;
        }

        const requestBody = {
            mode: selectedMode,
            numberOfQuestions: totalQuestions,
            mcqTopicDTOList: [
                {
                    topicId: selectedTopicObj.topicId,
                    topicName: selectedTopicObj.topicName
                }
            ],
            expertiseLevel: selectedExpertiseLevel,
            experienceLevel: selectedExperience
        };

        try {
            const data = await getMcqDataByRequest(requestBody, headers);
            if (data && data.length > 0) {
                navigate("/jobs/exam", {
                    state: {
                        mcqData: data,
                        selectedTopic: selectedTopicObj,
                        selectedMode,
                        expertiseLevel: selectedExpertiseLevel,
                        experienceLevel: selectedExperience
                    }
                });
            } else {
                Swal.fire("No Questions", "No MCQs available for selected filters.", "info");
            }
        } catch (err) {
            console.error("MCQ fetch error:", err);
            Swal.fire("Error", "Something went wrong while fetching questions.", "error");
        }
    };

    return (
        <Box sx={{ minHeight: "100%", bgcolor: "#f4f6f8", display: "flex", justifyContent: "center", alignItems: "center", px: 2 }}>
            <Paper elevation={4} sx={{ maxWidth: 1000, width: "100%", p: 5, borderRadius: 3, textAlign: "left" }}>

                <Typography variant="h4" fontWeight={600} color="primary.main" gutterBottom>
                    Practice Instructions
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">• Timed practice; auto-submit after time ends.</Typography>
                    <Typography variant="body1">• Practice mode only; results visible after submit.</Typography>
                    <Typography variant="body1">• Unlimited attempts allowed.</Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {/* Note-style Mode display */}
                    <Box
                        sx={{
                            minWidth: 200,
                            backgroundColor: '#e3f2fd',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            border: '1px solid #90caf9',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                            Mode:
                        </Typography>
                        <Typography variant="body2" color="primary">
                            {selectedMode}
                        </Typography>
                    </Box>
                </Box>

                {/* Three dropdowns section */}
                <Box sx={{ mb: 4, display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {/* Topic selector */}
                    <FormControl fullWidth sx={{ minWidth: 200, flex: 1 }}>
                        <InputLabel>Select Topic</InputLabel>
                        <Select 
                            value={selectedTopic} 
                            onChange={(e) => setSelectedTopic(e.target.value)} 
                            label="Select Topic"
                        >
                            {topicList.map((topic) => (
                                <MenuItem key={topic.topicId} value={topic.topicId}>
                                    {topic.topicName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Expertise Level selector */}
                    <FormControl fullWidth sx={{ minWidth: 200, flex: 1 }}>
                        <InputLabel>Expertise Level</InputLabel>
                        <Select 
                            value={selectedExpertiseLevel} 
                            onChange={(e) => setSelectedExpertiseLevel(e.target.value)} 
                            label="Expertise Level"
                        >
                            {expertiseLevels.map((level) => (
                                <MenuItem key={level.value} value={level.value}>
                                    {level.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Experience selector */}
                    <FormControl fullWidth sx={{ minWidth: 200, flex: 1 }}>
                        <InputLabel>Experience</InputLabel>
                        <Select 
                            value={selectedExperience} 
                            onChange={(e) => setSelectedExperience(e.target.value)} 
                            label="Experience"
                        >
                            {experienceLevels.map((exp) => (
                                <MenuItem key={exp.value} value={exp.value}>
                                    {exp.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box textAlign="center">
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<PlayArrowIcon />}
                        onClick={handleStart}
                        sx={{
                            px: 5,
                            py: 1.5,
                            fontSize: "18px",
                            fontWeight: 500,
                            backgroundColor: "rgb(0, 175, 181)",
                            '&:hover': { backgroundColor: "rgb(0, 145, 151)" },
                        }}
                    >
                        Start Practice
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default PracticeInstructions;
