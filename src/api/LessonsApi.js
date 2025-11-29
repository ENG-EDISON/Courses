// // api/LessonApis.js - Example structure
// import apiClient from "../utils/Http";

// export const createLesson = (data) => {
//   const hasFile = data.video_file instanceof File;

//   if (hasFile) {
//     const formData = new FormData();
//     for (const key in data) {
//       formData.append(key, data[key]);
//     }

//     return apiClient.post('api/lesson/', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//   } else {
//     return apiClient.post('api/lesson/', data);
//   }
// };

// export const getLessons = (params = {}) => apiClient.get('/api/lesson/', { params });
// export const getLessonById = (id) => apiClient.get(`/api/lesson/${id}/`);
// export const updateLesson = (id, data) => {
//   const hasFile = data.video_file instanceof File;

//   if (hasFile) {
//     const formData = new FormData();
//     for (const key in data) {
//       formData.append(key, data[key]);
//     }

//     return apiClient.patch(`/api/lesson/${id}/`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//   } else {
//     return apiClient.patch(`/api/lesson/${id}/`, data);
//   }
// };

// export const deleteLesson = (id) => apiClient.delete(`/api/lesson/${id}/`);
// export const getLessonBySubsectionId=(id)=>apiClient.get(`api/lesson/?subsection=${id}`);
// api/LessonsApi.js - Updated with comprehensive logging
import apiClient from "../utils/Http";

export const createLesson = (data) => {
  const hasFile = data.video_file instanceof File;
  
  if (hasFile) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    
    return apiClient.post('api/lesson/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(response => {
      return response;
    }).catch(error => {
      console.error('❌ [LESSON API] POST ERROR:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });
  } else {
    return apiClient.post('api/lesson/', data)
      .then(response => {
        return response;
      })
      .catch(error => {
        console.error('❌ [LESSON API] POST ERROR:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  }
};

export const getLessons = (params = {}) => {  
  return apiClient.get('/api/lesson/', { params })
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error('❌ [LESSON API] GET ERROR:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });
};

export const getLessonById = (id) => {  
  return apiClient.get('/api/lesson/' + id + '/')
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error('❌ [LESSON API] GET BY ID ERROR:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });
};

export const updateLesson = (id, data) => {
  const hasFile = data.video_file instanceof File;
  if (hasFile) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    
    return apiClient.patch('/api/lesson/' + id + '/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(response => {
      return response;
    }).catch(error => {
      console.error('❌ [LESSON API] PATCH ERROR:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });
  } else {
    return apiClient.patch('/api/lesson/' + id + '/', data)
      .then(response => {
        return response;
      })
      .catch(error => {
        console.error('❌ [LESSON API] PATCH ERROR:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  }
};

export const deleteLesson = (id) => {  
  return apiClient.delete('/api/lesson/' + id + '/')
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error('❌ [LESSON API] DELETE ERROR:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });
};

export const getLessonBySubsectionId = (id) => {  
  return apiClient.get('api/lesson/?subsection=' + id)
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error('❌ [LESSON API] GET BY SUBSECTION ERROR:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });
};