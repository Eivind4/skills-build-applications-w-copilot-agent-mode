import { DataCard } from './DataCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };
const selectLeaderboard = (body: { leaderboard: Entry[] }) => body.leaderboard;

export default function Leaderboard() {
  return (
    <DataCard
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      select={selectLeaderboard}
      emptyText="No leaderboard scores yet."
      renderItem={(entry: Entry) => `#${entry.rank} ${entry.teamName}: ${entry.totalPoints} points`}
    />
  );
}
