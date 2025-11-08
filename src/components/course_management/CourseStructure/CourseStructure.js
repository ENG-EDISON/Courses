import React, { useState, useEffect, useRef, useCallback } from 'react';
import './css/CourseStructure.css';
import {
  createsection,
  getCourseSections,
} from '../../../api/SectionApi';
import { getSubsectionByCourseId, createSubSection } from '../../../api/SubsectionApi';
import { getLessonBySubsectionId, createLesson } from '../../../api/LessonsApi';
import { createLessonResource } from '../../../api/LessonResourcesApis';

import Section from './Section';
import StructureHeader from './StructureHeader';

const CourseStructure = ({ course, onUpdate, onSave }) => {
  const [sections, setSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [expandedSubsections, setExpandedSubsections] = useState(new Set());
  const [expandedLessons, setExpandedLessons] = useState(new Set());

  const loadingRef = useRef(false);
  const courseId = course?.id;

  useEffect(() => {
    if (courseId && !loadingRef.current) {
      loadingRef.current = true;
      loadExistingStructure().finally(() => {
        loadingRef.current = false;
      });
    } else {
      setSections([]);
      setExpandedSections(new Set());
      setExpandedSubsections(new Set());
      setExpandedLessons(new Set());
    }
  }, [courseId]);

  // Collapse/Expand handlers
  const toggleSection = useCallback((sectionIndex) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
        // Also collapse all subsections and lessons within this section
        setExpandedSubsections(prevSubs => {
          const newSubsSet = new Set(prevSubs);
          sections[sectionIndex]?.subsections?.forEach((_, subIndex) => {
            const compositeKey = `${sectionIndex}-${subIndex}`;
            newSubsSet.delete(compositeKey);
          });
          return newSubsSet;
        });
        setExpandedLessons(prevLessons => {
          const newLessonsSet = new Set(prevLessons);
          sections[sectionIndex]?.subsections?.forEach((subsection, subIndex) => {
            subsection.lessons?.forEach((_, lessonIndex) => {
              const compositeKey = `${sectionIndex}-${subIndex}-${lessonIndex}`;
              newLessonsSet.delete(compositeKey);
            });
          });
          return newLessonsSet;
        });
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
    });
  }, [sections]);

  const toggleSubsection = useCallback((sectionIndex, subsectionIndex) => {
    const compositeKey = `${sectionIndex}-${subsectionIndex}`;
    setExpandedSubsections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(compositeKey)) {
        newSet.delete(compositeKey);
        // Also collapse all lessons within this subsection
        setExpandedLessons(prevLessons => {
          const newLessonsSet = new Set(prevLessons);
          sections[sectionIndex]?.subsections[subsectionIndex]?.lessons?.forEach((_, lessonIndex) => {
            const lessonCompositeKey = `${sectionIndex}-${subsectionIndex}-${lessonIndex}`;
            newLessonsSet.delete(lessonCompositeKey);
          });
          return newLessonsSet;
        });
      } else {
        newSet.add(compositeKey);
      }
      return newSet;
    });
  }, [sections]);

  const toggleLesson = useCallback((sectionIndex, subsectionIndex, lessonIndex) => {
    const compositeKey = `${sectionIndex}-${subsectionIndex}-${lessonIndex}`;
    setExpandedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(compositeKey)) {
        newSet.delete(compositeKey);
      } else {
        newSet.add(compositeKey);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allSectionIndices = new Set(sections.map((_, index) => index));
    setExpandedSections(allSectionIndices);
    
    const allSubsectionIndices = new Set();
    const allLessonIndices = new Set();
    
    sections.forEach((section, sectionIndex) => {
      section.subsections.forEach((subsection, subsectionIndex) => {
        const subsectionKey = `${sectionIndex}-${subsectionIndex}`;
        allSubsectionIndices.add(subsectionKey);
        
        subsection.lessons.forEach((_, lessonIndex) => {
          const lessonKey = `${sectionIndex}-${subsectionIndex}-${lessonIndex}`;
          allLessonIndices.add(lessonKey);
        });
      });
    });
    
    setExpandedSubsections(allSubsectionIndices);
    setExpandedLessons(allLessonIndices);
  }, [sections]);

  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
    setExpandedSubsections(new Set());
    setExpandedLessons(new Set());
  }, []);

  const isSectionExpanded = useCallback((sectionIndex) => {
    return expandedSections.has(sectionIndex);
  }, [expandedSections]);

  const isSubsectionExpanded = useCallback((sectionIndex, subsectionIndex) => {
    return expandedSubsections.has(`${sectionIndex}-${subsectionIndex}`);
  }, [expandedSubsections]);

  const isLessonExpanded = useCallback((sectionIndex, subsectionIndex, lessonIndex) => {
    return expandedLessons.has(`${sectionIndex}-${subsectionIndex}-${lessonIndex}`);
  }, [expandedLessons]);

  const loadExistingStructure = async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    try {
      console.log("=== DEBUG: Loading course structure ===");
      
      // 1. Get all sections for this course
      const sectionsResponse = await getCourseSections(courseId);
      const sectionsData = sectionsResponse.data;
      console.log("Sections loaded:", sectionsData);
      
      if (sectionsData.length === 0) {
        setSections([]);
        setExpandedSections(new Set());
        setExpandedSubsections(new Set());
        setExpandedLessons(new Set());
        return;
      }
      
      // 2. Get all subsections for each section
      const allSubsections = [];
      
      for (const section of sectionsData) {
        try {
          const subsectionsResponse = await getSubsectionByCourseId(courseId);
          // Filter subsections that belong to this specific section
          const sectionSubsections = subsectionsResponse.data.filter(sub => sub.section === section.id);
          console.log(`Section ${section.id} has ${sectionSubsections.length} subsections`);
          
          allSubsections.push(...sectionSubsections.map(sub => ({
            ...sub,
            isExisting: true
          })));
        } catch (error) {
          console.error(`Error loading subsections for section ${section.id}:`, error);
        }
      }
      console.log("All subsections loaded:", allSubsections);
      
      // 3. Get all lessons for each subsection
      const allLessons = [];
      
      for (const subsection of allSubsections) {
        try {
          console.log(`Loading lessons for subsection ${subsection.id}`);
          
          const lessonsResponse = await getLessonBySubsectionId(subsection.id);
          console.log(`API response for subsection ${subsection.id}:`, lessonsResponse);
          
          if (lessonsResponse && lessonsResponse.data) {
            const subsectionLessons = lessonsResponse.data.map(lesson => ({
              ...lesson,
              isExisting: true,
              duration_minutes: lesson.video_duration ? Math.round(lesson.video_duration / 60) : 0
            }));
            console.log(`Subsection ${subsection.id} has ${subsectionLessons.length} lessons:`, subsectionLessons);
            allLessons.push(...subsectionLessons);
          } else {
            console.log(`No lessons data found for subsection ${subsection.id}`);
          }
        } catch (error) {
          console.error(`Error loading lessons for subsection ${subsection.id}:`, error);
          console.error('Error details:', error.response || error.message);
        }
      }
      console.log("All lessons loaded:", allLessons);
      
      // 4. Build the nested structure correctly
      const loadedSections = sectionsData.map(section => {
        // Find subsections that belong to this section
        const sectionSubsections = allSubsections.filter(sub => sub.section === section.id);
        
        const subsectionsWithLessons = sectionSubsections.map(subsection => {
          // Find lessons that belong to this subsection
          const subsectionLessons = allLessons.filter(lesson => lesson.subsection === subsection.id);
          
          console.log(`Building subsection ${subsection.id} with ${subsectionLessons.length} lessons`);
          
          return {
            ...subsection,
            lessons: subsectionLessons,
            isExisting: true
          };
        });
        
        return {
          ...section,
          subsections: subsectionsWithLessons,
          isExisting: true
        };
      });
      
      console.log("Final structure built:", loadedSections);
      setSections(loadedSections);
      
      // Auto-expand all sections when loading existing structure
      setTimeout(() => {
        expandAll();
      }, 100);
      
      if (onUpdate) {
        onUpdate(loadedSections);
      }
      
    } catch (error) {
      console.error('Error loading course structure:', error);
      setSections([]);
      setExpandedSections(new Set());
      setExpandedSubsections(new Set());
      setExpandedLessons(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  const isExistingInDatabase = (item) => {
    return item.id && item.isExisting !== false;
  };

  const submitCourseStructure = async () => {
    if (!courseId) {
      alert('Course ID is required. Please select a course first.');
      return;
    }

    if (sections.length === 0) {
      alert('Please add at least one section');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log("=== DEBUG: STARTING COURSE STRUCTURE SUBMISSION ===");

      const createdSections = [];
      const createdSubsections = [];
      const createdLessons = [];
      const createdResources = [];

      for (const [sectionIndex, section] of sections.entries()) {
        let sectionId = section.id;

        if (!isExistingInDatabase(section)) {
          console.log(`\n=== DEBUG: Creating NEW Section ${sectionIndex + 1} ===`);
          const sectionData = {
            title: section.title,
            description: section.description,
            order: section.order || sectionIndex,
            course: courseId
          };

          const sectionResponse = await createsection(sectionData);
          sectionId = sectionResponse.data.id;
          createdSections.push(sectionResponse.data);
          console.log(`Created section with ID: ${sectionId}`);
        } else {
          console.log(`\n=== DEBUG: Using EXISTING Section ${sectionIndex + 1} (ID: ${sectionId}) ===`);
        }

        for (const [subsectionIndex, subsection] of section.subsections.entries()) {
          let subsectionId = subsection.id;

          if (!isExistingInDatabase(subsection)) {
            console.log(`\n=== DEBUG: Creating NEW Subsection ${subsectionIndex + 1} for Section ${sectionIndex + 1} ===`);
            const subsectionData = {
              title: subsection.title,
              description: subsection.description,
              order: subsectionIndex,
              section: sectionId
            };

            const subsectionResponse = await createSubSection(subsectionData);
            subsectionId = subsectionResponse.data.id;
            createdSubsections.push(subsectionResponse.data);
            console.log(`Created subsection with ID: ${subsectionId}`);
          } else {
            console.log(`\n=== DEBUG: Using EXISTING Subsection ${subsectionIndex + 1} (ID: ${subsectionId}) ===`);
          }

          for (const [lessonIndex, lesson] of subsection.lessons.entries()) {
            let lessonId = lesson.id;

            if (!isExistingInDatabase(lesson)) {
              console.log(`\n=== DEBUG: Creating NEW Lesson ${lessonIndex + 1} for Subsection ${subsectionIndex + 1} ===`);
              const lessonData = {
                title: lesson.title,
                content: lesson.content,
                video_url: lesson.video_url,
                video_duration: lesson.duration_minutes * 60,
                lesson_type: 'video',
                order: lessonIndex,
                is_preview: lesson.is_preview || false,
                subsection: subsectionId
              };

              const lessonResponse = await createLesson(lessonData);
              lessonId = lessonResponse.data.id;
              createdLessons.push(lessonResponse.data);
              console.log(`Created lesson with ID: ${lessonId}`);
            } else {
              console.log(`\n=== DEBUG: Using EXISTING Lesson ${lessonIndex + 1} (ID: ${lessonId}) ===`);
            }

            // Handle resource creation
            for (const [resourceIndex, resource] of (lesson.resources || []).entries()) {
              if (isExistingInDatabase(resource)) {
                console.log(`\n=== DEBUG: Using EXISTING Resource ${resourceIndex + 1} (ID: ${resource.id}) ===`);
                continue;
              }
              
              console.log(`\n=== DEBUG: Creating NEW Resource ${resourceIndex + 1} for Lesson ${lessonIndex + 1} ===`);
              
              if (resource.file) {
                console.log("Resource has file:", resource.file);
                const formData = new FormData();
                formData.append('file', resource.file);
                formData.append('title', resource.title);
                formData.append('resource_type', resource.resource_type || 'document');
                formData.append('order', resource.order !== undefined ? resource.order : resourceIndex);
                formData.append('lesson', lessonId);
                
                console.log("FormData entries:");
                for (let pair of formData.entries()) {
                  console.log(pair[0] + ': ', pair[1]);
                }
                
                try {
                  const resourceResponse = await createLessonResource(formData);
                  createdResources.push(resourceResponse.data);
                  console.log("File resource created successfully:", resourceResponse.data);
                } catch (error) {
                  console.error("Error creating resource:", error);
                  throw error;
                }
              } else if (resource.title) {
                console.log("Resource data (no file):", {
                  title: resource.title,
                  resource_type: resource.resource_type,
                  order: resource.order !== undefined ? resource.order : resourceIndex,
                  lesson: lessonId
                });
                
                const resourceResponse = await createLessonResource({
                  title: resource.title,
                  resource_type: resource.resource_type || 'document',
                  order: resource.order !== undefined ? resource.order : resourceIndex,
                  lesson: lessonId
                });
                createdResources.push(resourceResponse.data);
                console.log("Resource created successfully");
              } else {
                console.log("Skipping resource - no title provided");
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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('addSection called - checking conditions');

    if (!courseId) {
      alert('Please select a course first.');
      return;
    }

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
        isExisting: false
      };

      console.log('Creating NEW section:', newSection);

      const updatedSections = [...sections, newSection];
      setSections(updatedSections);
      
      // Auto-expand the newly created section
      setExpandedSections(prev => new Set([...prev, sections.length]));

      if (onUpdate) {
        onUpdate(updatedSections);
      }
    } finally {
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

    if (isExistingInDatabase(sectionToDelete)) {
      if (window.confirm('This section exists in the database. Do you want to delete it permanently?')) {
        console.log('Should delete existing section from database:', sectionToDelete.id);
      } else {
        return;
      }
    }

    const updatedSections = sections.filter((_, index) => index !== sectionIndex);
    setSections(updatedSections);
    
    // Remove from expanded sections
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(sectionIndex);
      return newSet;
    });
    
    onUpdate(updatedSections);
  }, [sections, onUpdate]);

  const getSectionCounts = () => {
    const existingSections = sections.filter(s => isExistingInDatabase(s)).length;
    const newSections = sections.filter(s => !isExistingInDatabase(s)).length;

    let existingSubsections = 0;
    let newSubsections = 0;
    let existingLessons = 0;
    let newLessons = 0;

    sections.forEach(section => {
      section.subsections.forEach(subsection => {
        if (isExistingInDatabase(subsection)) {
          existingSubsections++;
        } else {
          newSubsections++;
        }

        subsection.lessons.forEach(lesson => {
          if (isExistingInDatabase(lesson)) {
            existingLessons++;
          } else {
            newLessons++;
          }
        });
      });
    });

    return { 
      existingSections, 
      newSections, 
      existingSubsections, 
      newSubsections,
      existingLessons,
      newLessons
    };
  };

  const counts = getSectionCounts();

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
      <StructureHeader
        course={course}
        courseId={courseId}
        counts={counts}
        onAddSection={addSection}
        onSaveStructure={submitCourseStructure}
        isAddingSection={isAddingSection}
        isSubmitting={isSubmitting}
        sectionsCount={sections.length}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        hasSections={sections.length > 0}
      />

      {!courseId && (
        <div className="no-course-selected">
          <p>Please select a course to edit its structure.</p>
        </div>
      )}

      {isSubmitting && (
        <div className="submission-progress">
          Saving structure (only new items)... This may take a moment.
        </div>
      )}

      {courseId && (
        <div className="sections-list">
          {sections.map((section, sectionIndex) => (
            <Section
              key={section.id || sectionIndex}
              section={section}
              sectionIndex={sectionIndex}
              sections={sections}
              setSections={setSections}
              onUpdate={onUpdate}
              onUpdateSection={updateSection}
              onDeleteSection={deleteSection}
              isExistingInDatabase={isExistingInDatabase}
              isExpanded={isSectionExpanded(sectionIndex)}
              onToggleSection={() => toggleSection(sectionIndex)}
              onToggleSubsection={toggleSubsection}
              isSubsectionExpanded={isSubsectionExpanded}
              onToggleLesson={toggleLesson}
              isLessonExpanded={isLessonExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseStructure;