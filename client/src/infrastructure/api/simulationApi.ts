import axios from 'axios';

// Single source of truth for base URL - reads from env for ngrok/production support
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5211/api';

const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('medsim_access_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('medsim_refresh_token') : null;
                const accessToken = typeof window !== 'undefined' ? localStorage.getItem('medsim_access_token') : null;
                
                if (refreshToken && accessToken) {
                    const res = await axios.post(`${API_BASE}/Auth/refresh-token`, {
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    });
                    
                    const newAccessToken = res.data.accessToken;
                    const newRefreshToken = res.data.refreshToken;
                    
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('medsim_access_token', newAccessToken);
                        localStorage.setItem('medsim_refresh_token', newRefreshToken);
                    }
                    
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('medsim_access_token');
                    localStorage.removeItem('medsim_refresh_token');
                    window.location.href = '/'; // or dispatch logout event
                }
            }
        }
        return Promise.reject(error);
    }
);

export interface SubTopicDto {
    id: string;
    name: string;
}

export interface TopicDto {
    id: string;
    name: string;
    subTopics: SubTopicDto[];
}

export interface DepartmentDto {
    id: string;
    name: string;
    year: number;
    topics: TopicDto[];
}

export interface CaseOptionDto {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
}

export interface CaseStageDto {
    id: string;
    text: string;
    orderIndex: number;
    options: CaseOptionDto[];
}

export interface PatientInfoDto {
    name: string;
    age: number;
    gender: string;
    chiefComplaint?: string;
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    oxygenSaturation?: string;
    respiratoryRate?: string;
    physicalExam?: string;
    medicalHistory?: string;
}

export interface MedicalCaseDto {
    id: string;
    departmentId: string;
    departmentName?: string;
    subTopicId?: string;
    subTopicName?: string;
    title: string;
    initialText: string;
    isProcedural: boolean;
    difficulty?: string;
    difficultyScore?: number;
    difficultyReason?: string;
    patientInfo?: PatientInfoDto;
    stages: CaseStageDto[];
}

export interface SolvedCaseDto {
    id: string;
    medicalCaseId: string;
    caseTitle: string;
    departmentName: string;
    departmentYear: number;
    isSolved: boolean;
    earnedPoints: number;
    givenAnswers: number[];
    solvedAt: string;
    difficulty?: string;
    difficultyScore?: number;
    difficultyReason?: string;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface TusStatsDto {
    totalSolved: number;
    correctCount: number;
    wrongCount: number;
    successRate: number;
    accuracy: number;
    averageTime: number;
}

export interface TusSubjectDto {
    name: string;
    questionCount: number;
}

export interface SolvedTusQuestionDto {
    id: string;
    isCorrect: boolean;
    solvedAt: string;
    questionText: string;
    subject: string;
    category: string;
    correctOption: string;
    explanation: string;
    difficulty?: string;
    selectedOption?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    optionE?: string;
}

export interface TusQuestionDto {
    id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    optionE: string;
    category: string;
    subject: string;
    difficulty?: string;
}

// ── SIMULATION & CASES APIs ──

export const getDepartments = async (): Promise<DepartmentDto[]> => {
    const response = await apiClient.get<DepartmentDto[]>('/simulation/departments');
    return response.data;
};

export const getCases = async (): Promise<MedicalCaseDto[]> => {
    const response = await apiClient.get<MedicalCaseDto[]>('/simulation/cases');
    return response.data;
};

export const generateCases = async (departmentName: string, topicName: string, subTopicName: string, count: number, difficulty: string = "Orta"): Promise<MedicalCaseDto[]> => {
    const response = await apiClient.post<MedicalCaseDto[]>('/simulation/generate', {
        departmentName,
        topicName,
        subTopicName,
        count,
        difficulty
    });
    return response.data;
};

export const getSolvedCases = async (
    email: string,
    page: number = 1,
    pageSize: number = 10,
    subject?: string,
    year?: number,
    difficulty?: string,
    sortOrder?: string
): Promise<PagedResult<SolvedCaseDto>> => {
    let url = `/profile/solved-cases?email=${encodeURIComponent(email)}&page=${page}&pageSize=${pageSize}`;
    if (subject) url += `&subject=${encodeURIComponent(subject)}`;
    if (year) url += `&year=${year}`;
    if (difficulty) url += `&difficulty=${encodeURIComponent(difficulty)}`;
    if (sortOrder) url += `&sortOrder=${encodeURIComponent(sortOrder)}`;
    
    const response = await apiClient.get<PagedResult<SolvedCaseDto>>(url);
    return response.data;
};

export const solveCase = async (email: string, caseId: string, earnedPoints: number, answers: number[]): Promise<any> => {
    const response = await apiClient.post('/profile/solve-case', {
        email,
        medicalCaseId: caseId,
        points: earnedPoints,
        givenAnswers: answers
    });
    return response.data;
};

// ── TUS CENTER APIs ──

export const getTusSubjects = async (): Promise<TusSubjectDto[]> => {
    const response = await apiClient.get<TusSubjectDto[]>('/tus/subjects');
    return response.data;
};

export const getTusQuestions = async (count: number, subject: string, difficulty?: string, mode: string = 'classic', email?: string): Promise<TusQuestionDto[]> => {
    let url = `/tus/questions?count=${count}&subject=${encodeURIComponent(subject)}&mode=${mode}`;
    if (difficulty && difficulty !== 'Tümü') {
        url += `&difficulty=${encodeURIComponent(difficulty)}`;
    }
    if (email) {
        url += `&email=${encodeURIComponent(email)}`;
    }
    const response = await apiClient.get<TusQuestionDto[]>(url);
    return response.data;
};

export const submitTusAnswer = async (email: string, questionId: string, selectedOption: string, durationSeconds: number): Promise<{ isCorrect: boolean; correctOption: string; explanation: string; points: number }> => {
    const response = await apiClient.post('/tus/submit-answer', {
        email,
        questionId,
        selectedOption,
        durationSeconds
    });
    return response.data;
};

export const getTusUserStats = async (email: string, subject?: string): Promise<TusStatsDto> => {
    let url = `/tus/stats?email=${encodeURIComponent(email)}`;
    if (subject) {
        url += `&subject=${encodeURIComponent(subject)}`;
    }
    const response = await apiClient.get<TusStatsDto>(url);
    return response.data;
};

export const getTusConceptExplanation = async (questionId: string): Promise<string> => {
    const response = await apiClient.post<{ explanation: string }>('/tus/explain-concepts', { questionId });
    return response.data.explanation;
};

export const generateTusQuestions = async (subject: string, count: number = 5, difficulty: string = "Orta"): Promise<TusQuestionDto[]> => {
    const response = await apiClient.post('/tus/generate-questions', { subject, count, difficulty });
    return response.data?.questions || response.data;
};

export const getSolvedTusQuestions = async (
    email: string,
    subject?: string,
    page: number = 1,
    pageSize: number = 10,
    difficulty?: string,
    sortOrder?: string
): Promise<PagedResult<SolvedTusQuestionDto>> => {
    let url = `/tus/solved-list?email=${encodeURIComponent(email)}&page=${page}&pageSize=${pageSize}`;
    if (subject) url += `&subject=${encodeURIComponent(subject)}`;
    if (difficulty) url += `&difficulty=${encodeURIComponent(difficulty)}`;
    if (sortOrder) url += `&sortOrder=${encodeURIComponent(sortOrder)}`;
    
    const response = await apiClient.get<PagedResult<SolvedTusQuestionDto>>(url);
    return response.data;
};

// ── LEADERBOARD APIs ──

export const getGeneralLeaderboard = async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/Auth/leaderboard');
    return response.data;
};

