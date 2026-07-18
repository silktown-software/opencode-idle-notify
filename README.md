# opencode notify

Notification plugin for [opencode](https://opencode.ai). Sends a desktop and/or phone notification when the assistant finishes a task.

It has been testing on Arch Linux.

## Requirements

- Node.js 20+ (for built-in test runner with `--import tsx`)
- opencode 1.18+

## Install

```bash
npm install
npm run build
```

Copy `.opencode/plugin/notify.js` into your project's `.opencode/plugin/` directory. Restart opencode.

## Options

Configure in `opencode.json` (only needed to change defaults):

```json
{
  "plugin": [
    ["./.opencode/plugin/notify.js", { "desktop": true, "phone": true }]
  ]
}
```

| Option   | Default | Description                              |
| -------- | ------- | ---------------------------------------- |
| `desktop` | `true`  | Send desktop notification |
| `phone`   | `true`  | Send notification to phone via KDE Connect |
| `debug`   | `false` | Log events to `/tmp/opencode-notify.log` |

To disable one, set it to `false`:

```json
["./.opencode/plugin/notify.js", { "desktop": false, "phone": true }]
```

## Development

```bash
npm install      # install dependencies
npm run build    # bundle plugin to .opencode/plugin/notify.js
npm test         # run tests
npm run lint     # check for lint errors
npm run lint:fix # auto-fix lint errors
```

## Platform Support

### Desktop Notifications

| Platform | Method | Install |
| -------- | ------ | ------- |
| Linux | `notify-send` | `libnotify` |
| macOS | `osascript` | Built-in |
| Windows | PowerShell toast | Built-in |

### Phone Notifications (KDE Connect)

The plugin uses KDE Connect to send notifications to your phone. Install the [KDE Connect](https://play.google.com/store/apps/details?id=org.kde.kdeconnect) app on Android or [KDE Connect](https://apps.apple.com/us/app/kde-connect/id1580245991) on iOS.

#### Linux

KDE Connect and GSConnect Gnome Extension are available for all major distributions and can be installed via your package manager.

#### macOS (experimental, untested)

Install [KDE Connect](https://kdeconnect.kde.org/download.html).

#### Windows (experimental, untested)

Install [KDE Connect](https://kdeconnect.kde.org/download.html). 
Ensure `kdeconnect-cli` is in your PATH.

## Troubleshooting

- **No desktop notification**: ensure `notify-send` is installed (Linux) or check system notification settings.
- **No phone notification**: verify the Notification plugin is enabled in KDE Connect on your phone.
- **Phone not found**: ensure your phone and computer are on the same network and paired
- **Enable debug logging**: set `"debug": true` in options and check `/tmp/opencode-notify.log`
