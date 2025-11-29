import apiClient from "../utils/Http";

// ✅ WORKING - Keep these
export const getCourseLessonProgress = (courseId) => apiClient.get(`/api/lesson-progress/course/?course_id=${courseId}`);
export const getEnrollmentLessonProgress = (enrollmentId) => apiClient.get(`/api/lesson-progress/enrollment/?enrollment_id=${enrollmentId}`);
export const updateBulkLessonProgress = (courseId, progressData) => {
  const payload = {
    course_id: courseId,
    progress: progressData
  };
  return apiClient.put(`/api/lesson-progress/bulk-update/`, payload);
};

export const getCourseProgressSummary = (courseId) => apiClient.get(`/api/course-progress/summary/?course_id=${courseId}`);

// ✅ FIXED: Add validation and ensure lessonId is a number
export const trackLessonProgress = (lessonId, data) => {
  // Convert lessonId to number and validate
  const validatedLessonId = parseInt(lessonId);
  
  if (isNaN(validatedLessonId) || validatedLessonId <= 0) {
    console.error('❌ Invalid lessonId provided:', lessonId);
    return Promise.reject(new Error('Invalid lesson ID'));
  }

  const payload = {
    lesson_id: validatedLessonId, // Ensure it's a number
    tracked_time: data.current_time || 0,
    completed: Boolean(data.completed),
    progress_percentage: data.progress_percentage || 0
  };
  
  return apiClient.post(`/api/lesson-progress/track/`, payload);
};

export const getLastPlayedLesson = (courseId) => apiClient.get(`/api/lesson-progress/last-played/?course_id=${courseId}`);
export const getUserEnrollment = (courseId) => apiClient.get(`/api/enrollments/user-enrollment/?course_id=${courseId}`);