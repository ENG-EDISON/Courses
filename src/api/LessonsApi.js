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
  
  // ✅ COMPREHENSIVE LOGGING FOR LESSON CREATION
  console.log('🚀 [LESSON API] POST /api/lesson/', {
    timestamp: new Date().toISOString(),
    hasFile: hasFile,
    payload: {
      ...data,
      // Handle file object for logging
      video_file: data.video_file ? `File: ${data.video_file.name} (${data.video_file.size} bytes)` : null
    },
    formData: hasFile ? 'Using multipart/form-data' : 'Using JSON',
    course: data.course,
    subsection: data.subsection
  });

  if (hasFile) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    
    // ✅ Log FormData contents (for debugging)
    console.log('📦 [LESSON API] FormData entries:');
    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
    }

    return apiClient.post('api/lesson/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(response => {
      console.log('✅ [LESSON API] POST SUCCESS:', {
        status: response.status,
        data: response.data,
        lessonId: response.data.id
      });
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
        console.log('✅ [LESSON API] POST SUCCESS:', {
          status: response.status,
          data: response.data,
          lessonId: response.data.id
        });
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
  console.log('📥 [LESSON API] GET /api/lesson/', {
    timestamp: new Date().toISOString(),
    params: params
  });
  
  return apiClient.get('/api/lesson/', { params })
    .then(response => {
      console.log('✅ [LESSON API] GET SUCCESS:', {
        status: response.status,
        count: response.data?.length || response.data?.results?.length,
        data: response.data
      });
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
  console.log('📥 [LESSON API] GET /api/lesson/' + id + '/', {
    timestamp: new Date().toISOString(),
    lessonId: id
  });
  
  return apiClient.get('/api/lesson/' + id + '/')
    .then(response => {
      console.log('✅ [LESSON API] GET BY ID SUCCESS:', {
        status: response.status,
        lessonId: response.data?.id,
        title: response.data?.title
      });
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

  // ✅ COMPREHENSIVE LOGGING FOR LESSON UPDATE
  console.log('🔄 [LESSON API] PATCH /api/lesson/' + id + '/', {
    timestamp: new Date().toISOString(),
    lessonId: id,
    hasFile: hasFile,
    payload: {
      ...data,
      // Handle file object for logging
      video_file: data.video_file ? `File: ${data.video_file.name} (${data.video_file.size} bytes)` : null
    },
    formData: hasFile ? 'Using multipart/form-data' : 'Using JSON',
    changedFields: Object.keys(data)
  });

  if (hasFile) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    
    // ✅ Log FormData contents (for debugging)
    console.log('📦 [LESSON API] FormData entries:');
    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
    }

    return apiClient.patch('/api/lesson/' + id + '/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(response => {
      console.log('✅ [LESSON API] PATCH SUCCESS:', {
        status: response.status,
        data: response.data,
        lessonId: response.data.id
      });
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
        console.log('✅ [LESSON API] PATCH SUCCESS:', {
          status: response.status,
          data: response.data,
          lessonId: response.data.id
        });
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
  console.log('🗑️ [LESSON API] DELETE /api/lesson/' + id + '/', {
    timestamp: new Date().toISOString(),
    lessonId: id
  });
  
  return apiClient.delete('/api/lesson/' + id + '/')
    .then(response => {
      console.log('✅ [LESSON API] DELETE SUCCESS:', {
        status: response.status,
        lessonId: id
      });
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
  console.log('📥 [LESSON API] GET /api/lesson/?subsection=' + id, {
    timestamp: new Date().toISOString(),
    subsectionId: id
  });
  
  return apiClient.get('api/lesson/?subsection=' + id)
    .then(response => {
      console.log('✅ [LESSON API] GET BY SUBSECTION SUCCESS:', {
        status: response.status,
        subsectionId: id,
        lessonsCount: response.data?.length || response.data?.results?.length
      });
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