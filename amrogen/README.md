## AmroGen — Autonomous Revenue OS

AmroGen is a production-ready multi-agent revenue command center that fuses the **Claude Agent SDK**, **Gemini 2.0 API**, and **Hyperbrowser** automation fabric to autonomously:

- Enrich and qualify leads against MEDDIC in real time
- Generate hyper-personalised, multi-channel outreach sequences
- Launch live browser research to surface buying triggers
- Track orchestration runs, velocity, and activity streams in a modern UI powered by **shadcn/ui**

The application ships with a real data store (filesystem-backed JSON) for persistent lead and run storage and exposes fully functional API routes (no mock handlers) for orchestration.

## Tech Stack

- **Frontend**: Next.js 16 App Router, React 19, Tailwind v4, Shadcn UI, Framer Motion, Recharts
- **Backend**: Next.js Route Handlers, Claude SDK, Gemini API, Hyperbrowser SDK
- **State/Data**: React Query, Zustand (providers), filesystem persistence (`data/amrogen-state.json`)
- **Tooling**: TypeScript, ESLint, Sonner toasts

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy the sample env file and populate the required API keys. All integrations are mandatory for orchestration to run.

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   |----------|-------------|
   | `ANTHROPIC_API_KEY` | Claude API key with access to Sonnet 4.5 |
   | `GEMINI_API_KEY` | Google Generative AI key with Gemini 2.0 Flash access |
   | `HYPERBROWSER_API_KEY` | Hyperbrowser workspace key |
   | `AMROGEN_DATA_PATH` | Optional path override for the JSON datastore |

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000). The dashboard renders live metrics, orchestration history, and the agent launcher.

## Key Workflows

- **Launch a new orchestration**: Fill the lead dossier in the "New lead" tab and click “Deploy agents”. Claude and Gemini are invoked to qualify and compose messaging; Hyperbrowser runs discovery and the UI updates in real time.
- **Replay an existing orchestration**: Switch to the "Replay existing" tab and relaunch any stored lead with fresh context.
- **Monitor activity**: The dashboard shows pipeline metrics, stage distribution, run velocity, and a live activity feed drawn from persisted logs.

## Data & Persistence

- Lead, run, and activity data are stored in `data/amrogen-state.json`. The file is created automatically on first write.
- To reset the state, delete the JSON file (or point `AMROGEN_DATA_PATH` to a new location).

## Production Builds

```bash
npm run build
npm run start
```

## Testing the Integrations

- **Claude**: verify the `Launch Orchestration` call returns a populated outreach sequence in `/api/orchestrations` responses.
- **Gemini**: MEDDIC qualification reports are embedded on each run (`run.qualificationReport`).
- **Hyperbrowser**: Browser traces appear in `run.browserTrace.actions` and reflect live research steps.

## Deployment Notes

- The app assumes a Node.js runtime with filesystem access for the datastore. When deploying to serverless providers ensure you mount a persistent volume or replace the store with your database of choice.
- `next start` runs the same Node handler code used in development; no demo stubs are present.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server with webpack |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint across the project |

