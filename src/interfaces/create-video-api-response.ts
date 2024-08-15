export interface CreateVideoResponse {
  success: boolean;
  payload: {
    videoId: string;
    previewUrl: string;
    videoData: {
      videoId: string;
      templateId: string;
      voiceId: number;
      styleId: string;
      createdAt: string;
      previewUrl: string;
      state: string;
      locale: string;
      captionStyleId: string;
      musicId: string;
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
        previewUrl: string;
        rank: number;
        url: string;
      };
      caption: {
        id: string;
        locale: string;
        name: string;
        rank: number;
        url: string;
      };
      transition: string[];
      animation: string[];
    };
  };
}

export const sampleResponse = {
  success: true,
  payload: {
    videos: [
      {
        videoId: 'k1mb1modd0',
        templateId: 'philosophy',
        voiceId: 30,
        styleId: 'sai-analog-film',
        createdAt: '2024-08-14T19:05:09.985Z',
        previewUrl:
          'https://preview.videogptai.com/preview/IDsY9VWE6JMckxfjyYz43GLLt2s2/k1mb1modd0',
        state: 'CREATED',
        locale: 'en',
        captionStyleId: 'white-highlight',
        musicId: 'calm-1',
        transitionsIdList: ['fade'],
        animationsIdList: ['zoom', 'pan'],
        voice: {
          gender: 'male',
          id: 30,
          locale: 'en',
          model_id: 'en-US',
          name: 'James',
          rank: 5,
          url: 'https://storage.googleapis.com/jetshorts/data/voices/en-US-Polyglot-1.wav',
          voice_id: 'en-US-Polyglot-1',
        },
        style: {
          id: 'sai-analog-film',
          locale: 'en',
          name: 'Analog Film',
          negative_prompt:
            'painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured',
          prompt:
            'analog film photo {prompt} . faded film, desaturated, 35mm photo, grainy, vignette, vintage, Kodachrome, Lomography, stained, highly detailed, found footage',
          rank: 10,
          url: 'https://storage.videogptai.com/videogpt/assets/images/style-sai-analog-film.webp',
        },
        music: {
          id: 'calm-1',
          locale: 'en',
          name: 'Calm',
          previewUrl:
            'https://firebasestorage.googleapis.com/v0/b/videogptai-3bb74.appspot.com/o/videogpt%2Fdata%2Fmusic%2Fcalm_preview.mp3?alt=media&token=9d9c83d4-cd6e-426b-b1cc-7aa0f85b74ac',
          rank: 1,
          url: 'https://firebasestorage.googleapis.com/v0/b/videogptai-3bb74.appspot.com/o/videogpt%2Fdata%2Fmusic%2Fcalm_trimmed.mp3?alt=media&token=7c0b12c6-b20d-4396-bd7a-43504d5db302',
        },
        caption: {
          id: 'white-highlight',
          locale: 'en',
          name: 'White Highlight',
          rank: 1,
          url: 'https://firebasestorage.googleapis.com/v0/b/videogptai-3bb74.appspot.com/o/videogpt%2Fassets%2Fimages%2Fwhite-highlight.webp?alt=media&token=794dd9f3-2f99-418b-a9d6-e57663959925',
        },
        transition: [],
        animation: [],
      },
      {
        videoId: 'fqv53k2xi6',
        templateId: 'historyfacts',
        voiceId: '30',
        styleId: 'sai-origami',
        createdAt: '2024-08-14T18:47:42.914Z',
        previewUrl:
          'https://preview.videogptai.com/preview/IDsY9VWE6JMckxfjyYz43GLLt2s2/fqv53k2xi6',
        state: 'EXPORTED',
        locale: 'en',
        captionStyleId: 'white-highlight',
        thumbnail:
          'https://storage.videogptai.com/videogpt/assets/images/thumbnail-fqv53k2xi6.webp',
        musicId: 'calm-1',
        videoUrl:
          'https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-iqf7ddkm99/renders/mpa9jhpdex/out.mp4',
        transitionsIdList: ['fade'],
        animationsIdList: ['zoom', 'pan'],
        voice: {
          gender: 'male',
          id: 30,
          locale: 'en',
          model_id: 'en-US',
          name: 'James',
          rank: 5,
          url: 'https://storage.googleapis.com/jetshorts/data/voices/en-US-Polyglot-1.wav',
          voice_id: 'en-US-Polyglot-1',
        },
        style: {
          id: 'sai-origami',
          locale: 'en',
          name: 'Origami',
          negative_prompt:
            'noisy, sloppy, messy, grainy, highly detailed, ultra textured, photo',
          prompt:
            'origami style {prompt} . paper art, pleated paper, folded, origami art, pleats, cut and fold, centered composition',
          rank: 11,
          url: 'https://storage.videogptai.com/videogpt/assets/images/style-sai-origami.webp',
        },
        music: {
          id: 'calm-1',
          locale: 'en',
          name: 'Calm',
          previewUrl:
            'https://firebasestorage.googleapis.com/v0/b/videogptai-3bb74.appspot.com/o/videogpt%2Fdata%2Fmusic%2Fcalm_preview.mp3?alt=media&token=9d9c83d4-cd6e-426b-b1cc-7aa0f85b74ac',
          rank: 1,
          url: 'https://firebasestorage.googleapis.com/v0/b/videogptai-3bb74.appspot.com/o/videogpt%2Fdata%2Fmusic%2Fcalm_trimmed.mp3?alt=media&token=7c0b12c6-b20d-4396-bd7a-43504d5db302',
        },
        caption: {
          id: 'white-highlight',
          locale: 'en',
          name: 'White Highlight',
          rank: 1,
          url: 'https://firebasestorage.googleapis.com/v0/b/videogptai-3bb74.appspot.com/o/videogpt%2Fassets%2Fimages%2Fwhite-highlight.webp?alt=media&token=794dd9f3-2f99-418b-a9d6-e57663959925',
        },
        transition: [],
        animation: [],
      },
    ],
    offset: '2024-08-14T18:47:42.914Z',
  },
};
