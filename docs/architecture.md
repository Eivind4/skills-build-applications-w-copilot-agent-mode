# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep route-level React components responsible for rendering API data and accessible loading, empty, and error states. Route all requests through `src/api/client.ts`, using relative `/api` paths and the existing Vite proxy; do not move business rules into the UI.
- Logic tier decision: Implement the `/api/*` contracts in Express routes backed by explicit service functions. Validate request shape and ObjectId syntax before database lookups, return deliberate 4xx responses for invalid or missing resources, and keep persistence details out of route handlers.
- Data tier decision: Put required fields, types, and defaults in the Mongoose schemas. Use the shared database configuration and stable, idempotent seed upserts; do not delete unrelated records when seeding.
- Activity tracking approach: Validate `userId`, `teamId`, activity type, and minutes before creating a record; verify that both referenced records exist. Persist the references, submitted activity details, computed points, and occurrence time, then return the created record. List activities from the data tier.
- Team management approach: Require a name, preserve the submitted name and mascot, and default members to an empty array. Validate any supplied member references and return created/listed teams with their members.
- Leaderboard approach: Aggregate activity points by team in a leaderboard service, include teams with no activity at zero points, order totals descending, and assign ranks starting at 1.
- Workout suggestions approach: Find the user by the requested email and derive the leading suggestion from the user's fitness goal or recent activity, with a reason that names the matching focus. Return a deliberate 4xx for an unknown email; do not add authentication.

## Test plan

Run the focused contract suite after changes in that tier, then run both builds before considering the implementation complete. A failing assertion points to a violated data/API/UI contract; a build failure indicates a TypeScript or bundling issue even if runtime tests pass.

- Data tier: `npm run test:data --prefix octofit-tracker/backend` - checks schema validation, defaults, and safe, idempotent seed behavior. Failures indicate model constraints/defaults or fixture reconciliation/seed behavior is incorrect.
- Logic/API tier: `npm run test:api --prefix octofit-tracker/backend` - checks activity and team create/list behavior, deliberate 4xx handling, leaderboard ordering/ranks, and personalized workout suggestions. Failures indicate route validation, service logic, or response shape does not match the contract.
- Presentation tier: `npm test --prefix octofit-tracker/frontend` - checks API-backed rendering and accessible loading, empty, and error states across routes. Failures indicate request wiring, rendered content, or state/accessibility behavior is missing or incorrect.
- Backend build: `npm run build --prefix octofit-tracker/backend` - type-checks backend code. Failures indicate TypeScript errors.
- Frontend build: `npm run build --prefix octofit-tracker/frontend` - type-checks and bundles the frontend. Failures indicate TypeScript or Vite build errors.
