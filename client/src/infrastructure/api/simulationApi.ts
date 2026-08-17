import axios from 'axios';

// Assuming the API is running on localhost:5211 (from your setup)
const API_BASE_URL = 'http://localhost:5211/api/simulation';

export interface DepartmentDto {
    id: string;
    name: string;
    year: number;
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
    title: string;
    initialText: string;
    isProcedural: boolean;
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
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const getDepartments = async (): Promise<DepartmentDto[]> => {
    const response = await axios.get<DepartmentDto[]>(`${API_BASE_URL}/departments`);
    return response.data;
};

export const getCases = async (): Promise<MedicalCaseDto[]> => {
    const response = await axios.get<MedicalCaseDto[]>(`${API_BASE_URL}/cases`);
    return response.data;
};

export const generateCases = async (departmentName: string, count: number): Promise<MedicalCaseDto[]> => {
    const response = await axios.post<MedicalCaseDto[]>(`${API_BASE_URL}/generate`, {
        departmentName,
        count
    });
    return response.data;
};

export const getSolvedCases = async (
    email: string,
    page: number = 1,
    pageSize: number = 10,
    subject?: string,
    year?: number
): Promise<PagedResult<SolvedCaseDto>> => {
    let url = `http://localhost:5211/api/profile/solved-cases?email=${encodeURIComponent(email)}&page=${page}&pageSize=${pageSize}`;
    if (subject) url += `&subject=${encodeURIComponent(subject)}`;
    if (year) url += `&year=${year}`;
    
    const response = await axios.get<PagedResult<SolvedCaseDto>>(url);
    return response.data;
};
