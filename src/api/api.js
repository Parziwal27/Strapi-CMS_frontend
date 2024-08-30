import axios from 'axios';

const API_URL =
  process.env.REACT_APP_STRAPI_API_URL ||
  'https://strapi-cms-backend-wtzq.onrender.com';

export const fetchUserStructure = async () => {
  try {
    console.log(
      'Attempting to fetch user structure from:',
      `${API_URL}/api/users-permissions/roles`
    );
    const response = await axios.get(`${API_URL}/api/users-permissions/roles`);
    console.log('Received response:', response.data);

    if (response.data && Array.isArray(response.data.roles)) {
      const authenticatedRole = response.data.roles.find(
        (role) => role.type === 'authenticated'
      );
      if (
        authenticatedRole &&
        authenticatedRole.permissions &&
        authenticatedRole.permissions.user
      ) {
        const userFields =
          authenticatedRole.permissions.user.controllers.user.find.fields;
        console.log('Successfully parsed user structure:', userFields);
        return userFields.reduce((acc, field) => {
          acc[field] = { type: field === 'email' ? 'email' : 'string' };
          return acc;
        }, {});
      }
    }

    console.error('Unexpected response structure:', response.data);
    throw new Error('Unexpected response structure from API');
  } catch (error) {
    console.error('Error in fetchUserStructure:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export const loginUser = async (identifier, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/local`, {
      identifier,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
