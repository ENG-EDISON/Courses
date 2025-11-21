import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { getCourseFullStructure } from '../../api/CoursesApi'
import {
    getCourseLessonProgress,
    updateBulkLessonProgress,
    getCourseProgressSummary,
    trackLessonProgress,
    getLastPlayedLesson,
} from '../../api/LessonProgressApi';

import CourseHeader from './components/CourseHeader';
import CourseLayout from './components/CourseLayout';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import "../../static/CourseContentPage.css"

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

    // ✅ FIXED: Proper markLessonAsCompleted function
    const markLessonAsCompleted = async (lesson) => {
        try {
            // 🔍 Debug: Check what we're receiving
            console.log("🔍 markLessonAsCompleted - received:", lesson);
            console.log("🔍 markLessonAsCompleted - lesson type:", typeof lesson);
            
            // ✅ Get lesson ID from either object or direct ID
            let lessonId;
            if (typeof lesson === 'object' && lesson !== null) {
                lessonId = lesson.id;
                console.log("🔍 Extracted lessonId from object:", lessonId);
            } else {
                lessonId = lesson;
                console.log("🔍 Using lesson as ID:", lessonId);
            }

            // ✅ Validate lessonId
            if (!lessonId || isNaN(Number(lessonId))) {
                console.error('❌ Invalid lesson ID:', lessonId);
                return;
            }

            const numericLessonId = Number(lessonId);
            
            // ✅ Check if already completed
            if (completionStatus[numericLessonId]) {
                console.log('✅ Lesson already completed, skipping');
                return;
            }

            console.log("🎯 Marking lesson as completed:", numericLessonId);

            // ✅ Update local state immediately for better UX
            setCompletionStatus(prev => ({
                ...prev,
                [numericLessonId]: true
            }));

            // ✅ Get video duration from activeVideo or the lesson object
            const videoDuration = activeVideo?.video_duration || lesson?.video_duration || 0;
            
            console.log("📊 Tracking completion with:", {
                lessonId: numericLessonId,
                videoDuration: videoDuration,
                currentTime: videoDuration // Use full duration for completion
            });

            // ✅ Track as completed
            await trackLessonPlay(numericLessonId, {
                current_time: Math.floor(videoDuration),
                completed: true,
                total_duration: videoDuration
            });

            // ✅ Also update via bulk API for consistency
            const bulkProgressData = [
                {
                    lesson_id: numericLessonId,
                    completed: true,
                    watched_duration: Math.floor(videoDuration)
                }
            ];

            await updateBulkLessonProgress(id, bulkProgressData);

            // ✅ Refresh progress summary
            const summaryResponse = await getCourseProgressSummary(id);
            setProgressSummary(summaryResponse.data);

            console.log("✅ Successfully marked lesson as completed");

        } catch (error) {
            console.error('❌ Error updating lesson progress:', error);
            console.error('❌ Error details:', error.response?.data);

            // ✅ Revert local state on error
            const lessonId = typeof lesson === 'object' ? lesson.id : lesson;
            setCompletionStatus(prev => {
                const newState = { ...prev };
                delete newState[lessonId];
                return newState;
            });
        }
    };

    // ✅ FIXED: Updated trackLessonPlay to accept data object
    const trackLessonPlay = async (lessonId, data) => {
        try {
            console.log('🔍 trackLessonPlay - lessonId:', lessonId, 'type:', typeof lessonId);
            console.log('🔍 trackLessonPlay - data:', data);
            
            // ✅ Validate lessonId
            if (!lessonId || isNaN(Number(lessonId))) {
                console.error('❌ Invalid lessonId in trackLessonPlay:', lessonId);
                return;
            }

            const numericLessonId = Number(lessonId);
            
            await trackLessonProgress(numericLessonId, {
                current_time: data.current_time || 0,
                completed: data.completed || false,
                total_duration: data.total_duration || 0
            });
            
            console.log('✅ trackLessonPlay completed successfully');
        } catch (error) {
            console.error('❌ Error in trackLessonPlay:', error);
            throw error; // Re-throw to handle in calling function
        }
    };

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

                // ✅ Process progress data
                const progressData = progressResponse.data;
                const completedLessons = {};

                if (Array.isArray(progressData)) {
                    progressData.forEach(progress => {
                        // ✅ Get lesson ID from various possible field names
                        const lessonId = progress.lesson || progress.lesson_id || progress.id;
                        console.log("🔍 Progress item:", progress, "Lesson ID:", lessonId);
                        
                        if (progress.completed && lessonId) {
                            completedLessons[lessonId] = true;
                        }
                    });
                }

                console.log("✅ Completed lessons found:", completedLessons);
                setCompletionStatus(completedLessons);

                // ✅ Handle last played lesson
                if (lastPlayedResponse.data && lastPlayedResponse.data.lesson_id) {
                    setLastPlayed(lastPlayedResponse.data);
                    console.log("✅ Last played lesson:", lastPlayedResponse.data);
                }

                // ✅ Set active video
                let activeVideoToSet = null;
                if (lastPlayedResponse.data && lastPlayedResponse.data.lesson_id) {
                    activeVideoToSet = findLessonInCourse(courseResponse.data, lastPlayedResponse.data.lesson_id);
                    if (activeVideoToSet) {
                        activeVideoToSet.lastPlayedTime = lastPlayedResponse.data.current_time;
                        console.log("✅ Setting active video from last played:", activeVideoToSet);
                    }
                }

                if (!activeVideoToSet) {
                    activeVideoToSet = findFirstVideo(courseResponse.data);
                    console.log("✅ Setting active video from first video:", activeVideoToSet);
                }

                setActiveVideo(activeVideoToSet);

                // ✅ Expand first section by default
                if (courseResponse.data.sections && courseResponse.data.sections.length > 0) {
                    setExpandedSections(new Set([courseResponse.data.sections[0].id]));
                }

            } catch (err) {
                console.error('Full error details:', err);
                if (err.response?.status === 404) {
                    setError('Course not found. Please check the course ID.');
                } else if (err.response?.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError('Failed to load course content');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            // ✅ ADDED: Validate course ID before fetching
            if (!id || id === '-pdO6JrlDkw') {
                setError('Invalid course ID');
                setLoading(false);
                return;
            }
            fetchCourseContent();
        }
    }, [id]);

    // ✅ FINDING LESSON IDS - These functions extract lesson IDs from the course structure

    const findFirstVideo = (courseData) => {
        if (!courseData.sections) return null;
        console.log("🔍 Finding first video in course structure...");
        
        for (const section of courseData.sections) {
            console.log("🔍 Checking section:", section.title);
            for (const subsection of section.subsections) {
                console.log("🔍 Checking subsection:", subsection.title);
                if (subsection.lessons && subsection.lessons.length > 0) {
                    const firstLesson = subsection.lessons[0];
                    console.log("✅ Found first lesson:", firstLesson);
                    console.log("🔍 First lesson video_source:", firstLesson.video_source);
                    return {
                        ...firstLesson,
                        sectionTitle: section.title,
                        subsectionTitle: subsection.title,
                        lastPlayedTime: 0
                    };
                }
            }
        }
        console.log("❌ No lessons found in course");
        return null;
    };

    const findLessonInCourse = (courseData, lessonId) => {
        if (!courseData.sections) return null;
        console.log("🔍 Searching for lesson ID:", lessonId, "in course...");
        
        for (const section of courseData.sections) {
            for (const subsection of section.subsections) {
                if (subsection.lessons) {
                    const lesson = subsection.lessons.find(l => l.id === lessonId);
                    if (lesson) {
                        console.log("✅ Found lesson:", lesson);
                        console.log("🔍 Lesson video_source:", lesson.video_source);
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
        console.log("❌ Lesson not found in course structure");
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
        console.log("🔍 handleVideoSelect - lesson:", lesson);
        console.log("🔍 handleVideoSelect - lesson.id:", lesson?.id);
        console.log("🔍 handleVideoSelect - video_source:", lesson?.video_source);
        
        const videoData = {
            ...lesson,
            sectionTitle,
            subsectionTitle,
            lastPlayedTime: lastPlayed?.lesson_id === lesson.id ? lastPlayed.current_time : 0
        };
        setActiveVideo(videoData);
    };

    // 🔍 Debug activeVideo changes
    useEffect(() => {
        console.log("🔍 activeVideo updated:", activeVideo);
        console.log("🔍 activeVideo.id:", activeVideo?.id);
        console.log("🔍 activeVideo.id type:", typeof activeVideo?.id);
        console.log("🔍 activeVideo.video_source:", activeVideo?.video_source);
        console.log("🔍 activeVideo.video_file:", activeVideo?.video_file);
        console.log("🔍 activeVideo.video_url:", activeVideo?.video_url);
    }, [activeVideo]);

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