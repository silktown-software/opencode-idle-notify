# AGENTS.md

## Project

opencode-notify is an opencode plugin that sends desktop and phone notifications when the assistant finishes a task.

## Structure

- `opencode.json` — plugin config with options
- `.opencode/plugin/notify.ts` — plugin source

## Conventions

- Always use braces on `if` statements
- Use `Record` lookup instead of if/else chains for event handlers
- Plugin options default to `true` when not specified
