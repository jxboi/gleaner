# Gleaner

A calm personal workspace for your ideas, plans, and next steps. Gleaner is an interface-first React, TypeScript, and Vite application, inspired by Basecamp’s simple approach to everyday tools, with its own visual identity.

## Run locally

Requires a recent version of Node.js with npm.

```sh
npm install
npm run dev
```

Open the local address printed by Vite. To check the TypeScript application and create a production build:

```sh
npm run build
npm run preview
```

## What you can do

- Start in a centered workspace with the assistant as the primary action and projects below.
- Open to-dos, notes, schedule, and activity only when you need them.
- Create, edit, archive, and restore projects.
- Add, edit, complete, and organize to-dos.
- Create and edit notes with automatic browser storage.
- View your schedule and create or edit events.
- Search your workspace with the search control or `⌘K` / `Ctrl+K`.
- Review local activity and notifications.
- Try the assistant interface and its suggested prompts.

The assistant is explicitly a preview: replies are deterministic and simulated locally. No AI service is called, and assistant text does not perform external actions.

## Your data

The app saves workspace changes in this browser’s `localStorage` under `gleaner.workspace.v1`. The first visit includes sample projects, to-dos, notes, and an event, with dates relative to the current day in Asia/Singapore. Existing saved dates are preserved. Changes persist across reloads on the same browser and origin.

There is no backend, account system, cloud sync, external calendar connection, or cross-device persistence. Clearing site data removes the local workspace. Private browsing and browser storage limits may prevent persistence; the app reports storage failures. Unreadable saved data is backed up before a fresh sample workspace is saved; if that backup fails, the original is left untouched.

To reset to the sample workspace, remove the `gleaner.workspace.v1` item from the browser’s local storage and reload.
