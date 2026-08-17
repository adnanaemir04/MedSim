export interface User {
  email: string;
  nickname: string;
  password?: string; // Stored securely in real DB, but we keep it optional for auth models
  points: number;
  avatar?: string;
  solvedCases: string[]; // array of Case IDs
}
