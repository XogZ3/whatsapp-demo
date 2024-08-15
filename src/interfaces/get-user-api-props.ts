export interface UserVideo {
  videoId: string;
  templateId: string;
  voiceId: string;
  styleId: string;
  createdAt: string;
  previewUrl: string;
  state: string;
  locale: string;
  captionStyleId: string;
  thumbnail: string;
  musicId: string;
  videoUrl: string;
  transitionsIdList: string[];
  animationsIdList: string[];
  voice: {
    gender: string;
    id: number;
    locale: string;
    model_id: string;
    name: string;
    url: string;
    voice_id: string;
  };
  style: {
    id: string;
    locale: string;
    name: string;
    negative_prompt: string;
    prompt: string;
    url: string;
  };
  music: {
    id: string;
    locale: string;
    name: string;
    url: string;
  };
  caption: {
    id: string;
    locale: string;
    name: string;
    url: string;
  };
  transition: any[]; // Replace with specific type if needed
  animation: any[]; // Replace with specific type if needed
}

export interface UserVideos {
  success: boolean;
  payload: {
    videos: UserVideo[];
    offset: string; // ISO 8601 format date-time
  };
}

export const sampleUserVideos = {
  success: true,
  payload: {
    videos: [
      {
        videoId: 'ir1wz8a8q9',
        templateId: 'interestingfacts',
        voiceId: '30',
        styleId: 'sai-photographic',
        createdAt: '2024-07-18T06:32:56.212Z',
        previewUrl:
          'https://preview.videogptai.com/preview/IDsY9VWE6JMckxfjyYz43GLLt2s2/ir1wz8a8q9',
        state: 'EXPORTED',
        locale: 'en',
        captionStyleId: 'simple-red',
        thumbnail:
          'https://storage.videogptai.com/videogpt/data/images/9bzqenu38dw8th4beg5oog54sdh663fq.png',
        musicId: 'calm-1',
        videoUrl:
          'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/96zejzwp9v/out.mp4',
        transitionsIdList: ['slideDown'],
        animationsIdList: ['pan'],
        voice: {
          gender: 'male',
          id: 30,
          locale: 'en',
          model_id: 'en-US',
          name: 'James',
          url: 'https://storage.videogptai.com/videogpt/data/audio/vfkuf7gr2n0fhy79uqtruznw92m15xym.mp3',
          voice_id: 'en-US-Polyglot-1',
        },
        style: {
          id: 'sai-photographic',
          locale: 'en',
          name: 'Photographic',
          negative_prompt:
            'drawing, painting, crayon, sketch, graphite, impressionist, noisy, blurry, soft, deformed, ugly',
          prompt:
            'cinematic photo {prompt} . 35mm photograph, film, bokeh, professional, 4k, highly detailed',
          url: 'https://storage.videogptai.com/videogpt/assets/images/style-sai-photographic.webp',
        },
        music: {
          id: 'calm-1',
          locale: 'en',
          name: 'Calm',
          url: 'https://storage.googleapis.com/jetshorts/data/music/calm.m4a',
        },
        caption: {
          id: 'simple-red',
          locale: 'en',
          name: 'Simple Red',
          url: 'https://mathiasbynens.be/demo/animated-webp-supported.webp',
        },
        transition: [],
        animation: [],
      },
      {
        videoId: 'dbczwrwztf',
        templateId: 'interestingfacts',
        voiceId: '42',
        styleId: 'sai-3d-model',
        createdAt: '2024-07-18T05:32:52.930Z',
        previewUrl:
          'https://preview.videogptai.com/preview/IDsY9VWE6JMckxfjyYz43GLLt2s2/dbczwrwztf',
        state: 'EXPORTED',
        locale: 'en',
        captionStyleId: 'simple-dark',
        thumbnail:
          'https://storage.videogptai.com/videogpt/assets/images/thumbnail-dbczwrwztf.webp',
        musicId: 'calm-1',
        videoUrl:
          'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/k3w8tvaqec/out.mp4',
        transitionsIdList: ['zoomIn', 'fade'],
        animationsIdList: ['pan', 'zoom'],
        voice: {
          gender: 'female',
          id: 42,
          locale: 'en',
          model_id: 'en-US',
          name: 'Camila',
          url: 'https://storage.videogptai.com/videogpt/data/audio/zjdgc9t9ku2nvarbir4wvqol0uvatnn9.mp3',
          voice_id: 'en-US-Neural2-H',
        },
        style: {
          id: 'sai-3d-model',
          locale: 'en',
          name: '3D Model',
          negative_prompt: 'ugly, deformed, noisy, low poly, blurry, painting',
          prompt:
            'professional 3d model {prompt} . octane render, highly detailed, volumetric, dramatic lighting',
          url: 'https://storage.videogptai.com/videogpt/assets/images/style-sai-3d-model.webp',
        },
        music: {
          id: 'calm-1',
          locale: 'en',
          name: 'Calm',
          url: 'https://storage.googleapis.com/jetshorts/data/music/calm.m4a',
        },
        caption: {
          id: 'simple-dark',
          locale: 'en',
          name: 'Simple Dark',
          url: 'https://mathiasbynens.be/demo/animated-webp-supported.webp',
        },
        transition: [],
        animation: [],
      },
    ],
    offset: '2024-07-18T05:32:52.930Z',
  },
};
