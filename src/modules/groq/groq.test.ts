// /* eslint-disable no-await-in-loop */
// import { getCronDailyImagePromptFromGroq } from '.';

// const fs = require('fs');

// jest.setTimeout(18000000); // Increased timeout to 60 seconds as image generation and upload might take time

// const delay = (ms: number) =>
//   new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// const rateLimit = 500;

// describe('groqPrompt', () => {
//   it('should generate prompts based on locations input', async () => {
//     const locations = [
//       'Neuschwanstein Castle, Germany',
//       'Pyramids of Giza, Egypt',
//       'Sydney Opera House, Australia',
//       'Taj Mahal, India',
//       'Great Wall of China, Beijing',
//       'Santorini, Greece',
//       'Grand Canyon, USA',
//       'Machu Picchu, Peru',
//       'Mount Fuji, Japan',
//       'Venice Canals, Italy',
//       'Colosseum, Rome',
//       'Statue of Liberty, New York',
//       'Stonehenge, England',
//       'Petra, Jordan',
//       'Christ the Redeemer, Brazil',
//       'Banff National Park, Canada',
//       'Table Mountain, South Africa',
//       'Angkor Wat, Cambodia',
//       'Northern Lights, Norway',
//       'Halong Bay, Vietnam',
//       'Burj Khalifa, Dubai',
//       'Golden Gate Bridge, San Francisco',
//       'Bora Bora, French Polynesia',
//       'Plitvice Lakes, Croatia',
//       'Sagrada Familia, Barcelona',
//       // 'The Louvre, Paris',
//       // 'Blue Lagoon, Iceland',
//       // 'Mount Kilimanjaro, Tanzania',
//       // 'Great Barrier Reef, Australia',
//       // 'Alps Mountains, Switzerland',
//       // 'Chichen Itza, Mexico',
//       // 'Niagara Falls, Canada/USA',
//       // 'The Acropolis, Athens',
//       // 'Antelope Canyon, USA',
//       // 'The Dead Sea, Jordan/Israel',
//       // 'Big Ben, London',
//       // 'Dubai Desert, UAE',
//       // 'Uluru, Australia',
//       // 'The Maldives',
//       // 'Galapagos Islands, Ecuador',
//       // 'Cinque Terre, Italy',
//       // 'Lake Bled, Slovenia',
//       // 'Zhangjiajie National Forest Park, China',
//       // 'Kyoto Temples, Japan',
//       // 'Iguazu Falls, Argentina/Brazil',
//       // 'Twelve Apostles, Australia',
//       // 'Fiordland National Park, New Zealand',
//       // 'Mount Everest, Nepal',
//       // 'Victoria Falls, Zambia/Zimbabwe',
//       // 'Hagia Sophia, Istanbul',
//       // 'Salar de Uyuni, Bolivia',
//       // 'Moroccan Sahara Desert, Morocco',
//       // 'Prague Castle, Czech Republic',
//       // 'Bali Rice Terraces, Indonesia',
//       // 'Wulingyuan Scenic Area, China',
//       // 'Bavarian Alps, Germany',
//       // 'Old Havana, Cuba',
//       // 'Lake Louise, Canada',
//       // 'Bruges Canals, Belgium',
//     ];

//     const prompts: string[] = [];

//     const filePath = './prompts.txt';
//     fs.writeFileSync(filePath, ''); // Empty the file

//     for (const location of locations) {
//       // Call the function for each location with rate-limiting
//       const prompt = await getCronDailyImagePromptFromGroq({ location });
//       console.log('prompt: ', prompt);
//       prompts.push(prompt);

//       // Save each prompt to the text file (append mode)
//       // fs.appendFileSync(filePath, `${prompt}\n`);
//       fs.appendFileSync(
//         filePath,
//         `Location:\n${location}\nPrompt:\n${prompt}\n`,
//       );

//       // Wait for the rate limit delay before proceeding to the next iteration
//       await delay(rateLimit);
//     }

//     // Ensure the result is an array
//     expect(Array.isArray(prompts)).toBe(true);

//     // Check if the number of prompts matches the locations
//     expect(prompts.length).toBe(locations.length);
//   });
// });
