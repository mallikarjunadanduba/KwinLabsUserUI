import React, { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button, Box } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { BaseUrl } from 'BaseUrl';
import { useNavigate } from 'react-router-dom';

const ResumeData = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const resumeRef = useRef();
    const navigate = useNavigate();

    const user = JSON.parse(sessionStorage.getItem('user'));
    const jobseekerProfileId = sessionStorage.getItem('jobseekerProfileId');

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + user?.accessToken
    };

    useEffect(() => {
        axios
            .get(
                `${BaseUrl}/jobseekerprofile/v1/getDigitalJobSeekerProfileById/${jobseekerProfileId}`,
                { headers }
            )
            .then((response) => {
                setProfile(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching resume data:', error);
                setLoading(false);
            });
    }, [jobseekerProfileId]);

    const handlePrint = useReactToPrint({
        content: () => resumeRef.current,
        pageStyle: `
            @page {
    size: A4;
    margin: 0;
}
@media print {
    body {
        -webkit-print-color-adjust: exact;
        margin: 0;
    }
    .resume-container {
        box-shadow: none;
        padding: 0;
        margin: 0;
    }
    .section {
        page-break-inside: avoid;
    }
    /* Remove browser-added headers/footers */
    @page {
        margin: 0;
        size: auto;
    }
    body {
        margin: 0;
    }
}
        `,
        documentTitle: `${profile?.jobseekerProfileName || 'Resume'}`,
    });

    const handleDownloadPDF = () => {
        const input = resumeRef.current;

        html2canvas(input, {
            scale: 2,
            logging: false,
            useCORS: true,
            letterRendering: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${profile?.jobseekerProfileName || 'resume'}.pdf`);
        });
    };

    if (loading) return <div>Loading resume...</div>;
    if (!profile) return <div>No data found.</div>;

    const {
        jobseekerProfileName,
        email,
        mobileNumber,
        description,
        digitalCurrentEmploymentDto,
        digitalExperienceDto,
        digitalEducationDto,
        digitalJobSeekerSkillDto,
        digitalJobSeekerProfileProjectDto,
        digitalJobSeekerProfileCertificateDto,
        digitalJobSeekerLanguageDto,
        digitalJobSeekerCourseDto,
        digitalSocialmediaDto,
        digitalAwardDto
    } = profile;

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Present';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                    >
                        Print Resume
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={handleDownloadPDF}
                    >
                        Download PDF
                    </Button>
                </Box>
            </Box>

            <div ref={resumeRef} style={{
                padding: '40px',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                maxWidth: '800px',
                margin: '0 auto',
                backgroundColor: 'white',
                boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                color: '#333',
                lineHeight: '1.5'
            }} className="resume-container">
                {/* Header Section */}
                <header style={{
                    marginBottom: '30px',
                    borderBottom: '2px solid #3498db',
                    paddingBottom: '20px'
                }}>
                    <h1 style={{
                        color: '#2c3e50',
                        marginBottom: '5px',
                        fontSize: '28px',
                        fontWeight: '600',
                        letterSpacing: '1px'
                    }}>
                        {jobseekerProfileName}
                    </h1>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '15px',
                        marginTop: '10px'
                    }}>
                        <p style={{ margin: '0', color: '#555' }}>
                            <strong>Email:</strong> {email}
                        </p>
                        <p style={{ margin: '0', color: '#555' }}>
                            <strong>Phone:</strong> {mobileNumber}
                        </p>
                    </div>
                </header>

                {/* Main Content */}
                <main>
                    {/* Profile Summary */}
                    {description && (
                        <section className="section" style={{ marginBottom: '25px' }}>
                            <h2 style={{
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Professional Summary
                            </h2>
                            <p style={{ margin: '0', fontSize: '14px' }}>{description}</p>
                        </section>
                    )}

                    {/* Current Employment */}
                    {digitalCurrentEmploymentDto && (
                        <section className="section" style={{ marginBottom: '25px' }}>
                            <h2 style={{
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Current Employment
                            </h2>
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#3498db'
                                }}>
                                    {digitalCurrentEmploymentDto.jobTitle}
                                </h3>
                                <p style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '14px',
                                    color: '#555'
                                }}>
                                    {digitalCurrentEmploymentDto.companyName}
                                </p>
                                <p style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '14px',
                                    color: '#555'
                                }}>
                                    <strong>Skills:</strong> {digitalCurrentEmploymentDto.skill}
                                </p>
                                <p style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '14px',
                                    color: '#555'
                                }}>
                                    <strong>Profile:</strong> {digitalCurrentEmploymentDto.jobProfile}
                                </p>
                                <p style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '14px',
                                    color: '#555'
                                }}>
                                    <strong>Notice Period:</strong> {digitalCurrentEmploymentDto.noticePeriod}
                                </p>
                                <p style={{
                                    margin: '0',
                                    fontSize: '14px',
                                    color: '#555'
                                }}>
                                    <strong>CTC:</strong> {digitalCurrentEmploymentDto.currentctc} LPA
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Work Experience */}
                    {digitalExperienceDto?.length > 0 && (
                        <section className="section" style={{ marginBottom: '25px' }}>
                            <h2 style={{
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Professional Experience
                            </h2>
                            {digitalExperienceDto.map((exp) => (
                                <div key={exp.experienceId} style={{
                                    marginBottom: '20px',
                                    pageBreakInside: 'avoid'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 5px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#3498db'
                                    }}>
                                        {exp.designation}
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '5px'
                                    }}>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            color: '#555',
                                            fontWeight: '500'
                                        }}>
                                            {exp.companyName}
                                        </p>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            color: '#777'
                                        }}>
                                            {formatDate(exp.fromDate)} - {formatDate(exp.toDate)}
                                        </p>
                                    </div>
                                    {exp.description && (
                                        <p style={{
                                            margin: '10px 0 0 0',
                                            fontSize: '14px',
                                            color: '#555'
                                        }}>
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Education */}
                    {digitalEducationDto?.length > 0 && (
                        <section className="section" style={{ marginBottom: '25px' }}>
                            <h2 style={{
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Education
                            </h2>
                            {digitalEducationDto.map((edu) => (
                                <div key={edu.educationId} style={{
                                    marginBottom: '15px',
                                    pageBreakInside: 'avoid'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 5px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#3498db'
                                    }}>
                                        {edu.educationName}
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '5px'
                                    }}>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            color: '#555',
                                            fontWeight: '500'
                                        }}>
                                            {edu.instituteName}
                                        </p>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            color: '#777'
                                        }}>
                                            {formatDate(edu.fromDate)} - {formatDate(edu.toDate)}
                                        </p>
                                    </div>
                                    <p style={{
                                        margin: '0',
                                        fontSize: '14px',
                                        color: '#555'
                                    }}>
                                        <strong>Score:</strong> {edu.percentage}%
                                    </p>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Skills */}
                    {digitalJobSeekerSkillDto?.length > 0 && (
                        <section className="section" style={{ marginBottom: '25px' }}>
                            <h2 style={{
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Skills
                            </h2>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                fontSize: '14px'
                            }}>
                                {digitalJobSeekerSkillDto.map(skill => (
                                    <span
                                        key={skill.skillId}
                                        style={{
                                            backgroundColor: '#e8f4fc',
                                            color: '#2c3e50',
                                            padding: '5px 10px',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {skill.skillName}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {digitalJobSeekerProfileProjectDto?.length > 0 && (
                        <section className="section" style={{ marginBottom: '25px' }}>
                            <h2 style={{
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Projects
                            </h2>
                            {digitalJobSeekerProfileProjectDto.map(project => (
                                <div key={project.projectId} style={{
                                    marginBottom: '15px',
                                    pageBreakInside: 'avoid'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 5px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#3498db'
                                    }}>
                                        {project.projectName}
                                    </h3>
                                    {project.projectUrl && (
                                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                                            <a href={project.projectUrl} target="_blank" rel="noreferrer" style={{
                                                color: '#3498db',
                                                textDecoration: 'none'
                                            }}>
                                                <span style={{color:"black"}}>Link:</span>{project.projectUrl}
                                            </a>
                                        </p>
                                    )}
                                    <p style={{
                                        margin: '10px 0 0 0',
                                        fontSize: '14px',
                                        color: '#555'
                                    }}>
                                        {project.description}
                                    </p>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Certificates */}
                    {digitalJobSeekerProfileCertificateDto?.length > 0 && (
                        <section className="section" style={{ marginBottom: '25px' }}>
                            <h2 style={{
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Certifications
                            </h2>
                            {digitalJobSeekerProfileCertificateDto.map(cert => (
                                <div key={cert.certificateId} style={{
                                    marginBottom: '15px',
                                    pageBreakInside: 'avoid'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 5px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#3498db'
                                    }}>
                                        {cert.certificateName}
                                    </h3>
                                    {/* {cert.filePath && (
                                        <div style={{ marginTop: '10px' }}>
                                            <img
                                                src={`${BaseUrl}${cert.filePath}`}
                                                alt={cert.certificateName}
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '400px',
                                                    border: '1px solid #eee',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </div>
                                    )} */}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Languages */}
                    {digitalJobSeekerLanguageDto?.length > 0 && (
                        <section className="section" style={{ marginBottom: '25px' }}>
                            <h2 style={{
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Languages
                            </h2>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                fontSize: '14px'
                            }}>
                                {digitalJobSeekerLanguageDto.map(lang => (
                                    <span
                                        key={lang.languageId}
                                        style={{
                                            backgroundColor: '#f5f5f5',
                                            padding: '5px 10px',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {lang.languageName}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Courses */}
                    {digitalJobSeekerCourseDto?.length > 0 && (
                        <section className="section" style={{ marginBottom: '25px' }}>
                            <h2 style={{
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Courses
                            </h2>
                            {digitalJobSeekerCourseDto.map(course => (
                                <div key={course.courseId} style={{
                                    marginBottom: '15px',
                                    pageBreakInside: 'avoid'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 5px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#3498db'
                                    }}>
                                        {course.courseName}
                                    </h3>
                                    <p style={{
                                        margin: '0',
                                        fontSize: '14px',
                                        color: '#555'
                                    }}>
                                        {course.description}
                                    </p>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Social Media */}
                    {digitalSocialmediaDto?.length > 0 && (
                        <section className="section" style={{ marginBottom: '25px' }}>
                            <h2 style={{
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Social Media
                            </h2>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                fontSize: '14px'
                            }}>
                                {digitalSocialmediaDto.map(media => (
                                    <div key={media.socialmediaId}>
                                        <strong style={{
                                            display: 'inline-block',
                                            width: '100px',
                                            color: '#555'
                                        }}>
                                            {media.socialmediaName}:
                                        </strong>
                                        <a href={media.socialmediaLink} target="_blank" rel="noreferrer" style={{
                                            color: '#3498db',
                                            textDecoration: 'none'
                                        }}>
                                            {media.socialmediaLink}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Awards */}
                    {digitalAwardDto?.length > 0 && (
                        <section className="section" style={{ marginBottom: '25px' }}>
                            <h2 style={{
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600',
                                borderBottom: '1px solid #eee',
                                paddingBottom: '5px',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Awards & Achievements
                            </h2>
                            {digitalAwardDto.map(award => (
                                <div key={award.awardId} style={{
                                    marginBottom: '15px',
                                    pageBreakInside: 'avoid'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 5px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#3498db'
                                    }}>
                                        {award.awardName}
                                    </h3>
                                    {/* {award.filePath && (
                                        <div style={{ marginTop: '10px' }}>
                                            <img
                                                src={`${BaseUrl}${award.filePath}`}
                                                alt={award.awardName}
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '400px',
                                                    border: '1px solid #eee',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </div>
                                    )} */}
                                </div>
                            ))}
                        </section>
                    )}
                </main>
            </div>
        </Box>
    );
};

export default ResumeData;