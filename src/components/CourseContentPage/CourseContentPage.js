import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseFullStructure } from '../api/CoursesApi';
import {
    getCourseLessonProgress,
    getCourseProgressSummary,
    getLastPlayedLesson,
} from '../api/LessonProgressApi';
import CourseHeader from './components/CourseHeader';
import CourseLayout from './components/CourseLayout';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import "../static/CourseContentPage.css"

const CourseContentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeVideo, setActiveVideo] = useState(null);
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [completionStatus, setCompletionStatus] = useState({});
    const [progressSummary, setProgressSummary] = useState(null);
    const [lastPlayed, setLastPlayed] = useState(null);

    useEffect(() => {
        const fetchCourseContent = async () => {
            try {
                console.log("Fetching course content for course ID:", id);

                const [courseResponse, progressResponse, summaryResponse, lastPlayedResponse] = await Promise.all([
                    getCourseFullStructure(id),
                    getCourseLessonProgress(id),
                    getCourseProgressSummary(id),
                    getLastPlayedLesson(id).catch(err => ({ data: null }))
                ]);

                setCourse(courseResponse.data);
                setProgressSummary(summaryResponse.data);

                // Process progress data
                const progressData = progressResponse.data;
                const completedLessons = {};

                if (Array.isArray(progressData)) {
                    progressData.forEach(progress => {
                        const lessonId = progress.lesson || progress.lesson_id;
                        if (progress.completed && lessonId) {
                            completedLessons[lessonId] = true;
                        }
                    });
                }

                setCompletionStatus(completedLessons);

                // Handle last played lesson
                if (lastPlayedResponse.data && lastPlayedResponse.data.lesson_id) {
                    setLastPlayed(lastPlayedResponse.data);
                }

                // Set active video
                let activeVideoToSet = null;
                if (lastPlayedResponse.data && lastPlayedResponse.data.lesson_id) {
                    activeVideoToSet = findLessonInCourse(courseResponse.data, lastPlayedResponse.data.lesson_id);
                    if (activeVideoToSet) {
                        activeVideoToSet.lastPlayedTime = lastPlayedResponse.data.current_time;
                    }
                }

                if (!activeVideoToSet) {
                    activeVideoToSet = findFirstVideo(courseResponse.data);
                }

                setActiveVideo(activeVideoToSet);

                // Expand first section by default
                if (courseResponse.data.sections && courseResponse.data.sections.length > 0) {
                    setExpandedSections(new Set([courseResponse.data.sections[0].id]));
                }

            } catch (err) {
                console.error('Full error details:', err);
                setError('Failed to load course content');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourseContent();
        }
    }, [id]);

    const findFirstVideo = (courseData) => {
        if (!courseData.sections) return null;
        for (const section of courseData.sections) {
            for (const subsection of section.subsections) {
                if (subsection.lessons && subsection.lessons.length > 0) {
                    return {
                        ...subsection.lessons[0],
                        sectionTitle: section.title,
                        subsectionTitle: subsection.title,
                        lastPlayedTime: 0
                    };
                }
            }
        }
        return null;
    };

    const findLessonInCourse = (courseData, lessonId) => {
        if (!courseData.sections) return null;
        for (const section of courseData.sections) {
            for (const subsection of section.subsections) {
                if (subsection.lessons) {
                    const lesson = subsection.lessons.find(l => l.id === lessonId);
                    if (lesson) {
                        return {
                            ...lesson,
                            sectionTitle: section.title,
                            subsectionTitle: subsection.title,
                            lastPlayedTime: 0
                        };
                    }
                }
            }
        }
        return null;
    };

    const toggleSection = (sectionId) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const handleVideoSelect = async (lesson, sectionTitle, subsectionTitle) => {
        const videoData = {
            ...lesson,
            sectionTitle,
            subsectionTitle,
            lastPlayedTime: lastPlayed?.lesson_id === lesson.id ? lastPlayed.current_time : 0
        };
        setActiveVideo(videoData);
    };

    if (loading) return <LoadingState />;
    if (error || !course) return <ErrorState error={error} navigate={navigate} />;

    return (
        <div className="course-content">
            <CourseHeader 
                course={course}
                progressSummary={progressSummary}
                lastPlayed={lastPlayed}
                activeVideo={activeVideo}
                completionStatus={completionStatus}
                onResumeLastPlayed={handleVideoSelect}
                findLessonInCourse={findLessonInCourse}
            />
            
            <CourseLayout
                course={course}
                activeVideo={activeVideo}
                expandedSections={expandedSections}
                completionStatus={completionStatus}
                progressSummary={progressSummary}
                onVideoSelect={handleVideoSelect}
                onToggleSection={toggleSection}
                onMarkComplete={markLessonAsCompleted}
            />
        </div>
    );
};

export default CourseContentPage;