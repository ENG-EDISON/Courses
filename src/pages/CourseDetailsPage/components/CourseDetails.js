// src/pages/CourseDetailsPage/components/CourseDetails.jsx
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCoursePreviewStructure } from "../../../api/CoursesApi";
import "../../../static/Courses.css";

import CourseLoading from "./CourseLoading";
import CourseError from "./CourseError";
import VideoModal from "./VideoModal";
import CourseHero from "./CourseHero";
import CourseMainContent from "./CourseMainContent";
import CourseSidebar from "./CourseSidebar";
import Footer from "../../../components/common/Footer";

function CourseDetails() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [expandedSubsections, setExpandedSubsections] = useState(new Set());
    const [currentVideo, setCurrentVideo] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);

    // Fetch course full structure from API
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const response = await getCoursePreviewStructure(courseId);
                setCourse(response.data);
            } catch (err) {
                console.error('Error fetching course data:', err);
                setError('Failed to load course. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const toggleSection = (sectionId) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const toggleSubsection = (subsectionId) => {
        const newExpanded = new Set(expandedSubsections);
        if (newExpanded.has(subsectionId)) {
            newExpanded.delete(subsectionId);
        } else {
            newExpanded.add(subsectionId);
        }
        setExpandedSubsections(newExpanded);
    };

    const playPreviewVideo = (lesson) => {
        if (lesson.is_preview && (lesson.video_url || lesson.video_file)) {
            setCurrentVideo(lesson);
            setShowVideoModal(true);
        }
    };

    const closeVideoModal = () => {
        setShowVideoModal(false);
        setCurrentVideo(null);
    };

    if (loading) return <CourseLoading />;
    if (error) return <CourseError error={error} />;
    if (!course) return <CourseError type="not-found" />;

    return (
        <div>
            <div className="enterprise-course">
                <VideoModal
                    show={showVideoModal}
                    currentVideo={currentVideo}
                    onClose={closeVideoModal}
                />

                {/* Pass skipEnrollmentCheck to prevent double checking */}
                <CourseHero course={course} skipEnrollmentCheck={true} />

                <div className="course-container">
                    <div className="course-layout">
                        <CourseMainContent
                            course={course}
                            expandedSections={expandedSections}
                            expandedSubsections={expandedSubsections}
                            onToggleSection={toggleSection}
                            onToggleSubsection={toggleSubsection}
                            onPlayPreviewVideo={playPreviewVideo}
                        />

                        <CourseSidebar course={course} />
                    </div>
                </div>
            </div>
            {/* Footer added here */}
            <Footer/>
        </div>

    );
}

export default CourseDetails;