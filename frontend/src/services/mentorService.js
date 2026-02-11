import api from './api';

// Get all mentors with optional filters (category, skill)
const getAllMentors = async (filters = {}) => {
  try {
    // Construct query string  if filters exist
    const params = new URLSearchParams(filters).toString();
    const url = params ? `/mentors?${params}` : '/mentors';
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch mentors' };
  }
};

// Get a single mentor by ID
const getMentorById = async (id) => {
  try {
    const response = await api.get(`/mentors/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch mentor details' };
  }
};

// Register the current user as a mentor
const registerMentor = async (mentorData) => {
  try {
    const response = await api.post('/mentors/register', mentorData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to register as mentor' };
  }
};

// Send a connection request to a mentor
const connectWithMentor = async (mentorId, message) => {
  try {
    const response = await api.post(`/mentors/${mentorId}/connect`, { message });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to connect with mentor' };
  }
};

const mentorService = {
  getAllMentors,
  getMentorById,
  registerMentor,
  connectWithMentor,
};

export default mentorService;