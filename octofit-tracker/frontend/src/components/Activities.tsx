import { getJson } from '../api/client.js';
import { DataCard } from './DataCard.js';

type Activity = { type: string; minutes: number; points: number };
const loadActivities = () => getJson<{ activities: Activity[] }>('/api/activities').then((body) => body.activities);

export default function Activities() {
  return (
    <DataCard
      title="Activities"
      description="Track student activity minutes and points."
      load={loadActivities}
      emptyText="No activities recorded yet."
      renderItem={(activity: Activity) => `${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}
    />
  );
}
