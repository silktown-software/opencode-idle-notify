import type { Plugin } from "@opencode-ai/plugin";
import { exec } from "child_process";
import { appendFileSync } from "fs";
import { findGSConnect, createNotificationState, shouldNotify } from "./core.js";

const LOG = "/tmp/opencode-notify.log";

function log(msg: string, debug: boolean) {
  if (debug) {
    appendFileSync(LOG, `${new Date().toISOString()} ${msg}\n`);
  }
}

const platform = process.platform;
const GSCONNECT = findGSConnect(platform);

const desktopCommands: Record<string, () => void> = {
  darwin: () => exec('osascript -e \'display notification "Task completed" with title "OpenCode"\''),
  win32: () => exec(
    "powershell -Command \"[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null; [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null; $template = '<toast><visual><binding template=\"ToastGeneric\"><text>OpenCode</text><text>Task completed</text></binding></visual></toast>'; $xml = New-Object Windows.Data.Xml.Dom.XmlDocument; $xml.LoadXml($template); $toast = [Windows.UI.Notifications.ToastNotification]::new($xml); [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('OpenCode').Show($toast)\""
  ),
  linux: () => exec('notify-send "OpenCode" "Task completed"'),
};

const phoneHandlers: Record<string, (message: string) => void> = {
  darwin: (message) => exec(`konnect notification --title "OpenCode" --text "${message}"`),
  win32: (message) => exec(`kdeconnect-cli --ping-msg "OpenCode: ${message}"`),
  linux: (message) => exec(`kdeconnect-cli --ping-msg "OpenCode: ${message}"`),
};

function sendDesktop() {
  desktopCommands[platform]?.();
}

function sendPhone(message: string, debug: boolean) {
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

function notify(desktop: boolean, phone: boolean, debug: boolean) {
  log("NOTIFY triggered", debug);
  if (desktop) {
    sendDesktop();
  }
  if (phone) {
    sendPhone("Task completed", debug);
  }
}

export default (async (_, options) => {
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
    },
  };
}) satisfies Plugin;
