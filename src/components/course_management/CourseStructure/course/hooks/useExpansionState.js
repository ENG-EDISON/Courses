// hooks/useExpansionState.js
import { useState, useCallback } from 'react';

export const useExpansionState = (sections) => {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [expandedSubsections, setExpandedSubsections] = useState(new Set());
  const [expandedLessons, setExpandedLessons] = useState(new Set());

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

  const toggleSection = useCallback((sectionIndex) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
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

  const isSectionExpanded = useCallback((sectionIndex) => {
    return expandedSections.has(sectionIndex);
  }, [expandedSections]);

  const isSubsectionExpanded = useCallback((sectionIndex, subsectionIndex) => {
    return expandedSubsections.has(`${sectionIndex}-${subsectionIndex}`);
  }, [expandedSubsections]);

  const isLessonExpanded = useCallback((sectionIndex, subsectionIndex, lessonIndex) => {
    return expandedLessons.has(`${sectionIndex}-${subsectionIndex}-${lessonIndex}`);
  }, [expandedLessons]);

  return {
    expandedSections,
    expandedSubsections,
    expandedLessons,
    setExpandedSections, // Make sure this is exported
    setExpandedSubsections,
    setExpandedLessons,
    toggleSection,
    toggleSubsection,
    toggleLesson,
    isSectionExpanded,
    isSubsectionExpanded,
    isLessonExpanded,
    expandAll,
    collapseAll
  };
};