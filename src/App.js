// src/App.js
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Homepage from './pages/Homepage';
import Profile from './components/UserManagement/Profile';
import NavigationBar from './components/common/NavigationBar';
import "./index.css"
import EnterpriseLogin from './components/user_management/Login';
import CourseDetails from './pages/CourseDetailsPage/components/CourseDetails';
import AllCourses from './pages/AllCoursesPage';
import MyEnrolledCourses from './pages/MyEnrolledCourses';
import CourseContentPage from './components/CourseContentPage/CourseContentPage';
import CourseEditor from './components/course_management/CourseEditor/CourseEditor';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Footer from './components/common/Footer';
import ContactPage from './pages/ContactPage';
import AboutUsPage from './pages/AboutUsPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminMessagesList from "./pages/AdminMessagesList"
import AdminDashboard from './pages/AdminDashboard';
import ContactAdminPage from './pages/ContactAdminPage';
import EnrollmentRouteGuard from './pages/CourseDetailsPage/components/EnrollmentRouteGuard';
import SignUp from './pages/SignUp';
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Homepage />

      </>
    ),
    errorElement: <p>404 Not found</p>,
  },
  {
    path: '/login',
    element: (
      <>
        <EnterpriseLogin />

      </>
    ),
    errorElement: <p>404 Not found</p>,
  },
  {
    path: '/admin',
    element: (
      <>
        <NavigationBar />
        <AdminDashboard />
      </>
    ),
    errorElement: <p>404 Not found</p>,
  },
  {
    path: '/profile',
    element: (
      <>
        <NavigationBar />
        <Profile />
      </>
    )
  },
  {
    path: '/course/:courseId',
    element: (
      <>
        <NavigationBar />
        <EnrollmentRouteGuard>
          <CourseDetails />
        </EnrollmentRouteGuard>
      </>
    )
  },
  {
    path: '/all-courses',
    element: (
      <>
        <NavigationBar />
        <AllCourses />
      </>
    )
  },
  {
    path: '/course-content/:id',
    element: (
      <>
        <NavigationBar />
        <CourseContentPage />
      </>
    )
  },
  {
    path: '/course-editor/',
    element: (
      <>
        <NavigationBar />
        <CourseEditor />
      </>
    )
  },
    {
    path: '/signup/',
    element: (
      <>
        <NavigationBar />
        <SignUp/>
      </>
    )
  },
  {
    path: '/instructor',
    element: (
      <>
        <NavigationBar />
        <Footer/>
      </>
    ),
    errorElement: <p>404 Not found</p>,
  },
  {
    path: '/enrolled-courses',
    element: (
      <>
        <NavigationBar />
        <MyEnrolledCourses />
      </>
    )
  },
  {
    path: '/contact',
    element: (
      <>
        <NavigationBar />
        <ContactPage />

      </>
    )
  },
  {
    path: '/about',
    element: (
      <>
        <NavigationBar />
        <AboutUsPage />
      </>
    )
  },
  {
    path: '/privacy',
    element: (
      <>
        <NavigationBar />
        <PrivacyPolicy />
      </>
    )
  },
  {
    path: '/terms',
    element: (
      <>
        <NavigationBar />
        <TermsOfService />
      </>
    )
  },
  {
    path: '/course/:courseId/contact-admin',
    element: (
      <>
        <NavigationBar />
        <ContactAdminPage />
      </>
    )
  },
  {
    path: '/admin/messages',
    element: (
      <>
        <NavigationBar />
        <AdminMessagesList />
      </>
    )
  }
]);

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </div>
  );
}

export default App;