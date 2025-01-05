const request = require('supertest');
const app = require('../app'); 

describe('PUT /api/passing_toll - Header Tests', () => {
    it('should return CSV headers when format=csv is specified', async () => {
        const response = await request(app).put('/api/passing_toll?format=csv');
        expect(response.status).toBe(200); 
    });

    it('should return CSV headers when format=csv is specified', async () => {
        const response = await request(app).put('/api/passing_toll').query({ format: 'invalid' });

        expect(response.status).toBe(400); 

    });
    it('should return empty headers for 204 No Content', async () => {
        const response = await request(app).put('/api/passing_toll');

        expect(response.status).toBe(204);

    });

    it('should return JSON headers for 500 Internal Server Error', async () => {
        
        jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress error logs in test output
        const dbServiceMock = jest.spyOn(require('../dbService.js').prototype, 'getLastPassageId')
            .mockRejectedValue(new Error('Database Error'));

        const response = await request(app).put('/api/passing_toll');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Database Error');

        dbServiceMock.mockRestore();
    });
    
});
