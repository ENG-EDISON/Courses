
import apiClient from "../utils/Http";

export const createLesson = (data) => {
  console.log('📤 [LESSON API] Creating lesson with data:', data);
  
  const hasFile = data.video_file instanceof File;
  
  if (hasFile) {
    const formData = new FormData();
    
    // Log each item being added to FormData
    console.log('📋 Adding to FormData:');
    
    for (const key in data) {
      const value = data[key];
      console.log(`  ${key}:`, value, `(type: ${typeof value})`);
      
      // Handle different data types properly
      if (value === null || value === undefined) {
        // Skip null/undefined
      } else if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'boolean') {
        formData.append(key, value.toString());
      } else if (typeof value === 'number') {
        formData.append(key, value.toString());
      } else if (typeof value === 'object') {
        // Handle nested objects (like arrays)
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
    
    // Debug: Log FormData contents
    console.log('📄 FormData entries:');
    for (const pair of formData.entries()) {
      console.log(`  ${pair[0]}: ${pair[1]}`);
    }
    
    return apiClient.post('api/lesson/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(response => {
      console.log('✅ [LESSON API] POST SUCCESS:', response.data);
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
    console.log('📤 Sending JSON data:', data);
    return apiClient.post('api/lesson/', data)
      .then(response => {
        console.log('✅ [LESSON API] POST SUCCESS:', response.data);
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
  console.log('Updating lesson with ID:', id, 'and data:', data); // Log ID and data before making request
  
  const hasFile = data.video_file instanceof File;
  if (hasFile) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    
    console.log('Uploading with FormData:', formData); // Log FormData being sent

    return apiClient.patch('/api/lesson/' + id + '/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(response => {
      console.log('Lesson updated successfully:', response.data);  // Log success response
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
    console.log('Sending data without video file:', data);  // Log data without the video file

    return apiClient.patch('/api/lesson/' + id + '/', data)
      .then(response => {
        console.log('Lesson updated successfully:', response.data);  // Log success response
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