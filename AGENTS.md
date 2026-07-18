# AGENTS.md

## Project

opencode-notify is an opencode plugin that sends desktop and phone notifications when the assistant finishes a task. Works on Linux, macOS, and Windows.

## Structure

- `opencode.json` — plugin config (empty, uses auto-discovery)
- `src/notify.ts` — plugin source
- `src/core.ts` — pure logic for testability
- `src/core.test.ts` — tests
- `eslint.config.js` — ESLint config with TypeScript and stylistic rules
- `tsconfig.json` — TypeScript config
- `.opencode/plugin/notify.js` — bundled output (auto-discovered by opencode)

## Conventions

- Always use braces on `if` statements
- Use early exit pattern instead of else chains
- Use `Record` lookup for platform-specific handlers
- Plugin options default to `true` when not specified
- Detect platform via `process.platform` for cross-platform support

## Commands

- `npm run build` — bundle to `.opencode/plugin/notify.js`
- `npm test` — run tests (Node built-in test runner + tsx)
- `npm run lint` — check for lint errors
- `npm run lint:fix` — auto-fix lint errors
