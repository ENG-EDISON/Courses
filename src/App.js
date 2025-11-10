import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // ✅ Import AuthProvider
import Homepage from './pages/Homepage';
import Profile from './components/UserManagement/Profile';
import NavigationBar from './components/common/NavigationBar';
import "./index.css"
import EnterpriseLogin from './components/user_management/Login';
import Course from './pages/CourseDetail';
import AllCourses from './pages/AllCoursesPage';
import MyEnrolledCourses from './pages/MyEnrolledCourses';
import CourseContentPage from './components/CourseContentPage/CourseContentPage';
import CourseEditor from './components/course_management/CourseEditor/CourseEditor';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <NavigationBar />
        <Homepage />
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
        <Course />
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
    path: '/instructor',
    element: (
      <>
        <NavigationBar />
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
  }
]);

function App() {
  return (
    <div className="App">
      {/* ✅ Wrap RouterProvider with AuthProvider */}
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </div>
  );
}

export default App;