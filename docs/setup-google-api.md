# Google API Setup

This document describes the intended Google API setup for local development and deployment.

## Authentication Strategy

The MVP uses a Google Service Account.

The application reads content server-side only. Google credentials must never be exposed to the browser.

## Required APIs

Enable these APIs in Google Cloud:

- Google Drive API
- Google Sheets API
- Google Docs API

## Service Account Access

Create a service account and share the target Google Drive folders or files with the service account email address.

The service account should only receive access to the folders required by the CMS.

Recommended access:

- Viewer access for read-only MVP
- Editor access only if automatic spreadsheet creation or row registration is implemented

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values locally.

Do not commit `.env.local`.

Required values:

```text
GOOGLE_PROJECT_ID=
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_ROOT_FOLDER_ID=
GOOGLE_POSTS_FOLDER_ID=
GOOGLE_PAGES_FOLDER_ID=
GOOGLE_POSTS_SHEET_ID=
```

`GOOGLE_PRIVATE_KEY` often contains newline characters. The implementation should support storing it as an escaped environment variable.

## Public Repository Safety

Never commit:

- Service account JSON files
- OAuth client secrets
- Real customer folder IDs
- Real customer document IDs
- Exported customer content
- Logs containing Google API responses
