# AGENTS.md

## Project

opencode-notify is an opencode plugin that sends desktop and phone notifications when the assistant finishes a task. Works on Linux, macOS, and Windows.

## Structure

- `opencode.json` — plugin config with options
- `.opencode/plugin/notify.ts` — plugin source

## Conventions

- Always use braces on `if` statements
- Use `Record` lookup instead of if/else chains for event handlers
- Plugin options default to `true` when not specified
- Detect platform via `process.platform` for cross-platform support

## Testing

Run tests with `npm test`. Uses Node's built-in test runner with tsx for TypeScript support. Pure logic is extracted to `core.ts` for testability.
