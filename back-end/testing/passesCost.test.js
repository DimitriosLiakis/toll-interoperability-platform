const request = require('supertest');
const app = require('../app'); // Import your Express app
jest.mock('../dbService.js'); // Mock the dbService

const mockDbService = require('../dbService.js');



describe('GET /api/passesCost/:tollOpID/:tagOpID/:date_from/:date_to', () => {
    it('should return 400 if required parameters are missing', async () => {
        const response = await request(app).get('/api/passesCost/');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required parameters.');
    });
    
    it('should return 400 if date format is invalid', async () => {
        const mockGetPassesBetween2companies = jest.fn();

        mockDbService.getDbServiceInstance = jest.fn(() => ({
            getPassesBetween2companies: mockGetPassesBetween2companies,
        }));
        const response = await request(app).get('/api/passesCost/AM/NAO/2022-01-01/2022-01-31');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid date format. Use YYYYMMDD.');
    });

    it('should return 204 if no data is available for the given range', async () => {
        const mockGetPassesBetween2companies = jest.fn();

        mockDbService.getDbServiceInstance = jest.fn(() => ({
            getPassesBetween2companies: mockGetPassesBetween2companies,
        }));
        mockGetPassesBetween2companies.mockResolvedValue({ nPasses: 0, passesCost: 0 });

        const response = await request(app).get('/api/passesCost/AM/NAO/20220101/20220131');
        expect(response.status).toBe(204); // No Content
        expect(response.text).toBe('');
    });

    it('should return 200 with valid JSON data when data is available', async () => {
        const mockGetPassesBetween2companies = jest.fn();

        mockDbService.getDbServiceInstance = jest.fn(() => ({
            getPassesBetween2companies: mockGetPassesBetween2companies,
        }));
        mockGetPassesBetween2companies.mockResolvedValue({ nPasses: 10, passesCost: 50 });

        const response = await request(app).get('/api/passesCost/AM/NAO/20220101/20220131');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('tollOpID');
        expect(response.body).toHaveProperty('tagOpID');
        expect(response.body).toHaveProperty('requestTimestamp');
        expect(response.body).toHaveProperty('periodFrom');
        expect(response.body).toHaveProperty('periodTo');
        expect(response.body).toHaveProperty('nPasses');
        expect(response.body).toHaveProperty('passesCost');
    });

    it('should return CSV data if format=csv is specified', async () => {    
        const response = await request(app).get('/api/passesCost/AM/NAO/20220101/20220131?format=csv');
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
        expect(response.headers['content-disposition']).toContain('attachment;');
        
        // Verify the CSV format in the response (adjust based on your actual DB query)
        expect(response.text).toContain('"tollOpID","tagOpID","requestTimestamp","periodFrom","periodTo","nPasses","passesCost"');
    });
    
    

      
    //   it('should return 500 on internal server error due to DB failure', async () => {
    //                 // Assuming dbService.js exports a class:
    //         jest.mock('../dbService.js', () => {
    //             return jest.fn().mockImplementation(() => {
    //             return {
    //                 getPassesBetween2companies: jest.fn(),
    //             };
    //             });
    //         });
  
    //       // Mock the database call to simulate an error
    //       const dbService = require('../dbService.js');
    //       dbService.getPassesBetween2companies.mockRejectedValue(new Error('Database error'));
      
    //       const response = await request(app).get('/api/passesCost/AM/NAO/20220101/20220131');
      
    //       // Assertions
    //       expect(response.status).toBe(500);  // Expect 500 status for internal error
    //       expect(response.body.error).toBe('Internal server error');  // Expect error message
      
    //       // Ensure the mock was called with correct parameters
    //       expect(dbService.getPassesBetween2companies).toHaveBeenCalledTimes(1);
    //       expect(dbService.getPassesBetween2companies).toHaveBeenCalledWith('AM', 'NAO', '20220101', '20220131');
    //   });
    
});
