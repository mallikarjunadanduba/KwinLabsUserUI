import { useEffect, useState } from 'react';
import axios from 'axios';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import { styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';

// project imports
import Banner from './Banner';
import { gridSpacing } from 'store/constant';
import { BaseUrl } from 'BaseUrl';
import AnimatedPieChart from 'views/utilitiess/Jobs/AnimatedPieChart';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

// Base API URL


// Keyframes for animation
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

// Styled component for the welcome message
const WelcomePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: "#9ceaef",
  color: theme.palette.primary.contrastText,
  borderRadius: '12px',
  boxShadow: theme.shadows[10],
  animation: `${bounce} 2s ease-in-out`,
}));

const Jobs = () => {
  const [isLoading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    console.log(loggedInUser);

    if (loggedInUser && loggedInUser.accessToken) {
      setUserName(loggedInUser.userName);
      fetchUserInfo(loggedInUser.userName, loggedInUser.accessToken);
    }

    setLoading(false);
  }, []);

  const fetchUserInfo = async (userName, accessToken) => {
    try {
      const response = await axios.get(
        `${BaseUrl}/login/v1/queryUserProfileByUserName/${userName}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {/* Banner comes first */}
        <Grid container spacing={gridSpacing}>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Banner isLoading={isLoading} />
          </Grid>
        </Grid>

        {/* Welcome Message comes after the Banner */}
        {userName && (
          <Fade in={true} timeout={1000}>
            <Grid item xs={12} sx={{ mt: 4 }}>
              <WelcomePaper elevation={3} sx={{ maxWidth: "100%", width: "100%" }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  Welcome, {userName}! 🎉
                </Typography>
                <Typography sx={{ mt: 2, color: 'black' }}>
                  We're thrilled to have you here. Explore and enjoy your journey with us!
                </Typography>
              </WelcomePaper>
            </Grid>
          </Fade>
        )}

        {/* Animated Pie Chart Section */}
        <Grid container justifyContent="center" sx={{ mt: 4 }}>
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, backgroundColor: "white", width: "100%" }}>
              <CardContent sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  Resume Completion Percentage
                </Typography>
                <AnimatedPieChart />
              </CardContent>
            </Card>
          </Grid>
        </Grid>;
      </Grid>
    </Grid>
  );

};

export default Jobs;