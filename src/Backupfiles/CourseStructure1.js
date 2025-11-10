// src/components/course-management/CourseStructure/CourseStructure.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CourseStructure.css';
import {
  createsection,
  getCourseSections,
} from '../api/SectionApi';
import { getSubsectionByCourseId, createSubSection, getSubsections, } from '../api/SubsectionApi';
import { getLessons, createLesson, createLessonResource, } from '../api/LessonsApi';

import apiClient from "../utils/Http";

const CourseStructure = ({ course, onUpdate, onSave }) => {
  const [sections, setSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);

  // Refs to prevent multiple API calls
  const loadingRef = useRef(false);

  // Get courseId from course object
  const courseId = course?.id;

  // Load existing course structure when component mounts or course changes
  useEffect(() => {
    if (courseId && !loadingRef.current) {
      loadingRef.current = true;
      loadExistingStructure().finally(() => {
        loadingRef.current = false;
      });
    } else {
      setSections([]);
    }
  }, [courseId]);

  // Function to load existing course structure using your APIs
  const loadExistingStructure = async () => {
    if (!courseId) return;

    setIsLoading(true);
    try {
      console.log("=== DEBUG: Loading course structure ===");

      // 1. Get all sections for this course
      const sectionsResponse = await getCourseSections(courseId);
      const sectionsData = sectionsResponse.data;
      console.log("Sections loaded:", sectionsData.length);

      if (sectionsData.length === 0) {
        setSections([]);
        return;
      }

      // 2. Get all subsections for all sections at once
      const sectionIds = sectionsData.map(section => section.id);
      console.log("Section IDs:", sectionIds);

      const allSubsections = [];
      const uniqueSectionIds = [...new Set(sectionIds)]; // Remove duplicates

      for (const sectionId of uniqueSectionIds) {
        try {
          const subsectionsResponse = await getSubsectionByCourseId(courseId);
          // Use filter to ensure no duplicate subsections
          const uniqueSubsections = subsectionsResponse.data.filter(sub =>
            !allSubsections.some(existing => existing.id === sub.id)
          );
          allSubsections.push(...uniqueSubsections.map(sub => ({
            ...sub,
            section_id: sectionId,
            isExisting: true // Mark as existing in database
          })));
        } catch (error) {
          console.error(`Error loading subsections for section ${sectionId}:`, error);
        }
      }
      console.log("All subsections loaded:", allSubsections.length);

      // 3. Get all lessons for all subsections at once
      const subsectionIds = allSubsections.map(sub => sub.id);
      const uniqueSubsectionIds = [...new Set(subsectionIds)]; // Remove duplicates
      console.log("Unique Subsection IDs:", uniqueSubsectionIds);

      const allLessons = [];
      for (const subsectionId of uniqueSubsectionIds) {
        try {
          const lessonsResponse = await getLessons(subsectionId);
          // Use filter to ensure no duplicate lessons
          const uniqueLessons = lessonsResponse.data.filter(lesson =>
            !allLessons.some(existing => existing.id === lesson.id)
          );
          allLessons.push(...uniqueLessons.map(lesson => ({
            ...lesson,
            subsection_id: subsectionId,
            isExisting: true // Mark as existing in database
          })));
        } catch (error) {
          console.error(`Error loading lessons for subsection ${subsectionId}:`, error);
        }
      }
      console.log("All lessons loaded:", allLessons.length);

      // 4. Build the nested structure
      const loadedSections = sectionsData.map(section => {
        const sectionSubsections = allSubsections.filter(sub => sub.section_id === section.id);

        const subsectionsWithLessons = sectionSubsections.map(subsection => {
          const subsectionLessons = allLessons.filter(lesson => lesson.subsection_id === subsection.id);

          const lessonsWithResources = subsectionLessons.map(lesson => ({
            ...lesson,
            duration_minutes: lesson.video_duration ? Math.round(lesson.video_duration / 60) : 0,
            resources: [] // Skip resources for now to reduce calls
          }));

          return {
            ...subsection,
            lessons: lessonsWithResources
          };
        });

        return {
          ...section,
          subsections: subsectionsWithLessons,
          isExisting: true // Mark as existing in database
        };
      });

      console.log("Final structure built:", loadedSections);
      setSections(loadedSections);

      if (onUpdate) {
        onUpdate(loadedSections);
      }

    } catch (error) {
      console.error('Error loading course structure:', error);
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if item exists in database
  const isExistingInDatabase = (item) => {
    return item.id && item.isExisting !== false;
  };

  // Submit function using your separate APIs - FIXED VERSION
  // Submit function using your separate APIs - FIXED VERSION
  const submitCourseStructure = async () => {
    if (!courseId) {
      alert('Course ID is required. Please select a course first.');
      return;
    }

    if (sections.length === 0) {
      alert('Please add at least one section');
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log("=== DEBUG: STARTING COURSE STRUCTURE SUBMISSION ===");
      console.log("Course ID:", courseId);
      console.log("Total sections in state:", sections.length);

      const createdSections = [];
      const createdSubsections = [];
      const createdLessons = [];
      const createdResources = [];

      // Process ALL sections (both existing and new)
      for (const [sectionIndex, section] of sections.entries()) {
        let sectionId = section.id;

        // 1. Create Section if it's NEW
        if (!isExistingInDatabase(section)) {
          console.log(`\n=== DEBUG: Creating NEW Section ${sectionIndex + 1} ===`);
          const sectionData = {
            title: section.title,
            description: section.description,
            order: section.order !== undefined ? section.order : sectionIndex, // FIXED: Use stored order
            course: courseId
          };
          console.log("Section data:", sectionData);

          const sectionResponse = await createsection(sectionData);
          sectionId = sectionResponse.data.id;
          createdSections.push(sectionResponse.data);
          console.log(`Created section with ID: ${sectionId}`);
        } else {
          console.log(`\n=== DEBUG: Using EXISTING Section ${sectionIndex + 1} (ID: ${sectionId}) ===`);
        }

        // 2. Process Subsections for this section
        for (const [subsectionIndex, subsection] of section.subsections.entries()) {
          let subsectionId = subsection.id;

          // Create Subsection if it's NEW
          if (!isExistingInDatabase(subsection)) {
            console.log(`\n=== DEBUG: Creating NEW Subsection ${subsectionIndex + 1} for Section ${sectionIndex + 1} ===`);
            const subsectionData = {
              title: subsection.title,
              description: subsection.description,
              order: subsection.order !== undefined ? subsection.order : subsectionIndex, // FIXED: Use stored order
              section: sectionId
            };
            console.log("Subsection data:", subsectionData);

            const subsectionResponse = await createSubSection(subsectionData);
            subsectionId = subsectionResponse.data.id;
            createdSubsections.push(subsectionResponse.data);
            console.log(`Created subsection with ID: ${subsectionId}`);
          } else {
            console.log(`\n=== DEBUG: Using EXISTING Subsection ${subsectionIndex + 1} (ID: ${subsectionId}) ===`);
          }

          // 3. Process Lessons for this subsection
          for (const [lessonIndex, lesson] of subsection.lessons.entries()) {
            let lessonId = lesson.id;

            // Create Lesson if it's NEW
            if (!isExistingInDatabase(lesson)) {
              console.log(`\n=== DEBUG: Creating NEW Lesson ${lessonIndex + 1} for Subsection ${subsectionIndex + 1} ===`);
              const lessonData = {
                title: lesson.title,
                content: lesson.content,
                video_url: lesson.video_url,
                video_duration: lesson.duration_minutes * 60,
                lesson_type: 'video',
                order: lesson.order !== undefined ? lesson.order : lessonIndex, // FIXED: Use stored order
                is_preview: lesson.is_preview || false,
                subsection: subsectionId
              };
              console.log("Lesson data:", lessonData);

              const lessonResponse = await createLesson(lessonData);
              lessonId = lessonResponse.data.id;
              createdLessons.push(lessonResponse.data);
              console.log(`Created lesson with ID: ${lessonId}`);
            } else {
              console.log(`\n=== DEBUG: Using EXISTING Lesson ${lessonIndex + 1} (ID: ${lessonId}) ===`);
            }

            // 4. Create Resources for this lesson (only NEW ones)
            for (const [resourceIndex, resource] of (lesson.resources || []).entries()) {
              if (!isExistingInDatabase(resource)) {
                console.log(`\n=== DEBUG: Creating NEW Resource ${resourceIndex + 1} for Lesson ${lessonIndex + 1} ===`);

                // For file uploads, use FormData
                if (resource.file) {
                  console.log("Resource has file:", resource.file);
                  const formData = new FormData();
                  formData.append('file', resource.file);
                  formData.append('title', resource.title);
                  formData.append('resource_type', resource.resource_type);
                  formData.append('order', resource.order !== undefined ? resource.order : resourceIndex); // FIXED: Use stored order
                  formData.append('lesson', lessonId);

                  console.log("FormData entries:");
                  for (let pair of formData.entries()) {
                    console.log(pair[0] + ': ', pair[1]);
                  }

                  const resourceResponse = await createLessonResource(formData);
                  createdResources.push(resourceResponse.data);
                  console.log("File resource created successfully");
                } else if (resource.title) {
                  console.log("Resource data (no file):", {
                    title: resource.title,
                    resource_type: resource.resource_type,
                    order: resource.order !== undefined ? resource.order : resourceIndex, // FIXED: Use stored order
                    lesson: lessonId
                  });

                  const resourceResponse = await createLessonResource({
                    title: resource.title,
                    resource_type: resource.resource_type,
                    order: resource.order !== undefined ? resource.order : resourceIndex, // FIXED: Use stored order
                    lesson: lessonId
                  });
                  createdResources.push(resourceResponse.data);
                  console.log("Resource created successfully");
                } else {
                  console.log("Skipping resource - no title provided");
                }
              } else {
                console.log(`\n=== DEBUG: Using EXISTING Resource ${resourceIndex + 1} (ID: ${resource.id}) ===`);
              }
            }
          }
        }
      }

      console.log("\n=== DEBUG: SUBMISSION COMPLETE ===");
      console.log(`Created ${createdSections.length} new sections`);
      console.log(`Created ${createdSubsections.length} new subsections`);
      console.log(`Created ${createdLessons.length} new lessons`);
      console.log(`Created ${createdResources.length} new resources`);

      if (onSave) {
        onSave({
          message: `Structure saved successfully!`,
          created_sections: createdSections.length,
          created_subsections: createdSubsections.length,
          created_lessons: createdLessons.length,
          created_resources: createdResources.length,
          course_id: courseId
        });
      }

      alert(`Course structure saved successfully!\n\nCreated:\n- ${createdSections.length} new sections\n- ${createdSubsections.length} new subsections\n- ${createdLessons.length} new lessons\n- ${createdResources.length} new resources`);

      // Reload the structure to get the actual IDs from the database
      await loadExistingStructure();

    } catch (error) {
      console.error('\n=== DEBUG: ERROR DETAILS ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);

      alert(`Error saving course structure: ${error.response?.data?.message || error.response?.data?.detail || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSection = useCallback((e) => {
    // Prevent default behavior and stop propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('addSection called - checking conditions');

    if (!courseId) {
      alert('Please select a course first.');
      return;
    }

    // Prevent multiple simultaneous additions
    if (isAddingSection) {
      console.log('Prevented - already adding section');
      return;
    }

    setIsAddingSection(true);

    try {
      const newSection = {
        title: `Section ${sections.length + 1}`,
        order: sections.length,
        description: '',
        subsections: [],
        course: courseId,
        isExisting: false // Mark as NEW (not in database)
      };

      console.log('Creating NEW section:', newSection);

      const updatedSections = [...sections, newSection];
      setSections(updatedSections);

      if (onUpdate) {
        onUpdate(updatedSections);
      }
    } finally {
      // Small delay to prevent rapid clicks
      setTimeout(() => {
        setIsAddingSection(false);
        console.log('addSection completed');
      }, 300);
    }
  }, [courseId, sections, isAddingSection, onUpdate]);

  const updateSection = useCallback((sectionIndex, field, value) => {
    const updatedSections = sections.map((section, index) =>
      index === sectionIndex ? { ...section, [field]: value } : section
    );
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sections, onUpdate]);

  const deleteSection = useCallback((sectionIndex) => {
    const sectionToDelete = sections[sectionIndex];

    // If it's an existing section (in database), you might want to call delete API
    if (isExistingInDatabase(sectionToDelete)) {
      if (window.confirm('This section exists in the database. Do you want to delete it permanently?')) {
        // TODO: Call delete API for existing section
        console.log('Should delete existing section from database:', sectionToDelete.id);
      } else {
        return; // User cancelled
      }
    }

    const updatedSections = sections.filter((_, index) => index !== sectionIndex);
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sections, onUpdate]);

  const addSubsection = useCallback((sectionIndex) => {
    const section = sections[sectionIndex];
    const newSubsection = {
      title: `Subsection ${section.subsections.length + 1}`,
      order: section.subsections.length,
      description: '',
      lessons: [],
      section: sectionIndex,
      isExisting: false // Mark as NEW
    };

    const updatedSections = sections.map((sec, index) =>
      index === sectionIndex
        ? {
          ...sec,
          subsections: [...sec.subsections, newSubsection]
        }
        : sec
    );
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sections, onUpdate]);

  // Calculate counts for display
  const getSectionCounts = () => {
    const existingSections = sections.filter(s => isExistingInDatabase(s)).length;
    const newSections = sections.filter(s => !isExistingInDatabase(s)).length;

    let existingSubsections = 0;
    let newSubsections = 0;

    sections.forEach(section => {
      section.subsections.forEach(subsection => {
        if (isExistingInDatabase(subsection)) {
          existingSubsections++;
        } else {
          newSubsections++;
        }
      });
    });

    return { existingSections, newSections, existingSubsections, newSubsections };
  };

  const counts = getSectionCounts();

  // Show loading state
  if (isLoading) {
    return (
      <div className="course-structure">
        <div className="loading-state">
          Loading course structure...
        </div>
      </div>
    );
  }

  return (
    <div className="course-structure">
      <div className="structure-header">
        <div className="structure-title">
          <h3>Course Structure</h3>
          {courseId && (
            <p className="course-info">
              Editing: {course?.title} (ID: {courseId})
              <br />
              <small>
                Sections: {counts.existingSections} existing, {counts.newSections} new |
                Subsections: {counts.existingSubsections} existing, {counts.newSubsections} new
              </small>
            </p>
          )}
        </div>
        <div className="structure-actions">
          <button
            onClick={addSection}
            className="btn-primary"
            disabled={!courseId || isAddingSection}
          >
            {isAddingSection ? 'Adding...' : '+ Add Section'}
          </button>
          <button
            onClick={submitCourseStructure}
            className="btn-success"
            disabled={isSubmitting || sections.length === 0 || !courseId}
          >
            {isSubmitting ? 'Saving...' : 'Save Structure'}
          </button>
        </div>
      </div>

      {/* Show message if no course selected */}
      {!courseId && (
        <div className="no-course-selected">
          <p>Please select a course to edit its structure.</p>
        </div>
      )}

      {/* Progress indicator */}
      {isSubmitting && (
        <div className="submission-progress">
          Saving structure (only new items)... This may take a moment.
        </div>
      )}

      {courseId && (
        <div className="sections-list">
          {sections.map((section, sectionIndex) => (
            <div key={section.id || sectionIndex} className={`section-card ${isExistingInDatabase(section) ? 'existing-section' : 'new-section'}`}>
              <div className="section-header">
                {/* Add Order Input */}
                <div className="order-input-group">
                  <label>Order:</label>
                  <input
                    type="number"
                    value={section.order !== undefined ? section.order : sectionIndex}
                    onChange={(e) => updateSection(sectionIndex, 'order', parseInt(e.target.value) || 0)}
                    className="order-input"
                    min="0"
                  />
                </div>

                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                  className="section-title"
                  placeholder="Section title"
                />
                <div className="section-status">
                  {isExistingInDatabase(section) ? (
                    <span className="status-badge existing">✓ In Database</span>
                  ) : (
                    <span className="status-badge new">+ New</span>
                  )}
                </div>
                <button
                  onClick={() => deleteSection(sectionIndex)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>

              <textarea
                value={section.description}
                onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                className="section-description"
                placeholder="Section description"
                rows={2}
              />

              <div className="subsections">
                <div className="subsection-header">
                  <h4>Subsections</h4>
                  <button
                    onClick={() => addSubsection(sectionIndex)}
                    className="btn-secondary"
                  >
                    + Add Subsection
                  </button>
                </div>

                {section.subsections.map((subsection, subIndex) => (
                  <Subsection
                    key={subsection.id || subIndex}
                    subsection={subsection}
                    sectionIndex={sectionIndex}
                    subsectionIndex={subIndex}
                    sections={sections}
                    setSections={setSections}
                    onUpdate={onUpdate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Subsection Component (updated to handle existing/new)
const Subsection = React.memo(({ subsection, sectionIndex, subsectionIndex, sections, setSections, onUpdate }) => {
  const updateSubsection = useCallback((field, value) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) =>
          subIdx === subsectionIndex ? { ...sub, [field]: value } : sub
        );
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sectionIndex, subsectionIndex, sections, setSections, onUpdate]);

  const deleteSubsection = useCallback(() => {
    const subsectionToDelete = sections[sectionIndex]?.subsections[subsectionIndex];

    // If it's an existing subsection (in database), show confirmation
    if (subsectionToDelete?.id) {
      if (window.confirm('This subsection exists in the database. Do you want to delete it permanently?')) {
        // TODO: Call delete API for existing subsection
        console.log('Should delete existing subsection from database:', subsectionToDelete.id);
      } else {
        return; // User cancelled
      }
    }

    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.filter((_, subIdx) => subIdx !== subsectionIndex);
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sectionIndex, subsectionIndex, sections, setSections, onUpdate]);

  const addLesson = useCallback(() => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const newLesson = {
              title: `Lesson ${sub.lessons.length + 1}`,
              order: sub.lessons.length,
              content: '',
              video_url: '',
              duration_minutes: 0,
              is_preview: false,
              subsection: subsectionIndex,
              isExisting: false // Mark as NEW
            };
            return { ...sub, lessons: [...sub.lessons, newLesson] };
          }
          return sub;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sectionIndex, subsectionIndex, sections, setSections, onUpdate]);

  // Helper function to check if item exists in database
  const isExistingInDatabase = (item) => {
    return item.id && item.isExisting !== false;
  };

  return (
    <div className={`subsection-card ${isExistingInDatabase(subsection) ? 'existing-subsection' : 'new-subsection'}`}>
      <div className="subsection-header">
        <input
          type="text"
          value={subsection.title}
          onChange={(e) => updateSubsection('title', e.target.value)}
          className="subsection-title"
          placeholder="Subsection title"
        />
        <div className="subsection-status">
          {isExistingInDatabase(subsection) ? (
            <span className="status-badge existing">✓ In Database</span>
          ) : (
            <span className="status-badge new">+ New</span>
          )}
        </div>
        <button onClick={deleteSubsection} className="btn-danger">
          Delete
        </button>
      </div>

      <textarea
        value={subsection.description}
        onChange={(e) => updateSubsection('description', e.target.value)}
        className="subsection-description"
        placeholder="Subsection description"
        rows={2}
      />

      <div className="lessons">
        <div className="lesson-header">
          <h5>Lessons</h5>
          <button onClick={addLesson} className="btn-secondary">
            + Add Lesson
          </button>
        </div>

        {subsection.lessons.map((lesson, lessonIndex) => (
          <Lesson
            key={lesson.id || lessonIndex}
            lesson={lesson}
            sectionIndex={sectionIndex}
            subsectionIndex={subsectionIndex}
            lessonIndex={lessonIndex}
            sections={sections}
            setSections={setSections}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
});

// Lesson Component (updated to handle existing/new)
const Lesson = React.memo(({ lesson, sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate }) => {
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

  const deleteLesson = useCallback(() => {
    const lessonToDelete = sections[sectionIndex]?.subsections[subsectionIndex]?.lessons[lessonIndex];

    // If it's an existing lesson (in database), show confirmation
    if (lessonToDelete?.id) {
      if (window.confirm('This lesson exists in the database. Do you want to delete it permanently?')) {
        // TODO: Call delete API for existing lesson
        console.log('Should delete existing lesson from database:', lessonToDelete.id);
      } else {
        return; // User cancelled
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
                  isExisting: false // Mark as NEW
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
  }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate]);

  // Helper function to check if item exists in database
  const isExistingInDatabase = (item) => {
    return item.id && item.isExisting !== false;
  };

  return (
    <div className={`lesson-card ${isExistingInDatabase(lesson) ? 'existing-lesson' : 'new-lesson'}`}>
      <div className="lesson-header">
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => updateLesson('title', e.target.value)}
          className="lesson-title"
          placeholder="Lesson title"
        />
        <div className="lesson-status">
          {isExistingInDatabase(lesson) ? (
            <span className="status-badge existing">✓ In Database</span>
          ) : (
            <span className="status-badge new">+ New</span>
          )}
        </div>
        <button onClick={deleteLesson} className="btn-danger">
          Delete
        </button>
      </div>

      <div className="lesson-content">
        <textarea
          value={lesson.content}
          onChange={(e) => updateLesson('content', e.target.value)}
          placeholder="Lesson content (supports markdown)"
          rows={4}
        />

        <div className="lesson-meta">
          <input
            type="url"
            value={lesson.video_url}
            onChange={(e) => updateLesson('video_url', e.target.value)}
            placeholder="Video URL"
          />

          <input
            type="number"
            value={lesson.duration_minutes}
            onChange={(e) => updateLesson('duration_minutes', parseInt(e.target.value) || 0)}
            placeholder="Duration (minutes)"
            min="0"
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={lesson.is_preview}
              onChange={(e) => updateLesson('is_preview', e.target.checked)}
            />
            Preview lesson
          </label>
        </div>
      </div>

      {/* Lesson Resources */}
      <div className="lesson-resources">
        <div className="resources-header">
          <h6>Lesson Resources</h6>
          <button onClick={addResource} className="btn-secondary">
            + Add Resource
          </button>
        </div>

        {lesson.resources?.map((resource, resourceIndex) => (
          <LessonResource
            key={resource.id || resourceIndex}
            resource={resource}
            sectionIndex={sectionIndex}
            subsectionIndex={subsectionIndex}
            lessonIndex={lessonIndex}
            resourceIndex={resourceIndex}
            sections={sections}
            setSections={setSections}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
});

// Lesson Resource Component (updated to handle existing/new)
const LessonResource = React.memo(({ resource, sectionIndex, subsectionIndex, lessonIndex, resourceIndex, sections, setSections, onUpdate }) => {
  const updateResource = useCallback((field, value) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.map((les, lesIdx) => {
              if (lesIdx === lessonIndex) {
                const updatedResources = les.resources.map((res, resIdx) =>
                  resIdx === resourceIndex ? { ...res, [field]: value } : res
                );
                return { ...les, resources: updatedResources };
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
  }, [sectionIndex, subsectionIndex, lessonIndex, resourceIndex, sections, setSections, onUpdate]);

  const deleteResource = useCallback(() => {
    const resourceToDelete = sections[sectionIndex]?.subsections[subsectionIndex]?.lessons[lessonIndex]?.resources[resourceIndex];

    // If it's an existing resource (in database), show confirmation
    if (resourceToDelete?.id) {
      if (window.confirm('This resource exists in the database. Do you want to delete it permanently?')) {
        // TODO: Call delete API for existing resource
        console.log('Should delete existing resource from database:', resourceToDelete.id);
      } else {
        return; // User cancelled
      }
    }

    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.map((les, lesIdx) => {
              if (lesIdx === lessonIndex) {
                const updatedResources = les.resources.filter((_, resIdx) => resIdx !== resourceIndex);
                return { ...les, resources: updatedResources };
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
  }, [sectionIndex, subsectionIndex, lessonIndex, resourceIndex, sections, setSections, onUpdate]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      updateResource('file', file);
      updateResource('title', file.name);
    }
  }, [updateResource]);

  // Helper function to check if item exists in database
  const isExistingInDatabase = (item) => {
    return item.id && item.isExisting !== false;
  };

  return (
    <div className={`resource-card ${isExistingInDatabase(resource) ? 'existing-resource' : 'new-resource'}`}>
      <div className="resource-header">
        <input
          type="text"
          value={resource.title}
          onChange={(e) => updateResource('title', e.target.value)}
          placeholder="Resource title"
        />
        <select
          value={resource.resource_type}
          onChange={(e) => updateResource('resource_type', e.target.value)}
        >
          <option value="document">Document</option>
          <option value="presentation">Presentation</option>
          <option value="spreadsheet">Spreadsheet</option>
          <option value="image">Image</option>
          <option value="code">Code</option>
          <option value="link">External Link</option>
        </select>
        <div className="resource-status">
          {isExistingInDatabase(resource) ? (
            <span className="status-badge existing">✓ In Database</span>
          ) : (
            <span className="status-badge new">+ New</span>
          )}
        </div>
        <button onClick={deleteResource} className="btn-danger">
          Delete
        </button>
      </div>

      <input
        type="file"
        onChange={handleFileUpload}
        className="file-upload"
      />
    </div>
  );
});

export default CourseStructure;