import api from './api';

export interface LeaderboardEntry {
  id: string;
  game: string;
  score: number;
  user_name?: string;
  created_at: string;
}

export const arcadeService = {
  async getLeaderboard(game: string): Promise<LeaderboardEntry[]> {
    const { data } = await api.get(`/arcade/leaderboard/${game}`);
    return data;
  },

  async submitScore(game: string, score: number): Promise<void> {
    await api.post('/arcade/score', { game, score });
  }
};
