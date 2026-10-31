import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null) {
    throw Object.assign(new Error('Activity details are required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' ||
    !/^[a-f\d]{24}$/i.test(userId) ||
    typeof teamId !== 'string' ||
    !/^[a-f\d]{24}$/i.test(teamId) ||
    typeof type !== 'string' ||
    type.trim().length === 0 ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes < 1
  ) {
    throw Object.assign(new Error('Activity details are invalid'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: new mongoose.Types.ObjectId(userId) }),
    Team.exists({ _id: new mongoose.Types.ObjectId(teamId) }),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null) {
    throw Object.assign(new Error('Team details are required'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    name.trim().length === 0 ||
    typeof mascot !== 'string' ||
    mascot.trim().length === 0 ||
    !Array.isArray(members) ||
    !members.every((member) => typeof member === 'string' && /^[a-f\d]{24}$/i.test(member))
  ) {
    throw Object.assign(new Error('Team details are invalid'), { status: 400 });
  }

  const uniqueMembers = [...new Set(members as string[])];
  if (uniqueMembers.length > 0 && (await User.countDocuments({ _id: { $in: uniqueMembers } })) !== uniqueMembers.length) {
    throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMembers });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map((total) => [total._id.toString(), total.totalPoints]));

  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

const focusByActivityType: Record<string, string> = {
  run: 'endurance',
  cycle: 'endurance',
  swim: 'endurance',
  walk: 'endurance',
  strength: 'strength',
};
const recentActivityWindowMs = 30 * 24 * 60 * 60 * 1000;

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim() }).lean();
  if (!user) {
    throw Object.assign(new Error('No user found for that email'), { status: 404 });
  }

  const recentActivities = await Activity.find({
    user: user._id,
    occurredAt: { $gte: new Date(Date.now() - recentActivityWindowMs) },
  }).lean();

  const minutesByFocus = new Map<string, number>();
  const typeByFocus = new Map<string, string>();
  for (const activity of recentActivities) {
    const focus = focusByActivityType[activity.type.toLowerCase()];
    if (!focus) continue;
    minutesByFocus.set(focus, (minutesByFocus.get(focus) ?? 0) + activity.minutes);
    typeByFocus.set(focus, activity.type);
  }
  const workouts = await Workout.find().sort({ title: 1 }).lean();
  // Prefer the most-trained focus that actually has a workout; otherwise fall back to the user's goal.
  const recentFocus = [...minutesByFocus.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([activityFocus]) => activityFocus)
    .find((activityFocus) => workouts.some((workout) => workout.focus === activityFocus));

  const focus = recentFocus ?? user.fitnessGoal;
  const reason = recentFocus
    ? `Based on your recent ${typeByFocus.get(recentFocus)} activity, this builds ${focus}.`
    : `Matches your ${focus} fitness goal; log an activity to personalize suggestions.`;

  return [...workouts]
    .sort((a, b) => Number(b.focus === focus) - Number(a.focus === focus))
    .map((workout) => ({ ...workout, reason: workout.focus === focus ? reason : `Alternative ${workout.focus} workout.` }));
}

export { User };
