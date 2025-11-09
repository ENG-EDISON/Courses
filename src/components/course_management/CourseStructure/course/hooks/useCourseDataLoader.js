// hooks/useCourseDataLoader.js
import { useEffect, useRef } from 'react';
import { getCourseSections } from '../../../../../api/SectionApi';
import { getSubsectionByCourseId } from '../../../../../api/SubsectionApi';
import { getLessonBySubsectionId } from '../../../../../api/LessonsApi';

export const useCourseDataLoader = ({
  courseId,
  onUpdate,
  setSections,
  setIsLoading,
  expandAll
}) => {
  const loadingRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      if (!courseId || loadingRef.current) return;

      loadingRef.current = true;
      setIsLoading(true);
      try {
        console.log("=== DEBUG: Loading course structure ===");

        // 1. Get all sections for this course
        const sectionsResponse = await getCourseSections(courseId);
        const sectionsData = sectionsResponse.data;
        console.log("Sections loaded:", sectionsData);

        if (sectionsData.length === 0) {
          setSections([]);
          return;
        }

        // 2. Get all subsections for the course (single API call)
        const subsectionsResponse = await getSubsectionByCourseId(courseId);
        const allSubsections = subsectionsResponse.data.map(sub => ({
          ...sub,
          isExisting: true
        }));
        console.log("All subsections loaded:", allSubsections);

        // 3. Get all lessons for all subsections (single batch approach)
        const allLessons = [];
        const lessonPromises = allSubsections.map(async (subsection) => {
          try {
            console.log(`Loading lessons for subsection ${subsection.id}`);
            const lessonsResponse = await getLessonBySubsectionId(subsection.id);

            if (lessonsResponse && lessonsResponse.data) {
              const subsectionLessons = lessonsResponse.data.map(lesson => ({
                ...lesson,
                isExisting: true,
                duration_minutes: lesson.video_duration ? Math.round(lesson.video_duration / 60) : 0
              }));
              allLessons.push(...subsectionLessons);
            }
            console.log("lessonsResponse", lessonsResponse);
          } catch (error) {
            console.error(`Error loading lessons for subsection ${subsection.id}:`, error);
          }
        });

        await Promise.all(lessonPromises);
        console.log("All lessons loaded:", allLessons);

        // 4. Build the nested structure
        const loadedSections = sectionsData.map(section => {
          const sectionSubsections = allSubsections.filter(sub => sub.section === section.id);

          const subsectionsWithLessons = sectionSubsections.map(subsection => {
            const subsectionLessons = allLessons.filter(lesson => lesson.subsection === subsection.id);

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

        // Auto-expand all sections
        setTimeout(() => {
          expandAll();
        }, 100);

        if (onUpdate) {
          onUpdate(loadedSections);
        }

      } catch (error) {
        console.error('Error loading course structure:', error);
        setSections([]);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    loadData();
  }, [courseId]); // Remove all other dependencies to prevent infinite loops
};