import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Typography, Button, Paper, Divider, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Swal from "sweetalert2";
import { fetchMcqTopic, getMcqDataByRequest } from "views/API/MCATestApi";

const AcademicPractice = () => {
    const navigate = useNavigate();
    const [isSingleTab, setIsSingleTab] = useState(true);
    const [topicList, setTopicList] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedUniversity, setSelectedUniversity] = useState("");
    const [selectedEducation, setSelectedEducation] = useState("");
    const [selectedInterviewTopic, setSelectedInterviewTopic] = useState("");
    const [selectedExpertiseLevel, setSelectedExpertiseLevel] = useState("");
    const [selectedExperience, setSelectedExperience] = useState("");
    const tabIdRef = useRef(Date.now());
    const channelRef = useRef(null);

    const totalQuestions = 20;
    const selectedMode = "PRACTICE"; 

    // University options - Karnataka Universities
    const universities = [
        { value: "bangalore-university", label: "Bangalore University" },
        { value: "visvesvaraya-technological-university", label: "Visvesvaraya Technological University" },
        { value: "karnataka-university", label: "Karnataka University" },
        { value: "mysore-university", label: "Mysore University" },
        { value: "gulbarga-university", label: "Gulbarga University" },
        { value: "mangalore-university", label: "Mangalore University" },
        { value: "kuvempu-university", label: "Kuvempu University" },
        { value: "tumkur-university", label: "Tumkur University" },
        { value: "rajiv-gandhi-university", label: "Rajiv Gandhi University of Health Sciences" },
        { value: "karnataka-state-law-university", label: "Karnataka State Law University" },
        { value: "karnataka-state-open-university", label: "Karnataka State Open University" },
        { value: "karnataka-state-rural-development", label: "Karnataka State Rural Development and Panchayat Raj University" },
        { value: "karnataka-state-womens-university", label: "Karnataka State Women's University" },
        { value: "karnataka-state-sanskrit-university", label: "Karnataka State Sanskrit University" },
        { value: "karnataka-state-music-university", label: "Karnataka State Music University" },
        { value: "karnataka-state-folklore-university", label: "Karnataka State Folklore University" },
        { value: "karnataka-state-veterinary-university", label: "Karnataka State Veterinary, Animal and Fisheries Sciences University" },
        { value: "karnataka-state-agricultural-university", label: "Karnataka State Agricultural University" },
        { value: "karnataka-state-horticultural-university", label: "Karnataka State Horticultural University" },
        { value: "karnataka-state-fisheries-university", label: "Karnataka State Fisheries University" },
        { value: "other", label: "Other University" }
    ];

    // Education options
    const educationTypes = [
        { value: "bsc-cs", label: "BSC – CS" },
        { value: "bca", label: "BCA" },
        { value: "be-cs-is", label: "BE (CS & IS)" },
        { value: "msc-cs", label: "M.SC (CS)" },
        { value: "mca", label: "MCA" },
        { value: "mtech", label: "M. Tech" }
    ];

    // Interview Topic options
    const interviewTopics = [
        { value: "java", label: "Java" },
        { value: "python", label: "Python" },
        { value: "dbms", label: "DBMS" },
        { value: "ai-ml", label: "AI/ML" },
        { value: "data-science", label: "Data Science" },
        { value: "front-end", label: "Front End" }
    ];

    // Expertise Level options
    const expertiseLevels = [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "expert", label: "Expert" }
    ];

    // Experience options
    const experienceLevels = [
        { value: "fresher", label: "Fresher" },
        { value: "0-1", label: "0-1 Year" },
        { value: "1-3", label: "1-3 Years" },
        { value: "3-5", label: "3-5 Years" },
        { value: "5+", label: "5+ Years" }
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

        if (!selectedUniversity) {
            Swal.fire("Incomplete", "Please select university", "warning");
            return;
        }

        if (!selectedEducation) {
            Swal.fire("Incomplete", "Please select education", "warning");
            return;
        }

        if (!selectedInterviewTopic) {
            Swal.fire("Incomplete", "Please select interview topic", "warning");
            return;
        }

        if (!selectedExpertiseLevel) {
            Swal.fire("Incomplete", "Please select expertise level", "warning");
            return;
        }

        if (!selectedExperience) {
            Swal.fire("Incomplete", "Please select experience", "warning");
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
            university: selectedUniversity,
            education: selectedEducation,
            interviewTopic: selectedInterviewTopic,
            expertiseLevel: selectedExpertiseLevel,
            experience: selectedExperience
        };

        try {
            const data = await getMcqDataByRequest(requestBody, headers);
            if (data && data.length > 0) {
                navigate("/jobs/exam", {
                    state: {
                        mcqData: data,
                        selectedTopic: selectedTopicObj,
                        selectedMode,
                        university: selectedUniversity,
                        education: selectedEducation,
                        interviewTopic: selectedInterviewTopic,
                        expertiseLevel: selectedExpertiseLevel,
                        experience: selectedExperience
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
            <Paper elevation={4} sx={{ maxWidth: 1200, width: "100%", p: 5, borderRadius: 3, textAlign: "left" }}>

                <Typography variant="h4" fontWeight={600} color="primary.main" gutterBottom>
                    Academic Practice Instructions
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">• Timed academic practice; auto-submit after time ends.</Typography>
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

                {/* Five dropdowns section */}
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

                    {/* University selector */}
                    <FormControl fullWidth sx={{ minWidth: 200, flex: 1 }}>
                        <InputLabel>University</InputLabel>
                        <Select 
                            value={selectedUniversity} 
                            onChange={(e) => setSelectedUniversity(e.target.value)} 
                            label="University"
                        >
                            {universities.map((university) => (
                                <MenuItem key={university.value} value={university.value}>
                                    {university.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Education selector */}
                    <FormControl fullWidth sx={{ minWidth: 200, flex: 1 }}>
                        <InputLabel>Education</InputLabel>
                        <Select 
                            value={selectedEducation} 
                            onChange={(e) => setSelectedEducation(e.target.value)} 
                            label="Education"
                        >
                            {educationTypes.map((education) => (
                                <MenuItem key={education.value} value={education.value}>
                                    {education.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Interview Topic selector */}
                    <FormControl fullWidth sx={{ minWidth: 200, flex: 1 }}>
                        <InputLabel>Interview Topic</InputLabel>
                        <Select 
                            value={selectedInterviewTopic} 
                            onChange={(e) => setSelectedInterviewTopic(e.target.value)} 
                            label="Interview Topic"
                        >
                            {interviewTopics.map((topic) => (
                                <MenuItem key={topic.value} value={topic.value}>
                                    {topic.label}
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
                        Start Academic Practice
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default AcademicPractice;
