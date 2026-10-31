# SupportIQ AI

SupportIQ AI is a customer-support intelligence workspace that helps customers find answers grounded in an organization's verified knowledge.

The project includes a responsive public landing page, optional Supabase email/password authentication, and a support dashboard that can be explored in demo mode.

> **Prototype notice:** The dashboard uses local sample data. Its chat performs local article matching; it is not a production AI/RAG service, and its sample analytics are not live customer metrics.

## Features

- Public landing page with product overview, workflow, and dashboard-inspired preview
- Email/password sign-up and login with field validation
- Email verification and password recovery through Supabase Auth
- Authenticated dashboard when Supabase is configured
- Local demo dashboard and support chat when Supabase is not configured
- Knowledge base, unanswered-question queue, feedback, analytics, and settings screens
- Explicit fallback when the demo chat cannot find supporting knowledge
- Responsive dark interface and accessible form controls

## Routes

| Route | Description |
| --- | --- |
| `/` | Public landing page |
| `/login` | Sign in |
| `/signup` | Create an account |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Choose a new password from the email link |
| `/app` | SupportIQ dashboard |
| `/privacy` | Privacy policy placeholder; final legal review required |
| `/terms` | Terms placeholder; final legal review required |

## Tech stack

- React 18, TypeScript, and Vite
- Tailwind CSS
- Supabase JavaScript client and Supabase Auth
- Lucide React icons

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open the local URL printed by Vite. With no Supabase credentials, the dashboard is available in demo mode and authentication forms clearly report that authentication is not configured.

## Supabase setup

1. Create a Supabase project and enable the Email provider under **Authentication → Providers**.
2. Apply the migrations in order:
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_auth_profile_provisioning.sql`
3. Add the project URL and public anon/publishable key to `.env.local`:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
   VITE_DEMO_MODE=false
   ```

4. Restart the Vite server after changing environment variables.
5. Configure the Supabase Site URL and allowed redirect URLs for local development and the deployed site. The password reset flow redirects to `/reset-password`.
6. Configure email confirmation according to your project policy. When confirmation is enabled, users must verify their email before signing in.

New users are provisioned as `member` profiles by the second migration. Users cannot self-assign an administrator role through profile updates. Do not expose a Supabase `service_role` key in this frontend or in any `VITE_` variable. Environment files containing credentials are ignored by Git.

When Supabase is configured, `/app` requires an authenticated session unless `VITE_DEMO_MODE=true` is explicitly set. The migration is additive; apply it to the project after the existing initial schema.

## Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

## Deployment

The Vercel configuration builds with `npm run build` and serves the `dist` output. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the deployment environment if authentication is required. Add the deployed URL to the Supabase redirect allowlist.

The `/privacy` and `/terms` pages are clearly identified placeholders, not approved legal documents. Replace them with organization-approved content before making the site available to customers.

## Current limitations

- Chat retrieval, dashboard data, feedback, and analytics are local demo behavior; they are not persisted to Supabase.
- No production AI/RAG endpoint is included.
- Live authentication requires a configured Supabase project and was not testable without project credentials.
- Privacy and terms content requires final legal review.
