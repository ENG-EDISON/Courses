// CourseStructure.jsx
import { useState, useCallback } from 'react';
import '../css/CourseStructure.css';
import Section from '../Section';
import LoadingState from './LoadingState';
import SubmissionProgress from './SubmissionProgress';
import NoCourseSelected from './NoCourseSelected';
import StructureHeader from '../StructureHeader';
import { useExpansionState } from './hooks/useExpansionState';
import { useCourseDataLoader } from './hooks/useCourseDataLoader';
import { useStructureSubmitter } from './hooks/useStructureSubmitter';
import { deleteSection as deleteSectionApi} from '../../../../api/SectionApi';
const CourseStructure = ({ course, onUpdate, onSave }) => {
  const [sections, setSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const courseId = course?.id;

  // Custom hooks for different concerns
  const {
    setExpandedSections,
    toggleSection,
    toggleSubsection,
    toggleLesson,
    isSectionExpanded,
    isSubsectionExpanded,
    isLessonExpanded,
    expandAll,
    collapseAll
  } = useExpansionState(sections);

  // ✅ MOVE isExistingInDatabase BEFORE useCallback hooks that use it
  const isExistingInDatabase = useCallback((item) => {
    return item.id && item.isExisting !== false;
  }, []);

  // Load course data
  useCourseDataLoader({
    courseId,
    onUpdate,
    setSections,
    setIsLoading,
    expandAll,
    refreshTrigger
  });

  // Submission handler
  const { submitCourseStructure } = useStructureSubmitter({
    courseId,
    sections,
    onSave,
    isSubmitting,
    setIsSubmitting,
    onSuccess: () => setRefreshTrigger(prev => prev + 1)
  });

  // SECTION API CALLBACKS
  const handleSectionCreate = useCallback((newSectionData, sectionIndex) => {
    const updatedSections = sections.map((section, index) => {
      if (index === sectionIndex) {
        return { 
          ...newSectionData, 
          isExisting: true,
          subsections: section.subsections || []
        };
      }
      return section;
    });
    
    setSections(updatedSections);
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sections, onUpdate]);

  const handleSectionUpdate = useCallback((sectionId, updatedData) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId ? { 
        ...updatedData, 
        isExisting: true,
        subsections: section.subsections || []
      } : section
    );
    
    setSections(updatedSections);
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sections, onUpdate]);

  const handleSectionDelete = useCallback((sectionId, sectionIndex) => {
    const updatedSections = sections.filter((_, index) => index !== sectionIndex);
    setSections(updatedSections);
    
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(sectionIndex);
      return newSet;
    });

    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sections, onUpdate, setExpandedSections]);

  // SUBSECTION API CALLBACKS
  const handleSubsectionCreate = useCallback((newSubsectionData, sectionIndex, subsectionIndex) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((subsection, subIndex) => {
          if (subIndex === subsectionIndex) {
            return { 
              ...newSubsectionData, 
              isExisting: true,
              lessons: subsection.lessons || []
            };
          }
          return subsection;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    
    setSections(updatedSections);
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sections, onUpdate]);

  const handleSubsectionUpdate = useCallback((subsectionId, updatedData) => {
    const updatedSections = sections.map(section => ({
      ...section,
      subsections: section.subsections.map(subsection => 
        subsection.id === subsectionId ? { 
          ...updatedData, 
          isExisting: true,
          lessons: subsection.lessons || []
        } : subsection
      )
    }));
    
    setSections(updatedSections);
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sections, onUpdate]);

  const handleSubsectionDelete = useCallback((subsectionId, sectionIndex, subsectionIndex) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.filter((_, subIndex) => subIndex !== subsectionIndex);
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    
    setSections(updatedSections);
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sections, onUpdate]);

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
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sections, onUpdate]);

  // ✅ FIXED: Now isExistingInDatabase is defined before this useCallback
  const deleteSection = useCallback(async (sectionIndex) => {
    const sectionToDelete = sections[sectionIndex];

    if (isExistingInDatabase(sectionToDelete)) {
      if (!window.confirm('This section exists in the database. Do you want to delete it permanently? This will also delete all subsections and lessons within it.')) {
        return;
      }

      try {
        setIsSubmitting(true);
        await deleteSectionApi(sectionToDelete.id);
        
        // Remove from local state after successful API deletion
        handleSectionDelete(sectionToDelete.id, sectionIndex);
        
        alert('Section deleted successfully!');
      } catch (error) {
        console.error('Error deleting section:', error);
        alert('Error deleting section. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Local deletion for new sections
      handleSectionDelete(null, sectionIndex);
    }
  }, [sections, isExistingInDatabase, handleSectionDelete, setIsSubmitting]);

  // Get section ID from section object
  const getSectionId = useCallback((section) => {
    return section?.id || null;
  }, []);

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
              course={course}
              sectionId={getSectionId(section)}
              onSectionCreate={handleSectionCreate}
              onSectionUpdate={handleSectionUpdate}
              onSectionDelete={handleSectionDelete}
              onSubsectionCreate={handleSubsectionCreate}
              onSubsectionUpdate={handleSubsectionUpdate}
              onSubsectionDelete={handleSubsectionDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseStructure;