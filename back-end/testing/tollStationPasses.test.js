const request = require('supertest');
const app = require('../app'); // Import your Express app

describe('GET /api/tollStationPasses/:tollStationID/:date_from/:date_to', () => {
    it('should return 400 if required parameters are missing', async () => {
        const response = await request(app).get('/api/tollStationPasses/');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required parameters: tollStationID, date_from, date_to');
    });

    it('should return 400 if date format is invalid', async () => {
        const response = await request(app).get('/api/tollStationPasses/NO03/20231301/123');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid date format. Expected YYYYMMDD.');
    });

    it('should return 204 if no data is available for the given range', async () => {
        const response = await request(app).get('/api/tollStationPasses/NO03/20240101/20240101');
        expect(response.status).toBe(204); // No Content
    });

    it('should return 200 with valid JSON data when data is available', async () => {
        const response = await request(app).get('/api/tollStationPasses/NO03/20220101/20220103');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('stationID', 'NO03');
        expect(response.body).toHaveProperty('stationOperator');
        expect(response.body).toHaveProperty('requestTimestamp');
        expect(response.body).toHaveProperty('periodFrom', '2022-01-01');
        expect(response.body).toHaveProperty('periodTo', '2022-01-03');
        expect(response.body).toHaveProperty('nPasses');
        expect(response.body).toHaveProperty('passList');
        expect(Array.isArray(response.body.passList)).toBe(true);
    });

    it('should return CSV data if format=csv is specified', async () => {
        const response = await request(app).get('/api/tollStationPasses/NO03/20220101/20220103?format=csv');
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
        expect(response.headers['content-disposition']).toContain('attachment;');
        expect(response.text).toContain('"passIndex","passID","timestamp","tagID","tagProvider","passType","passCharge"');
    });

    it('should return 500 on internal server error', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress error logs in test output
        const dbServiceMock = jest.spyOn(require('../dbService.js').prototype, 'getRecordsBetweenDate')
            .mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/api/tollStationPasses/1234/20220101/20220131');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');

        dbServiceMock.mockRestore();
    });
});
