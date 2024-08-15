export interface TemplateResponse {
  id: string;
  locale: string;
  name: string;
  rank: number;
  require_input: boolean;
  // default style
  style: {
    id: string;
    name: string;
  };
  url: string;
  // default voice
  voice: {
    id: number;
    name: string;
  };
}

export interface GetTemplatesResponse {
  success: boolean;
  payload: {
    data: TemplateResponse[];
  };
}

export interface StyleResponse {
  id: string;
  locale: string;
  name: string;
  negative_prompt: string;
  prompt: string;
  url: string;
}

export interface GetStylesResponse {
  success: boolean;
  payload: {
    data: StyleResponse[];
  };
}

export interface VoiceResponse {
  gender: string;
  id: number;
  locale: string;
  model_id: string;
  name: string;
  url: string;
  voice_id: string;
}

export interface GetVoicesResponse {
  success: boolean;
  payload: {
    data: VoiceResponse[];
  };
}

export interface Caption {
  id: string;
  locale: string;
  name: string;
  rank: number;
  url: string;
}

export interface GetCaptionsResponse {
  success: boolean;
  payload: {
    data: Caption[];
  };
}

export interface Animation {
  id: string;
  locale: string;
  name: string;
  rank: number;
}

export interface GetAnimationsResponse {
  success: boolean;
  payload: {
    data: Animation[];
  };
}

export interface Transition {
  id: string;
  locale: string;
  name: string;
  rank: number;
}

export interface GetTransitionsResponse {
  success: boolean;
  payload: {
    data: Transition[];
  };
}

export interface Music {
  id: string;
  locale: string;
  name: string;
  previewUrl: string;
  rank: number;
  url: string;
}

export interface GetMusicListResponse {
  success: boolean;
  payload: {
    data: Music[];
  };
}

export interface GetVideoGptResponses {
  templatesData: GetTemplatesResponse;
  stylesData: GetStylesResponse;
  voicesData: GetVoicesResponse;
  captionsData: GetCaptionsResponse;
  transitionsData: GetTransitionsResponse;
  animationsData: GetAnimationsResponse;
  musicListData: GetMusicListResponse;
}
