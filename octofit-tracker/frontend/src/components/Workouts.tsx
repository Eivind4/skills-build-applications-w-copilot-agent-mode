import { DataCard } from './DataCard.js';

type Suggestion = { title: string; reason?: string };
const selectSuggestions = (body: { suggestions: Suggestion[] }) => body.suggestions;

// Seeded demo user; there is no authentication in this exercise to identify the current user.
const demoUserEmail = 'mona@example.com';

export default function Workouts() {
  return (
    <DataCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path={`/api/workouts/suggestions/${encodeURIComponent(demoUserEmail)}`}
      select={selectSuggestions}
      emptyText="No workout suggestions yet."
      renderItem={(suggestion: Suggestion) => (suggestion.reason ? `${suggestion.title}: ${suggestion.reason}` : suggestion.title)}
    />
  );
}
