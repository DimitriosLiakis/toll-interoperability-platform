import { expect } from 'chai';
import nock from 'nock';
import { fetchData, postData, updateData, deleteData } from '../lib/api.js';

// Set up the mock URL
const API_BASE_URL = 'http://mock-api';

describe('CLI API Client', () => {
    beforeEach(() => {
        // Enable the mock API
        process.env.API_BASE_URL = API_BASE_URL;
    });

    afterEach(() => {
        nock.cleanAll(); // Clear all interceptors after each test
    });

    it('should fetch data from an endpoint', async () => {
        const endpoint = 'users';
        const mockData = [{ id: 1, name: 'Alice' }];

        nock(API_BASE_URL)
            .get(`/${endpoint}`)
            .reply(200, mockData);

        const data = await fetchData(endpoint);
        expect(data).to.deep.equal(mockData);
    });

    it('should post data to an endpoint', async () => {
        const endpoint = 'users';
        const newUser = { name: 'Bob', email: 'bob@example.com' };
        const mockResponse = { id: 2, ...newUser };

        nock(API_BASE_URL)
            .post(`/${endpoint}`, newUser)
            .reply(201, mockResponse);

        const response = await postData(endpoint, newUser);
        expect(response).to.deep.equal(mockResponse);
    });

    it('should update data at an endpoint', async () => {
        const endpoint = 'users';
        const id = 1;
        const updatedData = { email: 'alice_updated@example.com' };
        const mockResponse = { id, name: 'Alice', ...updatedData };

        nock(API_BASE_URL)
            .put(`/${endpoint}/${id}`, updatedData)
            .reply(200, mockResponse);

        const response = await updateData(endpoint, id, updatedData);
        expect(response).to.deep.equal(mockResponse);
    });

    it('should delete data at an endpoint', async () => {
        const endpoint = 'users';
        const id = 1;
        
        nock(API_BASE_URL)
            .delete(`/${endpoint}/${id}`)
            .reply(200, { success: true });

        const response = await deleteData(endpoint, id);
        expect(response).to.deep.equal({ success: true });
    });
});
