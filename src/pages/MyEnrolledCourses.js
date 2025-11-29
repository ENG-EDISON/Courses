import { useDebugValue, useEffect, useState } from "react";
import { getMyEnrolledCourses } from "../api/EnrollmentApis";
import { getCourseProgressSummary } from "../api/LessonProgressApi";
import "../static/EnrolledCourses.css";
import { Link } from "react-router-dom";
import NotEnrolledCourses from "./NotEnrolledCourses";
import Footer from "../components/common/Footer"; // Import Footer

function MyEnrolledCourses() {
  const [myCourses, setMyCourses] = useState(null);
  const [courseProgress, setCourseProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null); // ADDED: Store user ID

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await getMyEnrolledCourses();
        const coursesData = response.data;        
        // ADDED: Extract user ID from response
        if (coursesData?.user_id) {
          setCurrentUserId(coursesData.user_id);
        }
        
        setMyCourses(coursesData);

        if (coursesData?.enrolled_courses) {
          await fetchAllCourseProgress(coursesData.enrolled_courses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError("Unable to load your courses. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAllCourseProgress = async (courses) => {
      try {
        const promises = courses.map((course) =>
          getCourseProgressSummary(course.id)
            .then((res) => ({ courseId: course.id, progress: res.data }))
            .catch((err) => {
              console.error(`Error fetching progress for course ${course.id}:`, err);
              return { courseId: course.id, progress: null };
            })
        );

        const results = await Promise.all(promises);
        const progressMap = {};

        results.forEach((r) => {
          if (r.progress) progressMap[r.courseId] = r.progress;
        });

        setCourseProgress(progressMap);
      } catch (error) {
        console.error('Error fetching course progress:', error);
      }
    };

    fetchMyCourses();
  }, []);

  useDebugValue(myCourses ?? "Loading...");

  const getCourseProgressData = (id) =>
    courseProgress[id] || {
      progress_percentage: 0,
      completed_lessons: 0,
      total_lessons: 0,
      total_watched_seconds: 0,
      last_accessed: null,
      enrollment_progress: 0,
    };

  const getProgressVariant = (p) => {
    if (p === 0) return "ec-progress-fill--not-started";
    if (p === 100) return "ec-progress-fill--complete";
    return "ec-progress-fill--in-progress";
  };

  const getProgressText = (p, c, t) => {
    if (p === 0) return "Not started";
    if (p === 100) return "Completed";
    return `${c}/${t} lessons (${p}%)`;
  };

  const getProgressTextClass = (p) => {
    if (p === 100) return "ec-progress-text--complete";
    if (p === 0) return "ec-progress-text--not-started";
    return "ec-progress-text--in-progress";
  };

  const formatTimeSpent = (sec) => {
    if (!sec) return "No time spent";

    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);

    return h > 0 ? `${h}h ${m}m spent` : `${m}m spent`;
  };

  const getLastAccessedText = (last) => {
    if (!last) return "Not started";

    const date = new Date(last);
    const now = new Date();
    const diffMs = Math.abs(now - date);
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days === 0) return "Last accessed today";
    if (days === 1) return "Last accessed yesterday";
    if (days < 7) return `Last accessed ${days} days ago`;
    if (days < 30) return `Last accessed ${Math.floor(days / 7)} weeks ago`;
    return `Last accessed ${Math.floor(days / 30)} months ago`;
  };

  const getEnrollmentDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return `Enrolled on ${date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
  };

  const filteredCourses =
    myCourses?.enrolled_courses?.filter(
      (c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  /* ==================== STATES ====================== */

  if (isLoading) {
    return (
      <div className="ec-page">
        <div className="ec-courses">
          <div className="ec-loading">
            <div className="ec-loading-spinner"></div>
            <div className="ec-loading-text">
              Loading your courses and progress...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ec-page">
        <div className="ec-courses">
          <div className="ec-error">
            <div className="ec-error-icon">⚠️</div>
            <h3 className="ec-error-title">Something went wrong</h3>
            <p className="ec-error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ==================== MAIN ====================== */

  return (
    <div className="ec-page">
      <div className="ec-container">
        <div className="ec-courses">
          {/* HEADER */}
          <div className="ec-header">
            <h1 className="ec-title">My Learning</h1>
            <p className="ec-subtitle">
              {myCourses?.count || 0} course
              {(myCourses?.count || 0) !== 1 ? "s" : ""} enrolled
            </p>
          </div>

          {/* SEARCH */}
          {myCourses?.enrolled_courses?.length > 0 && (
            <>
              <div className="ec-search-container">
                <input
                  type="text"
                  placeholder="Search your courses by title, instructor, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ec-search"
                />
              </div>

              {searchTerm && (
                <div className="ec-results-count">
                  Showing {filteredCourses.length} of {myCourses.count} courses
                </div>
              )}

              {/* NO RESULTS */}
              {searchTerm && filteredCourses.length === 0 ? (
                <div className="ec-no-results">
                  <div className="ec-no-results-icon">🔍</div>
                  <h3>No courses found</h3>
                  <p>No enrolled courses match "{searchTerm}"</p>
                </div>
              ) : (
                <div className="ec-grid">
                  {filteredCourses.map((course) => {
                    const p = getCourseProgressData(course.id);
                    const progress = Math.round(p.progress_percentage || 0);

                    return (
                      <Link
                        to={`/course-content/${course.id}`}
                        key={course.id}
                        className="ec-card-link"
                      >
                        <div className="ec-card">
                          {/* HEADER */}
                          <div className="ec-card-header">
                            <h3 className="ec-course-title">{course.title}</h3>

                            <div className="ec-course-meta">
                              {course.instructor_name && (
                                <span className="ec-instructor">
                                  By {course.instructor_name}
                                </span>
                              )}
                              {course.category && (
                                <span className="ec-category">
                                  {course.category}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* PROGRESS */}
                          <div className="ec-progress-section">
                            <div className="ec-progress-header">
                              <span className="ec-progress-label">
                                Your Progress
                              </span>
                              <span className="ec-progress-percentage">
                                {progress}%
                              </span>
                            </div>

                            <div className="ec-progress-bar">
                              <div
                                className={`ec-progress-fill ${getProgressVariant(
                                  progress
                                )}`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>

                            <div className="ec-progress-details">
                              <p
                                className={`ec-progress-text ${getProgressTextClass(
                                  progress
                                )}`}
                              >
                                {getProgressText(
                                  progress,
                                  p.completed_lessons,
                                  p.total_lessons || course.total_lessons
                                )}
                              </p>

                              {p.last_accessed && (
                                <p className="ec-last-accessed">
                                  {getLastAccessedText(p.last_accessed)}
                                </p>
                              )}

                              {p.total_watched_seconds > 0 && (
                                <p className="ec-time-spent">
                                  {formatTimeSpent(p.total_watched_seconds)}
                                </p>
                              )}

                              {course.enrolled_at && (
                                <p className="ec-enrollment-date">
                                  {getEnrollmentDate(course.enrolled_at)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* EMPTY STATE */}
          {(!myCourses?.enrolled_courses || myCourses.enrolled_courses.length === 0) && (
            <div className="ec-empty">
              <div className="ec-empty-icon">📚</div>
              <h3 className="ec-empty-title">No courses enrolled yet</h3>
              <p className="ec-empty-subtitle">
                Browse available courses below to get started
              </p>
            </div>
          )}
        </div>

        {/* ALL COURSES SECTION */}
        {/* FIX: Pass the userId prop */}
        {currentUserId && <NotEnrolledCourses userId={currentUserId} />}
      </div>
      
      {/* Footer added here */}
      <Footer />
    </div>
  );
}

export default MyEnrolledCourses;