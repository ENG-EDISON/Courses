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
  expandAll,
}) => {
  const loadingRef = useRef(false);

  // ✅ Keep latest versions of callbacks in refs so they don't trigger rerenders
  const expandAllRef = useRef(expandAll);
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    expandAllRef.current = expandAll;
    onUpdateRef.current = onUpdate;
  }, [expandAll, onUpdate]);

  useEffect(() => {
    const loadData = async () => {
      if (!courseId || loadingRef.current) return;

      loadingRef.current = true;
      setIsLoading(true);

      try {
        console.log("=== DEBUG: Loading course structure ===");

        // 1️⃣ Load all sections
        const sectionsResponse = await getCourseSections(courseId);
        const sectionsData = sectionsResponse.data;
        console.log("Sections loaded:", sectionsData);

        if (!sectionsData.length) {
          setSections([]);
          return;
        }

        // 2️⃣ Load all subsections
        const subsectionsResponse = await getSubsectionByCourseId(courseId);
        const allSubsections = subsectionsResponse.data.map(sub => ({
          ...sub,
          isExisting: true,
        }));
        console.log("All subsections loaded:", allSubsections);

        // 3️⃣ Load all lessons
        const allLessons = [];
        const lessonPromises = allSubsections.map(async (subsection) => {
          try {
            const lessonsResponse = await getLessonBySubsectionId(subsection.id);
            if (lessonsResponse?.data) {
              const subsectionLessons = lessonsResponse.data.map(lesson => ({
                ...lesson,
                isExisting: true,
                duration_minutes: lesson.video_duration
                  ? Math.round(lesson.video_duration / 60)
                  : 0,
              }));
              allLessons.push(...subsectionLessons);
            }
          } catch (error) {
            console.error(`Error loading lessons for subsection ${subsection.id}:`, error);
          }
        });

        await Promise.all(lessonPromises);
        console.log("All lessons loaded:", allLessons);

        // 4️⃣ Build structure
        const loadedSections = sectionsData.map(section => {
          const sectionSubsections = allSubsections.filter(
            sub => sub.section === section.id
          );

          const subsectionsWithLessons = sectionSubsections.map(subsection => {
            const subsectionLessons = allLessons.filter(
              lesson => lesson.subsection === subsection.id
            );
            return {
              ...subsection,
              lessons: subsectionLessons,
              isExisting: true,
            };
          });

          return {
            ...section,
            subsections: subsectionsWithLessons,
            isExisting: true,
          };
        });

        console.log("Final structure built:", loadedSections);
        setSections(loadedSections);

        // ✅ Only expand once per load
        setTimeout(() => {
          if (typeof expandAllRef.current === 'function') expandAllRef.current();
        }, 100);

        if (typeof onUpdateRef.current === 'function') {
          onUpdateRef.current(loadedSections);
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
  }, [courseId, setIsLoading, setSections]); // ✅ only trigger when courseId changes
};
