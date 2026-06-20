export interface User {
  id: string;
  name: string;
  email: string;
  role: 'mahasiswa' | 'psikolog';
}

export interface HistorySession {
  id: string;
  date: string;
  status: string;
  moodScore: number;
}
