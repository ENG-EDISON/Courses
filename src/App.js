import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './components/Homepage';
import Profile from './components/Profile';
import NavigationBar from './components/NavigationBar';
import "./index.css"
import EnterpriseLogin from './components/Login';
import Course from './components/CourseDetail';
import AllCourses from './components/AllCoursesPage';
import MyEnrolledCourses from './components/MyEnrolledCourses';
import CourseContentPage from './components/CourseContentPage';

const router = createBrowserRouter([

  {
    path: '/',
    element:
      (
        <>
          <NavigationBar />
          <Homepage />
        </>
      ),
    errorElement: <p>404 Not found</p>,
  },
  {
    path: '/login',
    element:
      (
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
  }
  ,
  {
    path: '/course/:courseId',  // This will capture the course.id
    element: (
      <>
        <NavigationBar />
        <Course/>
      </>
    )
  },
  {
    path:'/all-courses',
    element:(
      <>
      <NavigationBar/>
      <AllCourses/>
      </>
    )

  },
{
    path: '/course-content/:id',  // Add :id parameter
    element:(
      <>
      <NavigationBar/>
      <CourseContentPage/>
      </>
    )
},
  {
    path:'/enrolled-courses',
    element:(
      <>
      <NavigationBar/>
      <MyEnrolledCourses/>
      </>
    )
  }
]);
function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
