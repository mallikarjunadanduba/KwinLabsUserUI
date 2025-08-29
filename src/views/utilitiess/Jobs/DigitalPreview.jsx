import { useTheme } from '@mui/material/styles';
import {
  Grid, Typography, List, ListItem,
  ListItemText, Box, Chip, Button,
  useMediaQuery, Link, Avatar, Divider,
  Stack, IconButton, Paper, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import CertificateIcon from '@mui/icons-material/CardMembership';
import SocialIcon from '@mui/icons-material/Share';
import CourseIcon from '@mui/icons-material/MenuBook';
import { useReactToPrint } from 'react-to-print';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from 'BaseUrl';
import Basic_Details from './Basic_Details';
import BadgeIcon from '@mui/icons-material/Badge';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ShareIcon from '@mui/icons-material/Share';
import AuthImage from 'ImageUrlExtracter/AuthImage';
import CloseIcon from '@mui/icons-material/Close';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const DigitalPreview = () => {
  const theme = useTheme();
  const resumeRef = useRef();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openShareDialog, setOpenShareDialog] = useState(false);

  const user = JSON.parse(sessionStorage.getItem('user'));
  const profileId = sessionStorage.getItem('jobseekerProfileId');
  const headers = {
    'Content-type': 'application/json',
    Authorization: 'Bearer ' + user.accessToken
  };

  const shareableUrl = `${window.location.origin}/profile/share/${profileId}`;

  const handleOpenShareDialog = () => setOpenShareDialog(true);
  const handleCloseShareDialog = () => setOpenShareDialog(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareableUrl);
    alert("Link copied to clipboard!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
  };

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const response = await axios.get(
          `${BaseUrl}/jobseekerprofile/v1/getDigitalJobSeekerProfileById/${profileId}`,
          { headers }
        );
        const data = response.data;
        setResumeData({
          personalInfo: {
            name: data.jobseekerProfileName,
            title: data.description,
            email: data.email,
            phone: data.mobileNumber,
            description: data.summary || "Professional with extensive experience in the field."
          },
          currentEmployment: data.digitalCurrentEmploymentDto,
          workExperience: data.digitalExperienceDto || [],
          education: data.digitalEducationDto || [],
          skills: data.digitalJobSeekerSkillDto || [],
          projects: data.digitalJobSeekerProfileProjectDto || [],
          certificates: data.digitalJobSeekerProfileCertificateDto || [],
          languages: data.digitalJobSeekerLanguageDto || [],
          courses: data.digitalJobSeekerCourseDto || [],
          socialMedia: data.digitalSocialmediaDto || [],
          awards: data.digitalAwardDto || []
        });
      } catch (error) {
        console.error("Error fetching resume data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResumeData();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => resumeRef.current,
    pageStyle: `@page { size: A4; margin: 10mm; } @media print { body { -webkit-print-color-adjust: exact; } .no-print { display: none !important; } }`
  });

  if (loading) return <Typography>Loading resume...</Typography>;
  if (!resumeData) return <Typography>Error loading resume data</Typography>;

  return (
    <Paper
      ref={resumeRef}
      elevation={3}
      sx={{
        width: "100%",
        maxWidth: "xl",
        mx: "auto",
        mt: 4,
        mb: 4,
        p: { xs: 2, sm: 4 },
        borderRadius: 3,
        backgroundColor: "#f9f9f9"
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={handleOpenShareDialog}
          sx={{
            backgroundColor: theme.palette.primary.dark,
            '&:hover': { backgroundColor: theme.palette.primary.dark, opacity: 0.9 }
          }}
        >
          Share Profile
        </Button>
      </Box>

      {/* Basic Details */}
      <Basic_Details />
      <Divider sx={{ my: 3 }} />

      {/* Current Employment */}
      {resumeData.currentEmployment && (
        <>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}><BadgeIcon color="primary" /> Current Employment</Box>
          </Typography>
          <Typography variant="h6">{resumeData.currentEmployment.jobTitle}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{resumeData.currentEmployment.companyName}</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Typography variant="body2">Employment Type: {resumeData.currentEmployment.employmentType}</Typography>
              <Typography variant="body2">Current CTC: {resumeData.currentEmployment.currentctc}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">Notice Period: {resumeData.currentEmployment.noticePeriod}</Typography>
              <Typography variant="body2">Skills: {resumeData.currentEmployment.skill}</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* Work Experience */}
      {resumeData.workExperience.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}><WorkHistoryIcon color="primary" /> Work Experience</Box>
          </Typography>
          {resumeData.workExperience.map((exp, i) => (
            <Box key={i} sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold">{exp.designation}</Typography>
                <Typography variant="body2" color="text.secondary">{formatDate(exp.fromDate)} - {formatDate(exp.toDate)}</Typography>
              </Box>
              <Typography variant="subtitle1" color="text.secondary">{exp.companyName}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{exp.description}</Typography>
              <Divider sx={{ my: 2 }} />
            </Box>
          ))}
        </>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}><SchoolIcon color="primary" /> Education</Box>
          </Typography>
          {resumeData.education.map((edu, i) => (
            <Box key={i} sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Typography variant="h6" fontWeight="bold">{edu.educationName}</Typography>
                <Typography variant="body2">{edu.percentage && `Percentage: ${edu.percentage}%`}</Typography>
                <Typography variant="body2" color="text.secondary">{formatDate(edu.fromDate)} - {formatDate(edu.toDate)}</Typography>
              </Box>
              <Typography variant="subtitle1" color="text.secondary">{edu.instituteName}</Typography>
              {edu.description && <Typography variant="body2" sx={{ mt: 1 }}>{edu.description}</Typography>}
              <Divider sx={{ my: 2 }} />
            </Box>
          ))}
        </>
      )}

      {/* Courses */}
      {resumeData.courses.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}><CourseIcon color="primary" /> Courses</Box>
          </Typography>
          {resumeData.courses.map((course, i) => (
            <Box key={i} sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight="bold">{course.courseName}</Typography>
              {course.description && <Typography variant="body2" sx={{ mt: 1 }}>{course.description}</Typography>}
              <Divider sx={{ my: 2 }} />
            </Box>
          ))}
        </>
      )}

      {/* Skills */}
      {resumeData.skills.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}><LightbulbOutlinedIcon color="primary" /> Skills</Box>
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
            {resumeData.skills.map((skill, i) => (
              <Chip key={i} label={skill.skillName} color="primary" variant="filled" />
            ))}
          </Stack>
          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* Projects */}
      {resumeData.projects.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}><CodeIcon color="primary" /> Projects</Box>
          </Typography>
          {resumeData.projects.map((project, i) => (
            <Box key={i} sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight="bold">{project.projectName}</Typography>
              {project.skill && <Typography variant="body2" color="text.secondary"><strong>Skills:</strong> {project.skill}</Typography>}
              {project.projectUrl && (
                <Typography variant="body2"><strong>URL:</strong> <Link href={project.projectUrl} target="_blank">{project.projectUrl}</Link></Typography>
              )}
              {project.description && <Typography variant="body2">{project.description}</Typography>}
              <Divider sx={{ my: 2 }} />
            </Box>
          ))}
        </>
      )}

      {/* Certificates */}
      {resumeData.certificates.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}><CertificateIcon color="primary" /> Certifications</Box>
          </Typography>
          <Stack direction="row" flexWrap="wrap" spacing={2} sx={{ mt: 2 }}>
            {resumeData.certificates.map((cert, i) => (
              <Box key={i} sx={{ maxWidth: 300 }}>
                <AuthImage filePath={cert.filePath} alt={cert.certificateName} style={{ width: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 4 }} />
                <Typography variant="h6" fontWeight="bold" align="center">{cert.certificateName}</Typography>
              </Box>
            ))}
          </Stack>
          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* Languages */}
      {resumeData.languages.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}><LanguageIcon color="primary" /> Languages</Box>
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
            {resumeData.languages.map((lang, i) => (
              <Chip key={i} label={lang.languageName} color="secondary" variant="outlined" />
            ))}
          </Stack>
          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* Social Media */}
      {resumeData.socialMedia.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}><SocialIcon color="primary" /> Social Media</Box>
          </Typography>
          <Stack spacing={1} sx={{ mt: 2 }}>
            {resumeData.socialMedia.map((social, i) => (
              <Link key={i} href={social.socialmediaLink} target="_blank" rel="noopener" underline="hover" color="secondary">
                {social.socialmediaName}
              </Link>
            ))}
          </Stack>
          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* Awards */}
      {resumeData.awards.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}><EmojiEventsIcon color="primary" /> Awards</Box>
          </Typography>
          <Stack direction="row" flexWrap="wrap" spacing={2} sx={{ mt: 2 }}>
            {resumeData.awards.map((award, i) => (
              <Box key={i} sx={{ maxWidth: 300 }}>
                {award.filePath && (
                  <AuthImage filePath={award.filePath} alt={award.awardName} style={{ width: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 4 }} />
                )}
                <Typography variant="h6" fontWeight="bold" align="center">{award.awardName}</Typography>
              </Box>
            ))}
          </Stack>
        </>
      )}

      {/* Share Dialog */}
      <Dialog open={openShareDialog} onClose={handleCloseShareDialog}>
        <DialogTitle>
          Share Your Profile
          <IconButton onClick={handleCloseShareDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <IconButton component="a" href={`https://www.facebook.com/sharer/sharer.php?u=${shareableUrl}`} target="_blank"><FacebookIcon /></IconButton>
            <IconButton component="a" href={`https://twitter.com/intent/tweet?url=${shareableUrl}`} target="_blank"><TwitterIcon /></IconButton>
            <IconButton component="a" href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareableUrl}`} target="_blank"><LinkedInIcon /></IconButton>
            <IconButton component="a" href={`https://wa.me/?text=${shareableUrl}`} target="_blank"><WhatsAppIcon /></IconButton>
            <IconButton component="a" href={`mailto:?subject=Check%20my%20resume&body=${shareableUrl}`}><EmailIcon /></IconButton>
            <IconButton onClick={handleCopy}><ContentCopyIcon /></IconButton>
          </Stack>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default DigitalPreview;
