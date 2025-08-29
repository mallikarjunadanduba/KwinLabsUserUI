import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Grid, Card, CardContent, Alert, Box, useTheme, useMediaQuery } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { fetchCourseByCourseId, fetchModulesByCourseId, fetchTopicsBymoduleId } from 'views/API/UpskillsCategoryApi';
import { Pagination } from '@mui/material';
import { useParams } from 'react-router-dom';

const SingleCourseDetails = () => {
  const [details, setDetails] = useState({});
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState({}); // Store topics by moduleId
  const [moduleError, setModuleError] = useState(null);
  const [topicError, setTopicError] = useState(null);
  const [courseError, setCourseError] = useState(null);
  const location = useLocation();
  const { courseId } = location.state || {};
  const [currentPage, setCurrentPage] = useState(1);
  const topicsPerPage = 5; // Number of topics per page
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  const user = JSON.parse(sessionStorage.getItem('user'));
  const headers = {
    'Content-type': 'application/json',
    Authorization: 'Bearer ' + user.accessToken
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };




  // Fetch all data (course, modules, and topics for each module)
  const fetchAllData = async () => {
    try {
      // Fetch course details
      const courseRes = await fetchCourseByCourseId(headers, courseId);
      if (courseRes.data) {
        setDetails(courseRes.data);
        setCourseError(null);
      } else {
        setDetails({});
        setCourseError('Course data not found.');
      }

      // Fetch modules
      const modulesRes = await fetchModulesByCourseId(headers, courseId);
      if (modulesRes.data.length > 0) {
        setModules(modulesRes.data);
        setModuleError(null);
        // Set initial selected module to first module
        setSelectedModuleId(modulesRes.data[0]?.moduleId);

        // Fetch topics for each module
        const topicsByModule = {};
        for (const module of modulesRes.data) {
          const topicsRes = await fetchTopicsBymoduleId(headers, module.moduleId);
          if (topicsRes.data.length > 0) {
            topicsByModule[module.moduleId] = topicsRes.data;
          } else {
            topicsByModule[module.moduleId] = [];
            setTopicError('No topics found for this module.');
          }
        }
        setTopics(topicsByModule); // Store all topics by moduleId
      } else {
        setModules([]);
        setModuleError('No modules found for this course.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setCourseError('Failed to fetch course data.');
      setModuleError('Failed to fetch modules.');
      setTopicError('Failed to fetch topics.');
    }
  };

  const handleModuleClick = (moduleId) => {
    setSelectedModuleId(moduleId);
    setCurrentPage(1); // Reset to first page when changing modules
  };

  // Fetch all data when the component mounts
  useEffect(() => {
    if (courseId) {
      fetchAllData();
    }
  }, [courseId]);

  return (
    <>
      {/* Course Details Section */}
      {courseError ? (
        <MainCard sx={{ mt: 2 }}>
          <Alert severity="error">{courseError}</Alert>
        </MainCard>
      ) : (
        <MainCard sx={{ mt: 2, backgroundColor: 'transparent' }}>
          <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Grid item xs={12}>
              <Card
                sx={{
                  p: 2,
                  boxShadow: 4,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.05)', boxShadow: 6 },
                  borderRadius: '16px'
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, padding: 0 }}>
                  {/* Left Side - Video */}
                  <Box
                    sx={{
                      width: { xs: '100%', md: '50%' },
                      mb: { xs: 2, md: 0 },
                      p: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <iframe
                      title="YouTube Video"
                      src={`https://www.youtube.com/embed/${details.videoUrl}`}
                      frameBorder="0"
                      allowFullScreen
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '12px',
                        aspectRatio: '16/9',
                        objectFit: 'cover'
                      }}
                    ></iframe>
                  </Box>

                  {/* Right Side - Content */}
                  <Box sx={{ width: { xs: '100%', md: '50%' }, pl: { md: 2 } }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }} gutterBottom>
                      {details.courseName}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 2, fontWeight: 'medium', color: '#555' }}>
                      Description: {details.description}
                    </Typography>

                    {/* Price and Discount Section */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f39c12' }}>
                        Discounted Price: ₹{details.sellingPrice}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                        Actual Price: ₹{details.courseMrp}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'green', fontWeight: 'bold' }}>
                        You Save: ₹{details.courseMrp - details.sellingPrice} ({details.discount}% off)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MainCard>
      )}

      {/* Modules Section in Separate MainCard */}
      <MainCard sx={{ mt: 2, backgroundColor: 'transparent' }}>
        {moduleError ? (
          <Alert severity="error">{moduleError}</Alert>
        ) : (
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',  // Enables horizontal scrolling
              whiteSpace: 'nowrap', // Prevents wrapping
              gap: 2, // Adds spacing between items
              pb: 1, // Prevents scrollbar from overlapping text
              '&::-webkit-scrollbar': {
                height: '6px', // Small scrollbar height
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#aaa', // Scrollbar thumb color
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            {modules.map((module) => (
              <Card
                key={module.moduleId}
                onClick={() => handleModuleClick(module.moduleId)}
                sx={{
                  cursor: 'pointer',
                  boxShadow: selectedModuleId === module.moduleId ? 6 : 2,
                  borderRadius: '50px',
                  backgroundColor: selectedModuleId === module.moduleId ? '#00afb5' : 'white',
                  color: selectedModuleId === module.moduleId ? 'white' : 'black',
                  border: selectedModuleId === module.moduleId
                    ? '3px solid #00afb5'
                    : '1px solid #ddd',
                  '&:hover': {
                    boxShadow: 8,
                    transform: 'scale(1.05)',
                    backgroundColor: selectedModuleId === module.moduleId ? '#009fa1' : '#f5f5f5',
                  },
                  textAlign: 'center',
                  transition: 'all 0.3s ease-in-out',
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '45px',
                  whiteSpace: 'nowrap', // Ensures text doesn’t wrap
                  minWidth: '150px', // Ensures buttons maintain size for scrolling
                  flexShrink: 0, // Prevents items from shrinking
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    transition: 'color 0.3s ease',
                    color: selectedModuleId === module.moduleId ? 'white' : 'black',
                  }}
                >
                  {module.moduleName}
                </Typography>
              </Card>
            ))}
          </Box>
        )}
      </MainCard>







      {/* Topics Section with Pagination */}
      <MainCard sx={{ mt: 2, backgroundColor: 'transparent' }}>
        {topicError ? (
          <Alert severity="error">{topicError}</Alert>
        ) : selectedModuleId && topics[selectedModuleId] ? (
          <Grid container spacing={2}> {/* Reduced spacing */}
            {topics[selectedModuleId].slice((currentPage - 1) * topicsPerPage, currentPage * topicsPerPage).map((topic) => (
              <Grid item xs={12} key={topic.topicId}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    p: 1.5, // Reduced padding
                    boxShadow: 2, // Slightly reduced shadow
                    borderRadius: '12px', // Slightly smaller border radius
                    background: '#ffffff',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: 5,
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  {/* Thumbnail Section */}
                  <Box
                    sx={{
                      width: { xs: '100%', sm: '25%' }, // Slightly smaller width
                      borderRadius: '10px',
                      overflow: 'hidden',
                      // boxShadow: '1px 3px 6px rgba(0, 0, 0, 0.15)',
                      display: 'flex', // Ensures proper centering
                      justifyContent: 'center'
                    }}
                  >
                    {topic.videoUrl && (
                      <iframe
                        title={`YouTube Video for ${topic.topicName}`}
                        src={`https://www.youtube.com/embed/${topic.videoUrl}`}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        style={{
                          width: '60%', // Now set to 60%
                          height: '120px', // Slightly larger height
                          borderRadius: '10px'
                        }}
                      ></iframe>
                    )}
                  </Box>

                  {/* Content Section */}
                  <Box
                    sx={{
                      flex: 1,
                      pl: { sm: 2 },
                      textAlign: 'left'

                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#000', }}>
                      {topic.topicName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                      {topic.description}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
              <Pagination
                count={Math.ceil(topics[selectedModuleId].length / topicsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                variant="outlined"
                shape="rounded"
              />
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" sx={{ color: '#777', mt: 2 }}>
            No topics found for the selected module.
          </Typography>
        )}
      </MainCard>


    </>
  );
};

export default SingleCourseDetails;
