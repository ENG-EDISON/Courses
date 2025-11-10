import { useDebugValue, useEffect, useState } from "react"
import { getMyEnrolledCourses } from "../api/ProfileApis"
import { getCourseProgressSummary } from "../api/LessonProgressApi"
import "../static/EnrolledCourses.css"
import CourseSection from "../components/CourseSection"
import { Link } from "react-router-dom";

function MyEnrolledCourses() {
    const [myCourses, setMyCourses] = useState(null);
    const [courseProgress, setCourseProgress] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const response = await getMyEnrolledCourses();
                const courses = response.data;
                setMyCourses(courses);
                console.log("Enrolled courses:", courses);

                // Fetch progress for each course
                if (courses?.courses) {
                    await fetchAllCourseProgress(courses.courses);
                }
            } catch (error) {
                setError("Unable to load your courses. Please try again later.");
                console.error("Error fetching courses:", error);
            } finally {
                setIsLoading(false);
            }
        }

        const fetchAllCourseProgress = async (courses) => {
            try {
                const progressPromises = courses.map(course => 
                    getCourseProgressSummary(course.id)
                        .then(response => ({
                            courseId: course.id,
                            progress: response.data
                        }))
                        .catch(error => {
                            console.error(`Error fetching progress for course ${course.id}:`, error);
                            return {
                                courseId: course.id,
                                progress: null
                            };
                        })
                );

                const progressResults = await Promise.all(progressPromises);
                
                const progressMap = {};
                progressResults.forEach(result => {
                    if (result.progress) {
                        progressMap[result.courseId] = result.progress;
                    }
                });
                
                setCourseProgress(progressMap);
                console.log("Course progress data:", progressMap);
            } catch (error) {
                console.error("Error fetching course progress:", error);
            }
        }

        fetchMyCourses();
    }, []);

    useDebugValue(myCourses ?? 'Loading...');

    // Get progress data for a specific course
    const getCourseProgressData = (courseId) => {
        return courseProgress[courseId] || {
            progress_percentage: 0,
            completed_lessons: 0,
            total_lessons: 0,
            total_watched_seconds: 0,
            last_accessed: null,
            enrollment_progress: 0
        };
    };

    const getProgressVariant = (progress) => {
        if (progress === 0) return 'enrolled-courses__progress-fill--not-started';
        if (progress === 100) return 'enrolled-courses__progress-fill--complete';
        return 'enrolled-courses__progress-fill--in-progress';
    };

    const getProgressText = (progress, completedLessons, totalLessons) => {
        if (progress === 0) return 'Not started';
        if (progress === 100) return 'Completed';
        return `${completedLessons}/${totalLessons} lessons (${progress}%)`;
    };

    const getProgressTextClass = (progress) => {
        if (progress === 100) return 'enrolled-courses__progress-text--complete';
        if (progress === 0) return 'enrolled-courses__progress-text--not-started';
        return 'enrolled-courses__progress-text--in-progress';
    };

    const formatTimeSpent = (seconds) => {
        if (!seconds || seconds === 0) return 'No time spent';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m spent`;
        }
        return `${minutes}m spent`;
    };

    const getLastAccessedText = (lastAccessed) => {
        if (!lastAccessed) return 'Not started';
        
        const lastAccessedDate = new Date(lastAccessed);
        const now = new Date();
        const diffTime = Math.abs(now - lastAccessedDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Last accessed today';
        if (diffDays === 1) return 'Last accessed yesterday';
        if (diffDays < 7) return `Last accessed ${diffDays} days ago`;
        if (diffDays < 30) return `Last accessed ${Math.floor(diffDays / 7)} weeks ago`;
        return `Last accessed ${Math.floor(diffDays / 30)} months ago`;
    };

    const getEnrollmentDate = (enrolledAt) => {
        if (!enrolledAt) return '';
        
        const enrolledDate = new Date(enrolledAt);
        return `Enrolled on ${enrolledDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`;
    };

    // Filter courses based on search term
    const filteredCourses = myCourses?.courses?.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="enrolled-courses">
                <div className="enrolled-courses__loading">
                    <div className="enrolled-courses__loading-spinner"></div>
                    <div className="enrolled-courses__loading-text">Loading your courses and progress...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="enrolled-courses">
                <div className="enrolled-courses__error">
                    <div className="enrolled-courses__error-icon">⚠️</div>
                    <h3 className="enrolled-courses__error-title">Something went wrong</h3>
                    <p className="enrolled-courses__error-message">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="enrolled-courses-container">
            {/* Enrolled Courses Section */}
            <div className="enrolled-courses">
                <div className="enrolled-courses__header">
                    <h1 className="enrolled-courses__title">My Learning</h1>
                    <p className="enrolled-courses__subtitle">
                        {myCourses?.count || 0} course{(myCourses?.count || 0) !== 1 ? 's' : ''} enrolled
                    </p>
                </div>

                {/* Search Bar - Only show if there are enrolled courses */}
                {myCourses?.courses && myCourses.courses.length > 0 && (
                    <>
                        <div className="enrolled-courses__search-container">
                            <input
                                type="text"
                                placeholder="Search your courses by title, instructor, or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="enrolled-courses__search"
                            />
                        </div>
                        
                        {/* Results Count */}
                        {searchTerm && (
                            <div className="enrolled-courses__results-count">
                                Showing {filteredCourses.length} of {myCourses.count} courses
                            </div>
                        )}
                        
                        {/* No Enrolled Courses Results Message */}
                        {searchTerm && filteredCourses.length === 0 ? (
                            <div className="enrolled-courses__no-results">
                                <div className="enrolled-courses__no-results-icon">🔍</div>
                                <h3>No courses found</h3>
                                <p>No enrolled courses match "{searchTerm}"</p>
                            </div>
                        ) : (
                            <div className="enrolled-courses__grid">
                                {filteredCourses.map(course => {
                                    const progressData = getCourseProgressData(course.id);
                                    const progressPercentage = Math.round(progressData.progress_percentage || 0);
                                    const completedLessons = progressData.completed_lessons || 0;
                                    const totalLessons = progressData.total_lessons || course.total_lessons || 0;
                                    
                                    return (
                                        <Link 
                                            to={`/course-content/${course.id}`}
                                            key={course.enrollment_id} 
                                            className="enrolled-courses__card-link"
                                        >
                                            <div className="enrolled-courses__card">
                                                {/* Course Header */}
                                                <div className="enrolled-courses__card-header">
                                                    <h3 className="enrolled-courses__course-title">{course.title}</h3>
                                                    <div className="enrolled-courses__course-meta">
                                                        {course.instructor_name && (
                                                            <span className="enrolled-courses__instructor">
                                                                By {course.instructor_name}
                                                            </span>
                                                        )}
                                                        {course.category && (
                                                            <span className="enrolled-courses__category">
                                                                {course.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Progress Section */}
                                                <div className="enrolled-courses__progress-section">
                                                    <div className="enrolled-courses__progress-header">
                                                        <span className="enrolled-courses__progress-label">Your Progress</span>
                                                        <span className="enrolled-courses__progress-percentage">
                                                            {progressPercentage}%
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="enrolled-courses__progress-bar">
                                                        <div 
                                                            className={`enrolled-courses__progress-fill ${getProgressVariant(progressPercentage)}`}
                                                            style={{ width: `${progressPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                    
                                                    <div className="enrolled-courses__progress-details">
                                                        <p className={`enrolled-courses__progress-text ${getProgressTextClass(progressPercentage)}`}>
                                                            {getProgressText(progressPercentage, completedLessons, totalLessons)}
                                                        </p>
                                                        {progressData.last_accessed && (
                                                            <p className="enrolled-courses__last-accessed">
                                                                {getLastAccessedText(progressData.last_accessed)}
                                                            </p>
                                                        )}
                                                        {progressData.total_watched_seconds > 0 && (
                                                            <p className="enrolled-courses__time-spent">
                                                                {formatTimeSpent(progressData.total_watched_seconds)}
                                                            </p>
                                                        )}
                                                        {course.enrolled_at && (
                                                            <p className="enrolled-courses__enrollment-date">
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

                {/* No Enrolled Courses Message */}
                {(!myCourses || !myCourses.courses || myCourses.courses.length === 0) && (
                    <div className="enrolled-courses__empty">
                        <div className="enrolled-courses__empty-icon">📚</div>
                        <h3 className="enrolled-courses__empty-title">No courses enrolled yet</h3>
                        <p className="enrolled-courses__empty-subtitle">Browse available courses below to get started</p>
                    </div>
                )}
            </div>

            {/* All Courses Section */}
            <CourseSection />
        </div>
    );
}

export default MyEnrolledCourses;