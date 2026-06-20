import { create } from 'zustand';
import { HistorySession } from '../models/types';

interface DashboardState {
  currentMoodScore: number;
  moodStatus: string;
  history: HistorySession[];
  fetchDashboardData: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  currentMoodScore: 0,
  moodStatus: 'Belum ada data',
  history: [],
  fetchDashboardData: () => {
    // Dummy dashboard data
    set({
      currentMoodScore: 85,
      moodStatus: 'Kondisi Stabil',
      history: [
        { id: '1', date: '2023-10-10', status: 'Normal', moodScore: 90 },
        { id: '2', date: '2023-10-12', status: 'Ringan', moodScore: 75 },
      ],
    });
  },
}));
