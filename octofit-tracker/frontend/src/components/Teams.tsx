import { getJson } from '../api/client.js';
import { DataCard } from './DataCard.js';

type Team = { name: string; mascot?: string; members: unknown[] };
const loadTeams = () => getJson<{ teams: Team[] }>('/api/teams').then((body) => body.teams);

export default function Teams() {
  return (
    <DataCard
      title="Teams"
      description="Manage teams and members."
      load={loadTeams}
      emptyText="No teams created yet."
      renderItem={(team: Team) => `${team.name}${team.mascot ? ` (${team.mascot})` : ''}: ${team.members?.length ?? 0} members`}
    />
  );
}
