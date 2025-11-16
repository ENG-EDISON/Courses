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

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <NavigationBar />
        <Homepage />
        <Footer/>
      </>
    ),
    errorElement: <p>404 Not found</p>,
  },
  {
    path: '/login',
    element: (
      <>
        <NavigationBar />
        <EnterpriseLogin />
        <Footer/>

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
        <Footer/>

      </>
    )
  },
  {
    path: '/course/:courseId',
    element: (
      <>
        <NavigationBar />
        <CourseDetails /> {/* ✅ Updated component name */}
        <Footer/>
      </>
    )
  },
  {
    path: '/all-courses',
    element: (
      <>
        <NavigationBar />
        <AllCourses />
        <Footer/>
      </>
    )
  },
  {
    path: '/course-content/:id',
    element: (
      <>
        <NavigationBar />
        <CourseContentPage />
        <Footer/>
      </>
    )
  },
  {
    path: '/course-editor/',
    element: (
      <>
        <NavigationBar />
        <CourseEditor />
        <Footer/>
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
        <Footer/>
      </>
    )
  },
  {
  path: '/contact',
  element: (
    <>
      <NavigationBar />
      <ContactPage />
      <Footer />
    </>
  )
},
{
  path: '/about',
  element: (
    <>
      <NavigationBar />
      <AboutUsPage />
      <Footer />
    </>
  )
},
{
  path: '/privacy',
  element: (
    <>
      <NavigationBar />
      <PrivacyPolicy />
      <Footer />
    </>
  )
},
{
  path: '/terms',
  element: (
    <>
      <NavigationBar />
      <TermsOfService />
      <Footer />
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