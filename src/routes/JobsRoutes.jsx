import { lazy } from 'react';
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import Login from 'views/pages/authentication3/Login3';
import Register from 'views/pages/authentication3/Register3';
import ForgotPassword from 'views/pages/authentication3/ForgotPassword';
import VerifyOtp from 'views/pages/authentication3/VerifyOtp';
import ResetPassword from 'views/pages/authentication3/ResetPassword';
import ProtectedRoute from './ProtectedRoute';
import { element } from 'prop-types';

// dashboard routing
const JobsDefault = Loadable(lazy(() => import('views/Jobs')));

// utilities routing
const UtilsProfile = Loadable(lazy(() => import('views/utilitiess/Jobs/Profile')));
const UtilsSettings = Loadable(lazy(() => import('views/utilitiess/Jobs/Settings')));
const UtilsPayments = Loadable(lazy(() => import('views/utilitiess/Jobs/Payments')));
const UtilsDigitalPreview = Loadable(lazy(() => import('views/utilitiess/Jobs/DigitalPreview')));
const UtilsResumeData = Loadable(lazy(() => import('views/utilitiess/Jobs/ResumeData')));
const UtilsInterviewPreparation = Loadable(lazy(() => import('views/utilitiess/Jobs/InterviewPreparation')));
const UtilsTests = Loadable(lazy(() => import('views/utilitiess/MCQTests/Pages/TestInstructions')));
const UtilsExamPage = Loadable(lazy(() => import('views/utilitiess/MCQTests/Pages/ExamPage')));
const UtilsPlacement = Loadable(lazy(() => import('views/utilitiess/Jobs/Placement')));
const UtilsTabError = Loadable(lazy(() => import('views/utilitiess/MCQTests/Components/TabErrorPage')));
const UtilsMockupInterview = Loadable(lazy(() => import('views/utilitiess/Jobs/MockupInterview')));
const UtilsShareProfile = Loadable(lazy(() => import('views/utilitiess/Jobs/ShareProfile')));
const ResultReview = Loadable(lazy(() => import('views/utilitiess/MCQTests/Pages/ResultReview')));
const PracticeInstructions = Loadable(lazy(() => import('views/utilitiess/MCQTests/Pages/UpSkillPractice')));
const AcademicPractice = Loadable(lazy(() => import('views/utilitiess/MCQTests/Pages/AcademicPractice')));
const ExamHistories = Loadable(lazy(() => import('views/utilitiess/MCQTests/Pages/ExamHistory')));
const AIAgent = Loadable(lazy(() => import('views/utilitiess/Jobs/AIAgent')));
const PdfViewerWithMenu = Loadable(lazy(() => import('views/utilitiess/Jobs/PdfViewerWithMenu')));

const JobsRoutes = {
  path: '/',

  children: [
    { path: '/', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/verify-otp', element: <VerifyOtp /> },
    { path: '/reset-password', element: <ResetPassword /> },
    { path: 'profile/share/:id', element: <UtilsShareProfile /> },
    {
      path: '/',
      element: <ProtectedRoute element={<MainLayout />} />,
      children: [
        {
          path: 'jobs',
          children: [
            { path: '', element: <JobsDefault /> },
            { path: 'profile', element: < UtilsProfile /> },
            { path: 'digitalpreview', element: <UtilsDigitalPreview /> },
            { path: 'resumedata', element: <UtilsResumeData /> },
            { path: 'payments', element: <UtilsPayments /> },
            { path: 'settings', element: <UtilsSettings /> },
            { path: 'interview-preparation', element: <UtilsInterviewPreparation /> },
            { path: 'tests', element: <UtilsTests /> },
            { path: 'placement', element: <UtilsPlacement /> },
            { path: 'exam', element: <UtilsExamPage /> },
            { path: 'tab-error', element: <UtilsTabError /> },
            { path: 'mockup-interview', element: <UtilsMockupInterview /> },
            { path: 'resultReview', element: <ResultReview /> },
            { path: 'practice-instructions', element: <PracticeInstructions /> },
            { path: 'academic-practice', element: <AcademicPractice /> },
            { path: 'examhistory', element: <ExamHistories /> },
            { path: 'ai-agent', element: <AIAgent /> },
            { path: 'pdf-viewer', element: <PdfViewerWithMenu /> }
          ]
        }
      ]
    }
  ]
};

export default JobsRoutes;
