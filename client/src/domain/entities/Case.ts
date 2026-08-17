export interface StageOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface CaseStage {
  text: string;
  options: StageOption[];
}

export interface Case {
  id: string;
  title: string;
  department: string;
  year: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  tests: string;
  stages: CaseStage[];
  isSolved?: boolean;
}
