import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Button, Box, useMediaQuery, useTheme } from '@mui/material';
import axios from 'axios'; // Import axios
import { fetchCourseByCategoryId } from 'views/API/UpskillsCategoryApi';
import MainCard from 'ui-component/cards/MainCard';
import { BaseUrl } from 'BaseUrl';

const CourseDetails = () => {
  const [details, setDetails] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [visibleDescription, setVisibleDescription] = useState(null);

  const location = useLocation();
  const { categoryId, categoryName } = location.state || {};

  const user = JSON.parse(sessionStorage.getItem('user'));
  const headers = {
    'Content-type': 'application/json',
    Authorization: 'Bearer ' + user.accessToken
  };
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchData = async () => {
    try {
      const res = await fetchCourseByCategoryId(headers, categoryId);
      console.log(res.data)
      const fetchedData = res.data;
      if (fetchedData) {
        setDetails(fetchedData);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

  const handleViewAll = () => {
    setShowAll(true);
  };

  const toggleDescription = (event, courseId) => {
    event.stopPropagation();
    setVisibleDescription(visibleDescription === courseId ? null : courseId);
  };

  const handleCourseDetails = (courseId) => {
    navigate('course-details', { state: { courseId } });
  };

  const handleSubscribe = async (amount, courseId) => {
    try {
      // Convert amount to paise before sending to Razorpay API (amount * 100)
      const amountInPaise = amount * 100;

      // Make API call to your backend to get Razorpay payment details
      const response = await axios.get(
        `${BaseUrl}/rayzorpay/v1/rayzorPayPayment/{amount}?amount=${amountInPaise}`,
        // `https://executivetracking.cloudjiffy.net/GetJob/rayzorpay/v1/rayzorPayPayment/${amountInPaise}?amount=${amountInPaise}`,
        { headers: headers }
      );
      console.log(response.data);
      const paymentData = response.data;

      if (paymentData && paymentData.orderTd) {
        // Initialize Razorpay Checkout
        const options = {
          key: 'rzp_test_c09ktph3IirGmG', // Replace with your Razorpay key
          amount: paymentData.amount * 100, // Convert amount to paise (e.g., 100 INR = 10000 paise)
          currency: paymentData.currency,
          name: 'Course Subscription',
          description: 'Payment for course subscription',
          image: 'https://yourdomain.com/your-logo.png', // Optional logo
          order_id: paymentData.orderTd, // Use orderTd from the server response
          handler: function (response) {
            // Success handler
            alert('Payment successful!');
            console.log(response);
            navigate(`/course-details/${courseId}`); // Navigate to the course details page
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.contact
          },
          notes: {
            address: 'Razorpay Corporate Office'
          },
          theme: {
            color: '#F37254'
          }
        };

        // Create a new Razorpay instance and open the checkout modal
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
        alert('Error: Could not fetch payment data.');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Payment initiation failed!');
    }
  };

  const handleViewMore = (courseId) => {
    // Navigate to a detailed view of the course or expand the description
    navigate(`/course-details/${courseId}`);
  };

  return (
    <>
      <MainCard>
        <Typography variant="h3" gutterBottom>
          Courses Details for {categoryName}
        </Typography>
      </MainCard>
      <Grid container spacing={2}>
        {(showAll ? details : details.slice(0, 4)).map((detail) => (
          <Grid item xs={12} key={detail.courseId}>
            <Card
              sx={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer'
                },
                margin: 1, // Reduced margin
                height: 'auto',
                padding: '8px' // Reduced padding
              }}
              
            >
              <CardContent>
                <Grid container spacing={2}>
                  {/* Video Section */}
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    {detail.videoUrl && (
                      <Box
                        sx={{
                          position: 'relative',
                          paddingTop: '40%', // Adjusted to make the video smaller
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}
                      >
                        <iframe
                          title="YouTube Video"
                          src={`https://www.youtube.com/embed/${detail.videoUrl}`}
                          frameBorder="0"
                          allowFullScreen
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '80%',
                            height: '100%',
                            border: 'none',
                            borderRadius: '8px'
                          }}
                        ></iframe>
                      </Box>
                    )}
                  </Grid>

                  {/* Course Details Section */}
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ mb: 1, fontWeight: 'bold' }}>
                        {detail.courseName}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        {detail.description}
                      </Typography>
                      {/* Price and Discount Section */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant={isMobile ? 'body1' : 'h5'} sx={{ color: 'primary.main', fontWeight: 'bold', mr: 2 }}>
                          ₹{detail.sellingPrice}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', textDecoration: 'line-through', mr: 2 }}>
                          ₹{detail.courseMrp}
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor: 'success.light',
                            color: 'success.dark',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.875rem' : '1rem'
                          }}
                        >
                          {detail.discount}% off
                        </Box>
                      </Box>

                      {/* Subscribe and View More Buttons in One Row */}
                      <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={6}>
                          <Button
                            variant="contained"
                            style={{ backgroundColor: "#00afb5", width: '100%' }}
                            sx={{ py: 1.5, fontWeight: 'bold' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubscribe(detail.sellingPrice, detail.courseId);
                            }}
                          >
                            Subscribe
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            variant="outlined"
                            sx={{ py: 1.5, fontWeight: 'bold', color: "#00afb5", width: '100%' }}
                            onClick={(e) => {
                              e.stopPropagation();
                               handleCourseDetails(detail.courseId)
                            }}
                          >
                            View More
                          </Button>
                        </Grid>
                      </Grid>

                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    </>
  );
};

export default CourseDetails;