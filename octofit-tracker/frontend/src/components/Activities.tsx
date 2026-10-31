import { DataCard } from './DataCard.js';

type Activity = { type: string; minutes: number; points: number };
const selectActivities = (body: { activities: Activity[] }) => body.activities;

export default function Activities() {
  return (
    <DataCard
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      select={selectActivities}
      emptyText="No activities recorded yet."
      renderItem={(activity: Activity) => `${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}
    />
  );
}
