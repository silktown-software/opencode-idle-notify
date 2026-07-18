# opencode-notify

Notification plugin for [opencode](https://opencode.ai). Sends a notification when the assistant finishes a task.

## Install

Copy `.opencode/plugin/notify.ts` and `opencode.json` into your project root. Restart opencode.

## Options

Configure in `opencode.json`:

```json
{
  "plugin": [
    ["./.opencode/plugin/notify.ts", { "desktop": true, "phone": true }]
  ]
}
```

| Option   | Default | Description                              |
| -------- | ------- | ---------------------------------------- |
| `desktop` | `true`  | Send desktop notification via `notify-send` |
| `phone`   | `true`  | Send notification to phone via GSConnect or KDE Connect |

To disable one, set it to `false`:

```json
["./.opencode/plugin/notify.ts", { "desktop": false, "phone": true }]
```

## Requirements

### Desktop

`notify-send` (usually preinstalled on GNOME).

### Phone (GSConnect)

The plugin auto-detects GSConnect at these paths:
- `/usr/share/gnome-shell/extensions/gsconnect@andyholmes.github.io/service/daemon.js`
- `~/.local/share/gnome-shell/extensions/gsconnect@andyholmes.github.io/service/daemon.js`

To set up GSConnect:
1. Install the [GSConnect GNOME Extension](https://extensions.gnome.org/extension/1319/gsconnect/)
2. Install the [KDE Connect](https://play.google.com/store/apps/details?id=org.kde.kdeconnect) app on your Android phone
3. Open GSConnect settings in GNOME and pair with your phone
4. In the KDE Connect app, tap your paired computer and enable the **Notification** plugin

### Phone (KDE Connect fallback)

If GSConnect is not found, the plugin falls back to `kdeconnect-cli`:
- Install: `sudo apt install kdeconnect`
- Pair your device through KDE Connect settings
- Enable the **Notification** plugin on your phone

## Troubleshooting

- **No desktop notification**: ensure `notify-send` is installed (`sudo apt install libnotify-bin`)
- **No phone notification**: verify the Notification plugin is enabled in KDE Connect on your phone
- **Phone not found**: check that your phone and computer are on the same network
