# Content Model

gdcms uses Google Docs for content and Google Sheets for metadata.

## Posts Sheet

The posts sheet is the publishing control panel.

Recommended columns:

| Column | Required | Example | Notes |
| --- | --- | --- | --- |
| `title` | Yes | `Spring Notice` | Display title |
| `slug` | Yes | `spring-notice` | Lowercase URL slug |
| `docId` | Yes | `1abc...` | Google Docs document ID |
| `status` | Yes | `published` | `draft`, `published`, or `archived` |
| `publishedAt` | No | `2026-05-10T09:00:00+09:00` | Optional scheduled publication time |
| `category` | No | `notice` | Content category |
| `excerpt` | No | `A short summary.` | Optional listing summary |
| `theme` | No | `default` | Must be allowlisted |
| `layout` | No | `article` | Must be allowlisted |
| `accentColor` | No | `#2563eb` | Must be validated before rendering |

## Status Values

Allowed values:

- `draft`
- `published`
- `archived`

Only `published` rows are eligible for public rendering.

If `publishedAt` is set to a future date, the row must not be rendered publicly yet.

## Theme Values

Initial theme allowlist:

- `default`
- `notice`
- `simple`

Unknown theme values should fall back to `default` or fail validation.

## Layout Values

Initial layout allowlist:

- `article`
- `notice`
- `page`

Unknown layout values should fall back to `article` or fail validation.
