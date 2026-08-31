import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '/api';
const API_URL = `${API_BASE_URL}/feedbacks`;

export interface FeedbackDto {
  id: string;
  userEmail: string;
  nickname: string;
  message: string;
  teaching: number;
  usability: number;
  easeOfUse: number;
  realLife: number;
  analysis: number;
  speed: number;
  detail: number;
  createdAt: string;
}

export interface CreateFeedbackDto {
  message: string;
  teaching: number;
  usability: number;
  easeOfUse: number;
  realLife: number;
  analysis: number;
  speed: number;
  detail: number;
}

export const getFeedbacks = async (token: string): Promise<FeedbackDto[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const submitFeedback = async (feedback: CreateFeedbackDto, token: string): Promise<void> => {
  await axios.post(API_URL, feedback, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
