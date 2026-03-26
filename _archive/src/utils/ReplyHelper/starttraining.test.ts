// import { callTrainingAPI } from './FirebaseHelpers';
// // eslint-disable-next-line import/no-extraneous-dependencies
// require('dotenv').config({
//   path: '.env',
// });

// jest.setTimeout(60000);

// describe('start training', () => {
//   it('should call api /api/starttraining, and return response', async () => {
//     const imageURLs = [
//       'https://example.com/image1.jpg',
//       'https://example.com/image2.jpg',
//     ];
//     const clientid = '911234567890';

//     const response = await callTrainingAPI(clientid, imageURLs);

//     expect(response).toHaveProperty('jobId');
//     expect(response.jobId).toBeDefined();
//     expect(response).toHaveProperty('status', 'IN_QUEUE');
//   });
// });
