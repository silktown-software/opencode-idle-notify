import type { Plugin } from "@opencode-ai/plugin"
import { exec } from "child_process"
import { appendFileSync } from "fs"
import { findGSConnect, createNotificationState, shouldNotify } from "./core.js"

const LOG = "/tmp/opencode-notify.log"

function log(msg: string, debug: boolean) {
  if (debug) {
    appendFileSync(LOG, `${new Date().toISOString()} ${msg}\n`)
  }
}

const platform = process.platform
const GSCONNECT = findGSConnect(platform)

function sendDesktop() {
  if (platform === "darwin") {
    exec('osascript -e \'display notification "Task completed" with title "OpenCode"\'')
  } else if (platform === "win32") {
    exec(
      "powershell -Command \"[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null; [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null; $template = '<toast><visual><binding template=\"ToastGeneric\"><text>OpenCode</text><text>Task completed</text></binding></visual></toast>'; $xml = New-Object Windows.Data.Xml.Dom.XmlDocument; $xml.LoadXml($template); $toast = [Windows.UI.Notifications.ToastNotification]::new($xml); [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('OpenCode').Show($toast)\""
    )
  } else {
    exec('notify-send "OpenCode" "Task completed"')
  }
}

function sendPhone(message: string, debug: boolean) {
  if (GSCONNECT) {
    log("Using GSConnect", debug)
    exec(
      `sh -c '${GSCONNECT} -d $(${GSCONNECT} -a) --notification="OpenCode" --notification-appname="opencode" --notification-body="${message}" --notification-id="opencode"'`
    )
  } else if (platform === "win32") {
    log("Using kdeconnect-cli (Windows)", debug)
    exec(`kdeconnect-cli --ping-msg "OpenCode: ${message}"`)
  } else if (platform === "darwin") {
    log("Using konnect (macOS)", debug)
    exec(`konnect notification --title "OpenCode" --text "${message}"`)
  } else {
    log("Using kdeconnect-cli (Linux)", debug)
    exec(`kdeconnect-cli --ping-msg "OpenCode: ${message}"`)
  }
}

function notify(desktop: boolean, phone: boolean, debug: boolean) {
  log("NOTIFY triggered", debug)
  if (desktop) {
    sendDesktop()
  }
  if (phone) {
    sendPhone("Task completed", debug)
  }
}

export default (async (_, options) => {
  const desktop = options?.desktop !== false
  const phone = options?.phone !== false
  const debug = options?.debug === true

  log(`Plugin loaded (${platform}${platform !== "linux" ? " - experimental" : ""})`, debug)

  const state = createNotificationState()

  return {
    event: async ({ event }) => {
      log(`Event: ${event.type} ${JSON.stringify(event.properties)}`, debug)
      const handlers: Record<string, () => void> = {
        "session.status": () => {
          const status = event.properties.status?.type
          if (status === "busy") {
            state.reset()
          }
          if (shouldNotify(status, state)) {
            notify(desktop, phone, debug)
          }
        },
        "session.error": () => {
          state.markCancelled()
        },
      }

      handlers[event.type]?.()
    },
  }
}) satisfies Plugin
