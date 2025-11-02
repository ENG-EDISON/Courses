import apiClient from "../utils/Http";

export const getAllReviews=()=>apiClient.get('/api/review/');
export const getReviewByCourse=(courseId)=>apiClient.get(`api/review/${courseId}/`);
