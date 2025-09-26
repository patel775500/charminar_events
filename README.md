# Charminar Event

A production-ready full-stack React + Express app with Vite, React Router 6 SPA, TailwindCSS, and TypeScript.

## Dev

- npm run dev

## Build

- npm run build:client (outputs to `dist/spa`)

## Deploy

- Netlify
  - Build command: `npm run build:client`
  - Publish dir: `dist/spa`
- Vercel
  - install: `npm install`
  - build: `npm run build:client`
  - output: `dist/spa`

## Notes

- Organizer signup requires Aadhar (12 digits) and admin approval at `/admin`.
- Customer portal supports Genre + City + Venue filters.
- Ongoing vs Upcoming determined by start/end time window.
