# gdcms

Google Drive powered CMS for simple static websites.

> Write in Google Docs. Publish from Google Sheets. Render with Next.js.

## Concept

gdcms is a CMS that does not require a custom admin screen.

The core idea is simple:

- Google Drive is the content workspace.
- Google Docs is the writing interface.
- Google Sheets is the publishing and metadata control panel.
- Next.js renders the public website.

This project is built for small teams, local organizations, clinics, schools, community groups, NPOs, and small businesses that already understand Google Drive but do not want to learn WordPress or a traditional CMS.

## Philosophy

The goal is not to build another complex CMS.

The goal is:

```text
If you can use Google Drive, you can update your website.
```

Editors should not need to understand routing, HTML, Markdown, deployments, databases, or admin dashboards.

## MVP Goal

The first milestone is intentionally small:

```text
When an editor writes content in Google Docs and changes a Google Sheets row to published, the article appears on a Next.js website.
```

## Planned Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Google APIs
- Zod
- HTML sanitization
- Static generation / ISR
- Service Account authentication
- Docker / Docker Compose for local development and VPS deployment

## Runtime Strategy

gdcms is intended to be developed and deployed with Docker.

Initial runtime target:

- Local development with Docker Compose
- VPS deployment with Docker Compose
- Environment variables supplied outside Git
- No committed secrets or service account JSON files

## Content Model

Google Docs stores the article or page body.

Google Sheets stores metadata and publishing controls.

Expected sheet columns:

| Column | Purpose |
| --- | --- |
| `title` | Display title |
| `slug` | URL slug |
| `docId` | Google Docs document ID |
| `status` | `draft`, `published`, or `archived` |
| `publishedAt` | Optional publication date and time |
| `category` | Content category |
| `excerpt` | Optional summary |
| `theme` | Whitelisted design theme |
| `layout` | Whitelisted layout variant |
| `accentColor` | Validated CSS accent color |

## Design Principle

Content and design are separated.

Google Docs controls content structure:

- Headings
- Paragraphs
- Lists
- Links
- Tables, later

The public website controls visual design:

- Tailwind CSS classes
- React components
- Theme allowlists
- Validated CSS variables

Inline styles from Google Docs should not be trusted or rendered directly.

## Security Model

Google Drive handles editor access and document permissions.

The application should:

- Read from configured Drive folders only.
- Keep Google credentials on the server side.
- Never expose service account secrets to the browser.
- Validate Google Sheets rows with Zod.
- Sanitize document-derived HTML.
- Exclude draft and future-scheduled content from public responses.
- Validate theme, layout, and color values before rendering.

## Repository Status

This repository is in the planning and early implementation stage.

See [PLAN.md](./PLAN.md) for the architecture and implementation plan.

Additional documentation:

- [Japanese README](./README.ja.md)
- [Content model](./docs/content-model.md)
- [Google API setup](./docs/setup-google-api.md)
- [Technical notes, Japanese](./docs/technical-notes.ja.md)
- [Agent guidance](./AGENTS.md)

## License

MIT
