// src/notify.ts
import { exec } from "child_process";
import { appendFileSync } from "fs";

// src/core.ts
import { existsSync } from "fs";
var GSCONNECT_PATHS = {
  linux: "/usr/share/gnome-shell/extensions/gsconnect@andyholmes.github.io/service/daemon.js",
  linuxLocal: `${process.env.HOME}/.local/share/gnome-shell/extensions/gsconnect@andyholmes.github.io/service/daemon.js`
};
function findGSConnect(platform2, paths = GSCONNECT_PATHS, exists = existsSync) {
  if (platform2 !== "linux") {
    return void 0;
  }
  const candidates = [paths.linux, paths.linuxLocal];
  return candidates.find(exists);
}
function createNotificationState() {
  let cancelled = false;
  return {
    get cancelled() {
      return cancelled;
    },
    markCancelled() {
      cancelled = true;
    },
    reset() {
      cancelled = false;
    }
  };
}
function shouldNotify(status, state) {
  if (status === "busy") {
    return false;
  }
  if (status === "idle" && !state.cancelled) {
    return true;
  }
  return false;
}

// src/notify.ts
var LOG = "/tmp/opencode-notify.log";
function log(msg, debug) {
  if (debug) {
    appendFileSync(LOG, `${(/* @__PURE__ */ new Date()).toISOString()} ${msg}
`);
  }
}
var platform = process.platform;
var GSCONNECT = findGSConnect(platform);
var desktopCommands = {
  darwin: () => exec(`osascript -e 'display notification "Task completed" with title "OpenCode"'`),
  win32: () => exec(
    `powershell -Command "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null; [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null; $template = '<toast><visual><binding template="ToastGeneric"><text>OpenCode</text><text>Task completed</text></binding></visual></toast>'; $xml = New-Object Windows.Data.Xml.Dom.XmlDocument; $xml.LoadXml($template); $toast = [Windows.UI.Notifications.ToastNotification]::new($xml); [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('OpenCode').Show($toast)"`
  ),
  linux: () => exec('notify-send "OpenCode" "Task completed"')
};
var phoneHandlers = {
  darwin: (message) => exec(`konnect notification --title "OpenCode" --text "${message}"`),
  win32: (message) => exec(`kdeconnect-cli --ping-msg "OpenCode: ${message}"`),
  linux: (message) => exec(`kdeconnect-cli --ping-msg "OpenCode: ${message}"`)
};
function sendDesktop() {
  desktopCommands[platform]?.();
}
function sendPhone(message, debug) {
  if (GSCONNECT) {
    log("Using GSConnect", debug);
    exec(
      `sh -c '${GSCONNECT} -d $(${GSCONNECT} -a) --notification="OpenCode" --notification-appname="opencode" --notification-body="${message}" --notification-id="opencode"'`
    );
    return;
  }
  log(`Using ${platform === "darwin" ? "konnect" : "kdeconnect-cli"} (${platform})`, debug);
  phoneHandlers[platform]?.(message);
}
function notify(desktop, phone, debug) {
  log("NOTIFY triggered", debug);
  if (desktop) {
    sendDesktop();
  }
  if (phone) {
    sendPhone("Task completed", debug);
  }
}
var notify_default = (async (_, options) => {
  const desktop = options?.desktop !== false;
  const phone = options?.phone !== false;
  const debug = options?.debug === true;
  log(`Plugin loaded (${platform}${platform !== "linux" ? " - experimental" : ""})`, debug);
  const state = createNotificationState();
  return {
    event: async ({ event }) => {
      log(`Event: ${event.type} ${JSON.stringify(event)}`, debug);
      if (event.type !== "session.status" && event.type !== "session.error") {
        return;
      }
      if (event.type === "session.error") {
        state.markCancelled();
        return;
      }
      const status = event.properties.status.type;
      if (status === "busy") {
        state.reset();
        return;
      }
      if (shouldNotify(status, state)) {
        notify(desktop, phone, debug);
      }
    }
  };
});
export {
  notify_default as default
};
