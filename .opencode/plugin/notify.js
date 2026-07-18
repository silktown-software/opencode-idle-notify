// .opencode/plugin/notify.ts
import { exec } from "child_process";
import { appendFileSync } from "fs";

// core.ts
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

// .opencode/plugin/notify.ts
var LOG = "/tmp/opencode-notify.log";
function log(msg, debug) {
  if (debug) {
    appendFileSync(LOG, `${(/* @__PURE__ */ new Date()).toISOString()} ${msg}
`);
  }
}
var platform = process.platform;
var GSCONNECT = findGSConnect(platform);
function sendDesktop() {
  if (platform === "darwin") {
    exec(`osascript -e 'display notification "Task completed" with title "OpenCode"'`);
  } else if (platform === "win32") {
    exec(
      `powershell -Command "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null; [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null; $template = '<toast><visual><binding template="ToastGeneric"><text>OpenCode</text><text>Task completed</text></binding></visual></toast>'; $xml = New-Object Windows.Data.Xml.Dom.XmlDocument; $xml.LoadXml($template); $toast = [Windows.UI.Notifications.ToastNotification]::new($xml); [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('OpenCode').Show($toast)"`
    );
  } else {
    exec('notify-send "OpenCode" "Task completed"');
  }
}
function sendPhone(message, debug) {
  if (GSCONNECT) {
    log("Using GSConnect", debug);
    exec(
      `sh -c '${GSCONNECT} -d $(${GSCONNECT} -a) --notification="OpenCode" --notification-appname="opencode" --notification-body="${message}" --notification-id="opencode"'`
    );
  } else if (platform === "win32") {
    log("Using kdeconnect-cli (Windows)", debug);
    exec(`kdeconnect-cli --ping-msg "OpenCode: ${message}"`);
  } else if (platform === "darwin") {
    log("Using konnect (macOS)", debug);
    exec(`konnect notification --title "OpenCode" --text "${message}"`);
  } else {
    log("Using kdeconnect-cli (Linux)", debug);
    exec(`kdeconnect-cli --ping-msg "OpenCode: ${message}"`);
  }
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
      log(`Event: ${event.type} ${JSON.stringify(event.properties)}`, debug);
      const handlers = {
        "session.status": () => {
          const status = event.properties.status?.type;
          if (status === "busy") {
            state.reset();
          }
          if (shouldNotify(status, state)) {
            notify(desktop, phone, debug);
          }
        },
        "session.error": () => {
          state.markCancelled();
        }
      };
      handlers[event.type]?.();
    }
  };
});
export {
  notify_default as default
};
