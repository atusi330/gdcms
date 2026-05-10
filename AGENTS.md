# AGENTS.md

This file gives coding agents project-specific guidance for working on gdcms.

## Project Summary

gdcms is a Google Drive powered CMS for simple static websites.

Core idea:

```text
If you can use Google Drive, you can update your website.
```

The project avoids building a custom admin screen. Google Docs and Google Sheets are the authoring and publishing interface. Next.js renders the public website.

## Primary Goals

- Make website updates possible through Google Drive.
- Keep the editor workflow simple.
- Keep the public site fast, static-friendly, and secure.
- Keep the repository safe for public Git hosting.
- Prefer small, understandable implementation steps over a complex CMS architecture.

## Current Architecture Direction

Use a single Next.js application for the MVP.

Planned stack:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Google APIs
- Zod
- HTML sanitization
- Static generation / ISR
- Service Account authentication
- Docker / Docker Compose
- Traefik

Docker is the default runtime strategy.

Use Docker Compose for:

- Local development
- VPS deployment

Use Traefik in both local and production where practical. Local development should be routed through a hostname such as `gdcms.localhost`, and production should use the existing VPS Traefik setup.

Vercel is optional later, not the primary deployment target.

## Important Product Rules

- Do not build a custom CMS admin screen unless explicitly requested.
- Treat Google Docs as the body content editor.
- Treat Google Sheets as the publishing and metadata control panel.
- Treat Google Drive folders as the information architecture.
- Keep content and design separate.
- Do not try to perfectly reproduce Google Docs visual styling.
- Preserve semantic content, then render it through project components and Tailwind.

## MVP Boundary

The first useful MVP is:

```text
Google Docs body + Google Sheets metadata -> published Next.js article.
```

MVP should include:

- Reading a posts spreadsheet
- Reading linked Google Docs
- Zod validation for sheet rows
- Published/draft filtering
- `publishedAt` filtering
- Post list page
- Post detail page
- Basic HTML or structured content sanitization
- Docker-based local development

MVP should not include unless explicitly requested:

- Custom admin UI
- Google Drive webhooks
- Auto-created spreadsheets
- Multi-site management
- PDF conversion
- AI processing
- WordPress integration
- Complex permission UI

## Repository Safety

This repository is intended to be public.

Never commit:

- `.env.local`
- `.env.production`
- Service Account JSON files
- OAuth client secrets
- Google private keys
- Real customer Drive folder IDs
- Real customer spreadsheet IDs
- Real customer document IDs
- Customer content exports
- Logs containing Google API responses

Use `.env.example` for variable names only.

If examples need IDs or content, use obviously fake values.

## Security Rules

- Google credentials must remain server-side.
- Never expose Google credentials through `NEXT_PUBLIC_*` variables.
- Service Account access should be limited to configured folders.
- Validate all Google Sheets rows with Zod before use.
- Sanitize all document-derived HTML before rendering.
- Keep `draft`, `archived`, and future-scheduled content out of public responses.
- Validate `theme`, `layout`, and `accentColor` values.
- Use allowlists for themes and layouts.
- Restrict iframe embeds to explicit approved sources.

## Coding Preferences

- Use TypeScript.
- Prefer small modules with clear boundaries.
- Prefer project-local helpers over adding large abstractions.
- Keep the first implementation simple and readable.
- Use server-side Google API calls only.
- Avoid introducing a database until there is a clear need.
- Avoid introducing Redis, queues, or workers during the first MVP unless explicitly requested.
- Prefer deterministic parsing and validation before adding automation.

## Suggested Initial Structure

For the first MVP, a simple structure is acceptable:

```text
src/
  app/
    page.tsx
    posts/
      page.tsx
      [slug]/
        page.tsx
  lib/
    google/
      auth.ts
      sheets.ts
      docs.ts
    content/
      schema.ts
      posts.ts
    renderers/
      google-docs.tsx
  components/
docs/
examples/
```

Split into `apps/` and `packages/` only if the backend and frontend truly need separate deployment or reuse.

## Docker Expectations

When implementation begins, add:

- `Dockerfile`
- `compose.yaml`
- `.dockerignore`

The compose setup should run the app locally without requiring global Node tooling beyond Docker.

Keep secrets outside compose files. Use environment files locally and deployment secrets on the VPS.

Prefer Traefik labels over direct host port publishing for app traffic.

Local target:

```text
http://gdcms.localhost
```

Production target:

```text
https://<production-domain>
```

## Documentation Rules

Keep documentation aligned with:

- `README.md`
- `README.ja.md`
- `PLAN.md`
- `docs/content-model.md`
- `docs/setup-google-api.md`
- `docs/technical-notes.ja.md`

When changing architecture or MVP scope, update `PLAN.md`.

When changing environment variables, update `.env.example`.

When changing content columns or validation rules, update `docs/content-model.md`.

## Tone and Positioning

This project should feel simple and practical.

Good positioning:

```text
Google Drive is the CMS.
```

Avoid positioning it as a large enterprise CMS or a general-purpose WordPress replacement.

The first audience is small organizations that already use Google Drive.
