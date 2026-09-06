import api from './api.js';

export const submitPeerReview = async (payload) => {
  const response = await api.post('/peer-reviews', payload);
  return response.data?.data;
};

export const getMyPeerReviews = async () => {
  const response = await api.get('/peer-reviews/me');
  return (
    response.data?.data ?? {
      average: 0,
      count: 0,
      reviews: [],
    }
  );
};

export const getPeerReviewTargets = async () => {
  const response = await api.get('/peer-reviews/targets');
  return response.data?.data ?? [];
};
