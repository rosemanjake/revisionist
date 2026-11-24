# Revisionist

AI-powered fiction manuscript review web app built with Next.js, TypeScript,
Vertex AI (`gemini-4-neon`), and Cloud Firestore.

## Architecture

- **Frontend**: Next.js Pages Router + TypeScript + Framer Motion.
- **AI Review Engine**: Server-side Vertex AI via `@google/genai` using
  `gemini-4-neon` with `ThinkingLevel.MEDIUM` and structured JSON output
  (`overview`, `plot`, `characters`, `prose`, `theme`).
- **Storage & Access Control**: All Cloud Firestore reads and writes run
  exclusively server-side through `firebase-admin`. Direct browser access to
  Firestore is blocked by [firestore.rules](./firestore.rules), and report
  retrieval is gated behind `/api/validate` email verification.
- **Email Delivery**: Nodemailer SMTP (`utils/email.ts`) sends report links
  after generation.
- **Licensing**: Gumroad license verification (`store/license.ts`) for
  manuscripts over 1,000 words.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

3. Authenticate with Google Cloud locally so Vertex AI and Firebase Admin SDK
   can use Application Default Credentials (ADC):

   ```bash
   gcloud auth application-default login
   ```

   Alternatively, set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON
   path, or provide `FIREBASE_SERVICE_ACCOUNT_JSON`.

4. Start the development server:

   ```bash
   npm run dev
   ```

## Locking Down Firestore

Because all database operations run server-side through `firebase-admin`, direct
client access to Firestore should be disabled. Deploy the included
[firestore.rules](./firestore.rules) to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

## Email Configuration

Configure `SMTP_USER` and `SMTP_PASS` in your environment. For Gmail accounts,
generate a Google App Password rather than using your account password. Optional
`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, and `SMTP_FROM` variables are supported
for non-Gmail SMTP providers.

## Scripts

- `npm run dev` — start local dev server
- `npm run lint` — run ESLint
- `npm run build` — type-check and build for production
- `npm run start` — run production build
