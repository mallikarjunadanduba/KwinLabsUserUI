import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import HistoryIcon from "@mui/icons-material/History";
import Swal from "sweetalert2";
import { fetchMcqTopic, getMcqDataByRequest } from "views/API/MCATestApi";

const TestInstructions = () => {
  const navigate = useNavigate();
  const [isSingleTab, setIsSingleTab] = useState(true);
  const [topicList, setTopicList] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const tabIdRef = useRef(Date.now());
  const channelRef = useRef(null);

  const testName = "Full Stack Developer Assessment";
  const totalQuestions = 20;
  const selectedMode = "TEST";
  const durationMinutes = 20;

  const user = JSON.parse(sessionStorage.getItem("user"));
  const headers = {
    "Content-type": "application/json",
    Authorization: "Bearer " + user.accessToken,
  };

  // Broadcast Channel: Detect multiple tabs
  useEffect(() => {
    const channel = new BroadcastChannel("exam_channel");
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
      .then((data) => {
        setTopicList(data?.content || []);
      })
      .catch((err) => {
        console.error("Error fetching topics:", err);
      });
  }, []);

  const handleStart = async () => {
    if (!isSingleTab) {
      Swal.fire("Multiple Tabs", "Please close other tabs to proceed.", "warning");
      return;
    }

    if (!selectedMode || !selectedTopic) {
      Swal.fire("Incomplete", "Please select both mode and topic", "warning");
      return;
    }

    const selectedTopicObj = topicList.find((topic) => topic.topicId === selectedTopic);
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
          topicName: selectedTopicObj.topicName,
        },
      ],
    };

    try {
      const data = await getMcqDataByRequest(requestBody, headers);
      if (data && data.length > 0) {
        navigate("/jobs/exam", {
          state: {
            mcqData: data,
            selectedTopic: selectedTopicObj,
            selectedMode: selectedMode,
          },
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
    <Box sx={{ bgcolor: "#f0f4f8", py: 5, px: 2, minHeight: "82%", display: "flex", justifyContent: "center", alignItems: 'center' }}>
      <Paper elevation={6} sx={{ maxWidth: 960, width: "100%", borderRadius: 3, p: 4 }}>
        {/* Header */}
        <Typography variant="h4" fontWeight={600} color="primary.main" mb={2}>
          {testName}
        </Typography>

        {/* Meta Info */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2">Total Questions</Typography>
            <Typography variant="body1">{totalQuestions}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2">Duration</Typography>
            <Typography variant="body1">{durationMinutes} Minutes</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2">Sections</Typography>
            <Typography variant="body1">3</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2">Mode</Typography>
            <Typography variant="body1" color="primary">{selectedMode}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Instructions */}
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Instructions
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li><Typography>Timed test – auto-submits when time ends.</Typography></li>
          <li><Typography>Unattempted questions do not have negative marking.</Typography></li>
          <li><Typography>You can submit early to view results immediately.</Typography></li>
          <li><Typography>Review answers with correct solutions after submission.</Typography></li>
        </Box>

        {/* Select Topic */}
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Select Topic</InputLabel>
          <Select
            value={selectedTopic}
            label="Select Topic"
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            {topicList.map((topic) => (
              <MenuItem key={topic.topicId} value={topic.topicId}>
                {topic.topicName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Buttons */}
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<PlayArrowIcon />}
              onClick={handleStart}
              sx={{ px: 4, py: 1.5, fontSize: "16px", fontWeight: 500 }}
            >
              Start Test
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              endIcon={<HistoryIcon />}
              onClick={() => navigate("/jobs/examhistory")}
              sx={{ px: 4, py: 1.5, fontSize: "16px", fontWeight: 500 }}
            >
              View Test History
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TestInstructions;
