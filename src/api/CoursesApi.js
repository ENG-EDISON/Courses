import apiClient from "../utils/Http";

export const getAllCourses = () => apiClient.get('/api/course/');
export const getAllCoursesCardView=()=>apiClient.get('api/courses/card-view/');
export const getAllPublishedCardView=()=>apiClient.get('/api/courses/card-view/?status=published');
export const getMyCoursesAsInstructor=()=>apiClient.get('/courses/my-courses/');
export const getCourseFullStructure = (id) => apiClient.get(`/api/courses/${id}/full-structure/`);
export const getCoursePreviewStructure = (id) => apiClient.get(`/api/courses/${id}/preview/`);
export const createCourse = (data) => {
//   console.log('Creating course with data:', data);
  return apiClient.post('/api/course/', data)
    .then(response => {
    //   console.log('Course created successfully:', response.data);
      return response;
    })
    .catch(error => {
    //   console.error('Error creating course:', error);
      throw error;
    });
};
export const deleteCourse = (id) => apiClient.delete(`/api/course/${id}/`);
export const getCoursebyId = (id) => apiClient.get(`/api/course/${id}/`); // ADDED trailing slash
export const updateCourse = (id, data) => {
  // console.log('Updating course with ID:', id, 'and data:', data);  // Log the data
  return apiClient.patch(`/api/course/${id}/`, data)
    .then(response => {
      // console.log('Course updated successfully:', response.data);  // Log the success response
      return response;
    })
    .catch(error => {
      console.error('Error updating course:', error);  // Log any errors
      throw error;
    });
};

export const getFeaturedCourses = () => apiClient.get('/api/courses/?is_featured=true'); // ADDED leading slash
export const getCoursesByCategory = (categorySlug) => apiClient.get('/api/course/', { params: { category_slug: categorySlug }});
export const searchCourses = (query) => apiClient.get(`/api/courses/?search=${query}`); // ADDED leading slash