import { getJson } from '../api/client.js';
import { DataCard } from './DataCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };
const loadLeaderboard = () => getJson<{ leaderboard: Entry[] }>('/api/leaderboard').then((body) => body.leaderboard);

export default function Leaderboard() {
  return (
    <DataCard
      title="Leaderboard"
      description="Compare team point totals."
      load={loadLeaderboard}
      emptyText="No leaderboard scores yet."
      renderItem={(entry: Entry) => `#${entry.rank} ${entry.teamName}: ${entry.totalPoints} points`}
    />
  );
}
