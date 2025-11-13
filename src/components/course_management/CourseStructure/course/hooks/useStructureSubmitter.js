// hooks/useStructureSubmitter.js
import { useCallback } from 'react';
import { createLessonResource } from '../../../../../api/LessonResourcesApis';
import { createSection } from '../../../../../api/SectionApi';
import { createSubSection } from '../../../../../api/SubsectionApi';
import { createLesson } from '../../../../../api/LessonsApi';

export const useStructureSubmitter = ({
  courseId,
  sections,
  onSave,
  isSubmitting,
  setIsSubmitting,
  onSuccess // ✅ Added this new prop
}) => {
  const isExistingInDatabase = (item) => {
    return item.id && item.isExisting !== false;
  };

  const submitCourseStructure = useCallback(async () => {
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

          const sectionResponse = await createSection(sectionData);
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
              
              // Check if lesson has a video file to upload
              if (lesson.video_file) {
                console.log("📁 Lesson has video file, using FormData");
                // Use FormData for file upload
                const formData = new FormData();
                formData.append('title', lesson.title);
                formData.append('content', lesson.content || '');
                formData.append('video_url', lesson.video_url || '');
                formData.append('video_duration', (lesson.duration_minutes || 0) * 60);
                formData.append('lesson_type', lesson.lesson_type || 'video');
                formData.append('order', lessonIndex);
                formData.append('is_preview', lesson.is_preview || false);
                formData.append('subsection', subsectionId);
                formData.append('video_file', lesson.video_file);

                console.log("FormData contents:");
                for (let pair of formData.entries()) {
                  console.log(pair[0] + ': ', pair[1]);
                }

                const lessonResponse = await createLesson(formData);
                lessonId = lessonResponse.data.id;
                createdLessons.push(lessonResponse.data);
                console.log(`Created lesson with video file, ID: ${lessonId}`);
              } else {
                console.log("📝 Lesson has no video file, using JSON");
                // Use regular JSON for lessons without files
                const lessonData = {
                  title: lesson.title,
                  content: lesson.content || '',
                  video_url: lesson.video_url || '',
                  video_duration: (lesson.duration_minutes || 0) * 60,
                  lesson_type: lesson.lesson_type || 'video',
                  order: lessonIndex,
                  is_preview: lesson.is_preview || false,
                  subsection: subsectionId
                };

                const lessonResponse = await createLesson(lessonData);
                lessonId = lessonResponse.data.id;
                createdLessons.push(lessonResponse.data);
                console.log(`Created lesson with ID: ${lessonId}`);
              }
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

                try {
                  const resourceResponse = await createLessonResource(formData);
                  createdResources.push(resourceResponse.data);
                  console.log("File resource created successfully:", resourceResponse.data);
                } catch (error) {
                  console.error("Error creating resource:", error);
                  throw error;
                }
              } else if (resource.title) {
                const resourceResponse = await createLessonResource({
                  title: resource.title,
                  resource_type: resource.resource_type || 'document',
                  order: resource.order !== undefined ? resource.order : resourceIndex,
                  lesson: lessonId
                });
                createdResources.push(resourceResponse.data);
                console.log("Resource created successfully");
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

      // ✅ Call success callback instead of reloading the page
      if (onSuccess) {
        onSuccess();
      }

      // ❌ REMOVED: window.location.reload();

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
  }, [courseId, sections, onSave, isSubmitting, setIsSubmitting, onSuccess]); // ✅ Added onSuccess to dependencies

  return { submitCourseStructure };
};