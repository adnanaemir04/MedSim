import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || (typeof window !== 'undefined' ? `http://${window.location.hostname}:5211/api` : 'http://localhost:5211/api');
const API_URL = `${API_BASE_URL}/analytics`;

export interface KpiData {
  totalUsers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  totalSolvedQuestions: number;
  dailySolvedQuestions: number;
  averageAccuracy: number;
  totalQuestions: number;
  geminiQuestionCount: number;
  classicQuestionCount: number;
  averageSolveTimeSeconds: number;
  averageQuestionsPerUser: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondaryValue: number;
  percentage: number;
}

export interface SubjectRankingData {
  subjectName: string;
  totalSolved: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  averageSolveTimeSeconds: number;
}

export interface GeminiVsClassicData {
  classicSolvedCount: number;
  classicAccuracy: number;
  classicAvgTime: number;
  geminiSolvedCount: number;
  geminiAccuracy: number;
  geminiAvgTime: number;
}

export const analyticsApi = {
  getKpis: async (days: number = 30): Promise<KpiData> => {
    const response = await axios.get(`${API_URL}/kpi?days=${days}`);
    return response.data;
  },
  
  getUserGrowth: async (days: number = 30): Promise<ChartDataPoint[]> => {
    const response = await axios.get(`${API_URL}/users/growth?days=${days}`);
    return response.data;
  },

  getSubjectRankings: async (): Promise<SubjectRankingData[]> => {
    const response = await axios.get(`${API_URL}/subjects/ranking`);
    return response.data;
  },

  getGeminiComparison: async (): Promise<GeminiVsClassicData> => {
    const response = await axios.get(`${API_URL}/gemini-vs-classic`);
    return response.data;
  }
};
