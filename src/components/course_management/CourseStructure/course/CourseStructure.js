// CourseStructure.jsx
import { useState,useCallback } from 'react';
import '../css/CourseStructure.css';
import Section from '../Section';
// import StructureHeader from './StructureHeader';
import LoadingState from './LoadingState';
import SubmissionProgress from './SubmissionProgress';
import NoCourseSelected from './NoCourseSelected';
import StructureHeader from '../StructureHeader';
import { useExpansionState } from './hooks/useExpansionState';
import { useCourseDataLoader } from './hooks/useCourseDataLoader';
import { useStructureSubmitter } from './hooks/useStructureSubmitter';

const CourseStructure = ({ course, onUpdate, onSave }) => {
  const [sections, setSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  
  const courseId = course?.id;

  // Custom hooks for different concerns
  const {
    setExpandedSections, // Add this line
    toggleSection,
    toggleSubsection,
    toggleLesson,
    isSectionExpanded,
    isSubsectionExpanded,
    isLessonExpanded,
    expandAll,
    collapseAll
  } = useExpansionState(sections);

  // Load course data
  useCourseDataLoader({
    courseId,
    onUpdate,
    setSections,
    setIsLoading,
    expandAll
  });

  // Submission handler
  const { submitCourseStructure } = useStructureSubmitter({
    courseId,
    sections,
    onSave,
    isSubmitting,
    setIsSubmitting
  });

  // Section management
  const addSection = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!courseId) {
      alert('Please select a course first.');
      return;
    }

    if (isAddingSection) return;

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

      const updatedSections = [...sections, newSection];
      setSections(updatedSections);

      setExpandedSections(prev => new Set([...prev, sections.length]));

      if (onUpdate) {
        onUpdate(updatedSections);
      }
    } finally {
      setTimeout(() => setIsAddingSection(false), 300);
    }
  }, [courseId, sections, isAddingSection, onUpdate, setExpandedSections]);

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
      if (!window.confirm('This section exists in the database. Do you want to delete it permanently?')) {
        return;
      }
    }

    const updatedSections = sections.filter((_, index) => index !== sectionIndex);
    setSections(updatedSections);

    setExpandedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(sectionIndex);
      return newSet;
    });

    onUpdate(updatedSections);
  }, [sections, onUpdate, setExpandedSections]);

  const isExistingInDatabase = (item) => {
    return item.id && item.isExisting !== false;
  };

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
    return <LoadingState />;
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

      {!courseId && <NoCourseSelected />}

      {isSubmitting && <SubmissionProgress />}

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