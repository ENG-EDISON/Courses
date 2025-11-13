// Lesson.jsx
import React, { useCallback, useState } from 'react';
import LessonHeader from './LessonHeader';
import VideoSettings from './VideoSettings';
import LessonMeta from './LessonMeta';
import LessonResources from './LessonResources';

const Lesson = ({
  lesson,
  sectionIndex,
  subsectionIndex,
  lessonIndex,
  sections,
  setSections,
  onUpdate,
  isExistingInDatabase,
  isExpanded,
  onToggle,
  course // Add course prop to get course ID
}) => {
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [videoSource, setVideoSource] = useState(
    lesson.video_file ? 'upload' : (lesson.video_url ? 'url' : 'upload')
  );

  // Get course ID from course prop
  const getCourseId = useCallback(() => {
    return course?.id || null;
  }, [course]);

  // Get subsection ID from the current subsection
  const getSubsectionId = useCallback(() => {
    const currentSubsection = sections[sectionIndex]?.subsections?.[subsectionIndex];
    return currentSubsection?.id || null;
  }, [sectionIndex, subsectionIndex, sections]);

  const updateLesson = useCallback((field, value) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.map((les, lesIdx) =>
              lesIdx === lessonIndex ? { ...les, [field]: value } : les
            );
            return { ...sub, lessons: updatedLessons };
          }
          return sub;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate]);

  // Handle lesson creation from API
  const handleLessonCreate = useCallback((newLessonData, sectionIndex, subsectionIndex, lessonIndex) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((subsection, subIndex) => {
          if (subIndex === subsectionIndex) {
            const updatedLessons = subsection.lessons.map((lesson, lesIndex) => {
              if (lesIndex === lessonIndex) {
                // Replace the local lesson with the one from API (with ID)
                return { 
                  ...newLessonData, 
                  isExisting: true,
                  // Preserve local state that might not be in API response
                  resources: lesson.resources || []
                };
              }
              return lesson;
            });
            return { ...subsection, lessons: updatedLessons };
          }
          return subsection;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sections, setSections, onUpdate]);

  // Handle lesson update from API
  const handleLessonUpdate = useCallback((lessonId, updatedData) => {
    const updatedSections = sections.map(section => ({
      ...section,
      subsections: section.subsections.map(subsection => ({
        ...subsection,
        lessons: subsection.lessons.map(lesson => 
          lesson.id === lessonId ? { 
            ...updatedData, 
            isExisting: true,
            // Preserve local state
            resources: lesson.resources || []
          } : lesson
        )
      }))
    }));
    
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sections, setSections, onUpdate]);

  // Handle lesson deletion from API
  const handleLessonDelete = useCallback((lessonId, sectionIndex, subsectionIndex, lessonIndex) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((subsection, subIndex) => {
          if (subIndex === subsectionIndex) {
            const updatedLessons = subsection.lessons.filter((_, lesIndex) => lesIndex !== lessonIndex);
            return { ...subsection, lessons: updatedLessons };
          }
          return subsection;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sections, setSections, onUpdate]);

  const deleteLesson = useCallback(() => {
    const lessonToDelete = sections[sectionIndex]?.subsections[subsectionIndex]?.lessons[lessonIndex];

    if (lessonToDelete?.id) {
      if (window.confirm('This lesson exists in the database. Do you want to delete it permanently?')) {
        console.log('Should delete existing lesson from database:', lessonToDelete.id);
        // This will now be handled by the API delete in LessonHeader
        return;
      } else {
        return;
      }
    }

    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.filter((_, lesIdx) => lesIdx !== lessonIndex);
            return { ...sub, lessons: updatedLessons };
          }
          return sub;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate]);

  const addResource = useCallback(() => {
    if (isAddingResource) return;

    setIsAddingResource(true);
    try {
      const updatedSections = sections.map((section, secIndex) => {
        if (secIndex === sectionIndex) {
          const updatedSubsections = section.subsections.map((sub, subIdx) => {
            if (subIdx === subsectionIndex) {
              const updatedLessons = sub.lessons.map((les, lesIdx) => {
                if (lesIdx === lessonIndex) {
                  const newResource = {
                    title: `Resource ${(les.resources?.length || 0) + 1}`,
                    file: null,
                    resource_type: 'document',
                    order: les.resources?.length || 0,
                    lesson: lessonIndex,
                    isExisting: false
                  };
                  return {
                    ...les,
                    resources: [...(les.resources || []), newResource]
                  };
                }
                return les;
              });
              return { ...sub, lessons: updatedLessons };
            }
            return sub;
          });
          return { ...section, subsections: updatedSubsections };
        }
        return section;
      });
      setSections(updatedSections);
      onUpdate(updatedSections);
    } finally {
      setTimeout(() => setIsAddingResource(false), 300);
    }
  }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate, isAddingResource]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
      if (!validVideoTypes.includes(file.type)) {
        alert('Please select a valid video file (MP4, MOV, AVI, MKV, WebM)');
        return;
      }

      if (file.size > 500 * 1024 * 1024) {
        alert('Video file size must be less than 500MB');
        return;
      }

      updateLesson('video_file', file);

      if (videoSource === 'upload' && lesson.video_url) {
        updateLesson('video_url', '');
      }
    }
  };

  const handleVideoSourceChange = (source) => {
    setVideoSource(source);

    if (source === 'upload' && lesson.video_url) {
      updateLesson('video_url', '');
    } else if (source === 'url' && lesson.video_file) {
      updateLesson('video_file', null);
    }
  };

  return (
    <div className={`lesson-card ${isExistingInDatabase(lesson) ? 'existing-lesson' : 'new-lesson'}`}>
      <LessonHeader
        lesson={lesson}
        isExpanded={isExpanded}
        isExistingInDatabase={isExistingInDatabase}
        isAddingResource={isAddingResource}
        onToggle={onToggle}
        onOrderChange={(e) => updateLesson('order', parseInt(e.target.value) || 0)}
        onTitleChange={(e) => updateLesson('title', e.target.value)}
        onAddResource={addResource}
        onDelete={deleteLesson}
        // New API integration props
        onLessonCreate={handleLessonCreate}
        onLessonUpdate={handleLessonUpdate}
        onLessonDelete={handleLessonDelete}
        courseId={getCourseId()}
        subsectionId={getSubsectionId()}
        sectionIndex={sectionIndex}
        subsectionIndex={subsectionIndex}
        lessonIndex={lessonIndex}
        course={course}
      />

      {isExpanded && (
        <div className="lesson-content">
          <label className="section-label">Lesson Content</label>
          <textarea
            value={lesson.content}
            onChange={(e) => updateLesson('content', e.target.value)}
            placeholder="Enter lesson content..."
            rows={4}
            className="lesson-content-textarea"
          />

          <VideoSettings
            lesson={lesson}
            videoSource={videoSource}
            onVideoSourceChange={handleVideoSourceChange}
            onFileChange={handleFileChange}
            onVideoUrlChange={(e) => updateLesson('video_url', e.target.value)}
          />

          <LessonMeta
            lesson={lesson}
            onDurationChange={(e) => updateLesson('duration_minutes', parseInt(e.target.value) || 0)}
            onPreviewChange={(e) => updateLesson('is_preview', e.target.checked)}
          />

          <LessonResources
            lesson={lesson}
            sectionIndex={sectionIndex}
            subsectionIndex={subsectionIndex}
            lessonIndex={lessonIndex}
            sections={sections}
            setSections={setSections}
            onUpdate={onUpdate}
            isExistingInDatabase={isExistingInDatabase}
            isAddingResource={isAddingResource}
            onAddResource={addResource}
          />
        </div>
      )}
    </div>
  );
};

export default Lesson;