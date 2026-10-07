# Gleaner interface

The active reference is `gleaner-centered-concept.png`, generated with the built-in Image Gen tool. `gleaner-concept.png` is the earlier exploration, superseded by the user's direction to center the workspace and hide distractions until needed. The supplied Basecamp screenshots informed simplicity and hierarchy; Gleaner has its own layout, palette, and typography.

## Visual hierarchy

One centered column. A personal greeting leads into the assistant, the largest white surface and primary action. Projects sit quietly below. To-dos, notes, schedule, search, activity, creation forms, and settings appear only when opened. No home sidebar, calendar rail, decorative banners, footer slogans, or tool-screen preheadings.

## System

- Warm ivory background #f7f7f2, white surfaces, dark olive text #292f29, evergreen accent #426347. Borders #dedfd7. No gradients or raster decoration.
- Self-hosted DM Sans for controls and body; Lora for greeting and section/project headings. Font licenses are included in `public/fonts`.
- Main greeting 38–46px desktop and 31px mobile. Assistant heading 25px semibold sans. Sections 24–25px, project names 19–23px. Supporting text 13–16px.
- Main container 1070px, growing to 1140px on larger screens, including 24px gutters. The assistant is inset to 936–998px. All tool pages use the same centered shell.
- Assistant radius 15px; project cards 12px; controls 8–10px. Thin lucide icons. Sage, honey, and lavender project colors are restrained accents.
- A three-column project collection becomes a compact vertical list on mobile. Navigation moves to a second header row below 760px. Dialogs stay within the viewport. Notes switch between list and editor on small screens.
- Forest-green primary actions, outlined secondary actions, quiet links. Visible focus rings, 150ms interaction transitions, and reduced-motion support.

## Primary screen copy

gleaner; Home; My projects; My tools; current weekday and date; A little clarity for your day, JX.; Your ideas, plans, and next steps. All in one place.; What’s on your mind?; Make a plan, untangle an idea, or get something done.; Ask Gleaner anything…; Add context; Plan my day; Help me brainstorm; Summarize my notes; Your projects; A home for everything you’re working on.; New project; A calmer everyday; Small habits, more headspace.; Japan, here I come; A little adventure in the making.; My next chapter; Ideas for what comes next.

Dates, names, progress, and counts derive from current local data. The concept's October 6 date intentionally advances with the current day. Compact mobile cards preserve the content while adapting the layout.

## Working interface

React, Vite, TypeScript, and versioned browser storage. Create/edit projects, tasks, notes, and events. Archive/restore projects; delete/undo tasks, notes, and events. Task view starts with today and overdue items. Notes save as you type and disclose storage errors. The calendar supports month navigation and selected-day agendas. Search supports Cmd/Ctrl+K, arrow-key selection, Enter, and Escape. Native dialogs contain focus, focus the initial field, and restore focus when closed.

Assistant replies are deterministic local previews using attached notes/projects and current tasks. This is disclosed in the conversation view. No external AI calls, backend, accounts, cloud synchronization, or external actions are implemented.

## Component ownership

App composes the shell, navigation, dialogs, and routing. Feature views own their interactions. Shared components include Modal, CreateDialog, Search, ProjectCard, and Assistant. `lib/types.ts` defines data contracts and date helpers; `lib/store.ts` owns seeds, validation, safe recovery, and persistence.
