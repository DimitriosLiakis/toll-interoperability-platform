const axios = require('axios');

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL || 'http://mock-api',
    headers: { 'Authorization': `Bearer ${process.env.API_KEY || 'mock-api-key'}` },
});

async function fetchData(endpoint) {
    const response = await apiClient.get(`/${endpoint}`);
    return response.data;
}

async function postData(endpoint, data) {
    const response = await apiClient.post(`/${endpoint}`, data);
    return response.data;
}

async function updateData(endpoint, id, data) {
    const response = await apiClient.put(`/${endpoint}/${id}`, data);
    return response.data;
}

async function deleteData(endpoint, id) {
    const response = await apiClient.delete(`/${endpoint}/${id}`);
    return response.data;
}

module.exports = { fetchData, postData, updateData, deleteData };
