import { DataCard } from './DataCard.js';

type Team = { name: string; mascot?: string; members: unknown[] };
const selectTeams = (body: { teams: Team[] }) => body.teams;

export default function Teams() {
  return (
    <DataCard
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      select={selectTeams}
      emptyText="No teams created yet."
      renderItem={(team: Team) => `${team.name}${team.mascot ? ` (${team.mascot})` : ''}: ${team.members?.length ?? 0} members`}
    />
  );
}
