import { getJson } from '../api/client.js';
import { DataCard } from './DataCard.js';

type Suggestion = { title: string; reason?: string };

// Seeded demo user; there is no authentication in this exercise to identify the current user.
const demoUserEmail = 'mona@example.com';
const loadSuggestions = () =>
  getJson<{ suggestions: Suggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent(demoUserEmail)}`).then((body) => body.suggestions);

export default function Workouts() {
  return (
    <DataCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      load={loadSuggestions}
      emptyText="No workout suggestions yet."
      renderItem={(suggestion: Suggestion) => (suggestion.reason ? `${suggestion.title}: ${suggestion.reason}` : suggestion.title)}
    />
  );
}
