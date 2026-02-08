# Pollinate Frontend Task

Small Angular app that lists users and lets you view a user’s to-dos.

## Features

- **Users list**: Fetches users from JSONPlaceholder and renders a responsive Tailwind UI.
- **User details + to-dos**: Route-driven page that loads a single user and filters to-dos for that user.
- **Todos store**: Centralized RxJS store that loads all to-dos once and exposes selectors like `todosForUser$()`.

## Tech Stack

- Angular (generated with Angular CLI `21.1.3`)
- RxJS
- Tailwind CSS (via PostCSS) + utility classes in templates
- Unit tests: `ng test` (Vitest)

## Getting Started

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Scripts

- `npm start` — run dev server
- `npm run build` — production build to `dist/`
- `npm test -- --watch=false` — run unit tests once

## Routes

- `/users` — users list
- `/users/:id` — user to-dos page

## Project Layout

- `src/app/core/services/` — API services (`UsersService`, `TodosService`)
- `src/app/core/state/` — store (`TodosStore`)
- `src/app/features/users/` — users list component + spec
- `src/app/features/user-todos/` — user to-dos page

## Notes

- APIs are backed by `https://jsonplaceholder.typicode.com` (demo data; changes aren’t persisted).
- This project is **zoneless** (no `zone.js` dependency). Components that update UI from async work use Angular **signals** for reliable rendering.

## What I’d Improve With More Time

- Add a few more Playwright e2e flows (error states, empty states, and accessibility smoke checks).
- Add UI for toggling a to-do’s completed state (and reflecting that in the store).
- Add more robust error recovery (e.g. retry for to-dos fetch) and richer loading skeletons for the user detail page.
