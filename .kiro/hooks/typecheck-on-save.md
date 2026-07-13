---
name: Typecheck on Save
description: Runs TypeScript typecheck when a .ts or .tsx file is saved, and reports any type errors found.
trigger: fileSave
filePattern: "**/*.{ts,tsx}"
action: message
---

A TypeScript file was just saved. Run `corepack pnpm typecheck` in the `taglish-credibility-checker-main` directory and report any type errors found. If there are errors, show them clearly with the file name and line number. If there are no errors, confirm that everything is clean.
