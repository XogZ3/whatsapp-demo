// import * as fal from '@fal-ai/serverless-client';

// const FAL_KEY =
//   '24fd3064-6302-4a76-8fb2-af064219c515:529b79ca0fefbdd78a22abec02c1eb32';

// fal.config({
//   credentials: FAL_KEY,
// });

// jest.setTimeout(60000);

// describe('falAPI tests', () => {
//   describe('get job status', () => {
//     it('should track progress and capture when it crosses 50%', async () => {
//       try {
//         const status = await fal.queue.status(
//           'fal-ai/flux-lora-fast-training',
//           {
//             requestId: '5bdf7729-ec4b-46db-b919-8bf8ab40c817',
//             logs: true, // This assumes you are requesting logs
//           },
//         );

//         console.log(`Tracking progress...`);

//         // Ensure that status is either 'IN_PROGRESS' or 'COMPLETED' before accessing logs
//         if (status.status === 'IN_PROGRESS' || status.status === 'COMPLETED') {
//           const { logs } = status;
//           let crossed50 = false;

//           logs.forEach((log: any) => {
//             const { message } = log;

//             // Look for progress pattern in message (e.g., 99%|█████████▉| 99/100)
//             const progressMatch = message.match(/(\d{1,3})%\|/);

//             if (progressMatch) {
//               const progress = parseInt(progressMatch[1], 10);
//               console.log(`Progress: ${progress}%`);

//               if (progress > 50 && !crossed50) {
//                 console.log('Progress has crossed 50%!');
//                 crossed50 = true;
//               }
//             }
//           });

//           // eslint-disable-next-line jest/no-conditional-expect
//           expect(crossed50).toBe(true); // Expect the job to have crossed 50%
//         } else if (status.status === 'IN_QUEUE') {
//           console.log(
//             `Job is still in queue. Queue position: ${status.queue_position}`,
//           );
//         }
//       } catch (error) {
//         console.log(`Error occurred`);
//         console.log(JSON.stringify(error, null, 2));
//       }
//     });
//   });
// });
