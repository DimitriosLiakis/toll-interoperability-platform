const axios = require('axios');

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: { 'Authorization': `Bearer ${process.env.API_KEY}` },
});

async function fetchData(endpoint) {
    const response = await apiClient.get(`/${endpoint}`);
    return response.data;
}

async function postData(endpoint, data) {
    const response = await apiClient.post(`/${endpoint}`, data);
    return response.data;
}

// Similar structure for update and delete functions...

module.exports = { fetchData, postData };

