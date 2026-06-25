# PRISM Console

PRISM Console is a React + Vite dashboard for browsing GitHub Actions workflow runs and opening AI-generated RCA reports.

## Features
- Dashboard for workflow runs
- Search by commit SHA and branch
- Status-badged runs
- RCA viewer for artifacts containing ci-rca.md
- Responsive dark UI for GitHub Pages deployment

## Configuration
Create a `.env` file in the frontend folder:

```env
VITE_GITHUB_OWNER=aznavneet
VITE_GITHUB_REPO=prism
VITE_GITHUB_TOKEN=
```

## Run locally

```bash
cd frontend
npm install
npm run dev
```

## Build

```bash
cd frontend
npm run build
```

## Deploy to GitHub Pages
The app uses a GitHub Pages-friendly hash router and Vite base path. Build the project and publish the contents of the `dist` folder.
