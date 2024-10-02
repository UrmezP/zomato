import axios from 'axios';

const API_KEY = 'YOUR_YELP_API_KEY';
const API_BASE_URL = 'https://api.yelp.com/v3';

const yelpApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-type': 'application/json',
  },
});

export const searchBusinesses = async (term: string, location: string) => {
  try {
    const response = await yelpApi.get('/businesses/search', {
      params: { term, location, limit: 50 },
    });
    return response.data.businesses;
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
};

export const getBusinessDetails = async (id: string) => {
  try {
    const response = await yelpApi.get(`/businesses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching business details:', error);
    return null;
  }
};