import apiClient from "../utils/Http";

// ✅ WORKING - Keep these
export const getCourseLessonProgress = (courseId) => apiClient.get(`/api/lesson-progress/course/?course_id=${courseId}`);
export const getEnrollmentLessonProgress = (enrollmentId) => apiClient.get(`/api/lesson-progress/enrollment/?enrollment_id=${enrollmentId}`);
export const updateBulkLessonProgress = (courseId, progressData) => {
  const payload = {
    course_id: courseId,
    progress: progressData
  };
  console.log("Sending bulk update payload:", payload);
  return apiClient.put(`/api/lesson-progress/bulk-update/`, payload);
};

export const getCourseProgressSummary = (courseId) => apiClient.get(`/api/course-progress/summary/?course_id=${courseId}`);
export const trackLessonProgress = (lessonId, data) => {
  const payload = {
    lesson_id: lessonId,
    tracked_time: data.current_time, // ✅ Change from current_time to tracked_time
    completed: data.completed,
    progress_percentage: data.progress_percentage // Add this if needed
  };
  console.log('📡 Sending progress payload:', payload);
  return apiClient.post(`/api/lesson-progress/track/`, payload);
};

export const getLastPlayedLesson = (courseId) => apiClient.get(`/api/lesson-progress/last-played/?course_id=${courseId}`);
export const getUserEnrollment = (courseId) => apiClient.get(`/api/enrollments/user-enrollment/?course_id=${courseId}`);