export const getTusLeaderboard = async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/tus/leaderboard');
    return response.data;
};

// ── USER PROFILE & FRIENDS APIs ──

export const getFriendsList = async (email: string): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/Profile/friends?email=${encodeURIComponent(email)}`);
    return response.data;
};

export const addFriend = async (userEmail: string, friendNickname: string): Promise<{ message?: string }> => {
    const response = await apiClient.post('/Profile/add-friend', { userEmail, friendNickname });
    return response.data;
};

export const updateUserProfile = async (email: string, nickname: string, avatar: string, points?: number): Promise<any> => {
    const response = await apiClient.put('/Auth/updateProfile', { email, nickname, avatar, points });
    return response.data;
};

export const deleteUserAccount = async (email: string): Promise<any> => {
    const response = await apiClient.delete(`/Auth/deleteAccount/${encodeURIComponent(email)}`);
    return response.data;
};

// ── TUS ADMIN APIs ──
export const getAdminKnowledges = async (subject?: string): Promise<any[]> => {
    let url = '/TusAdmin/knowledges';
    if (subject) url += `?subject=${encodeURIComponent(subject)}`;
    const response = await apiClient.get<any[]>(url);
    return response.data;
};

export const saveAdminKnowledge = async (knowledge: any): Promise<any> => {
    const response = await apiClient.post('/TusAdmin/knowledges', knowledge);
    return response.data;
};

export const deleteAdminKnowledge = async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/TusAdmin/knowledges/${id}`);
    return response.data;
};

export const getPendingQuestions = async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/TusAdmin/questions/pending');
    return response.data;
};

export const approveQuestion = async (id: string): Promise<any> => {
    const response = await apiClient.post(`/TusAdmin/questions/${id}/approve`);
    return response.data;
};

export const rejectQuestion = async (id: string): Promise<any> => {
    const response = await apiClient.post(`/TusAdmin/questions/${id}/reject`);
    return response.data;
};

export const toggleActiveQuestion = async (id: string): Promise<any> => {
    const response = await apiClient.post(`/TusAdmin/questions/${id}/toggle-active`);
    return response.data;
};

export const generateClassicPipeline = async (subject: string, topicName: string, subTopicName: string): Promise<any> => {
    const response = await apiClient.post('/TusAdmin/generate-classic-pipeline', { subject, topicName, subTopicName });
    return response.data;
};
