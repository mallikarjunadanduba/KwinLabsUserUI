import React from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, CardActions, Divider
} from '@mui/material';
import {
  Work, School, ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';

const preparationCards = [
  {
    title: 'Up Skills Interview Preparation',
    description: 'Enhance your professional skills, communication, and industry knowledge to excel in job interviews.',
    icon: <Work fontSize="large" color="primary" />,
    actionLabel: 'Start Preparation',
    path: '/jobs/practice-instructions'
  },
      {
      title: 'Academic Preparation',
      description: 'Strengthen your theoretical knowledge, problem-solving abilities, and academic foundation.',
      icon: <School fontSize="large" color="secondary" />,
      actionLabel: 'Start Preparation',
      path: '/jobs/academic-practice'
    }
];

const InterviewPreparation = () => {
  const navigate = useNavigate();

  const handleStartPreparation = (path) => {
    navigate(path);
  };

  return (
    <MainCard>
      <Box sx={{ px: { xs: 2, md: 6 }, py: 4 }}>
        <Typography
          variant="h4"
          textAlign="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 1,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}
        >
          Interview Preparation
        </Typography>

        <Typography
          variant="subtitle1"
          textAlign="center"
          sx={{
            mb: 4,
            color: 'text.secondary',
            maxWidth: 700,
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Choose your preparation path to get ready for your next interview and boost your chances of success.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {preparationCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={4}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  {card.icon}
                  <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                    {card.title}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {card.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => handleStartPreparation(card.path)}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem'
                    }}
                  >
                    {card.actionLabel}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </MainCard>
  );
};

export default InterviewPreparation;
