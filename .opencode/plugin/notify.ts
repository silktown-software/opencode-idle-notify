import type { Plugin } from "@opencode-ai/plugin"
import { exec } from "child_process"
import { existsSync, appendFileSync } from "fs"

const LOG = "/tmp/opencode-notify.log"

function log(msg: string, debug: boolean) {
  if (debug) {
    appendFileSync(LOG, `${new Date().toISOString()} ${msg}\n`)
  }
}

const GSCONNECT_PATHS = [
  "/usr/share/gnome-shell/extensions/gsconnect@andyholmes.github.io/service/daemon.js",
  `${process.env.HOME}/.local/share/gnome-shell/extensions/gsconnect@andyholmes.github.io/service/daemon.js`,
]

const GSCONNECT = GSCONNECT_PATHS.find(existsSync)

function sendPhone(message: string) {
  if (GSCONNECT) {
    exec(
      `sh -c '${GSCONNECT} -d $(${GSCONNECT} -a) --notification="OpenCode" --notification-appname="opencode" --notification-body="${message}" --notification-id="opencode"'`
    )
  } else {
    exec(`kdeconnect-cli --ping-msg "OpenCode: ${message}"`)
  }
}

function notify(desktop: boolean, phone: boolean, debug: boolean) {
  log("NOTIFY triggered", debug)
  if (desktop) {
    exec('notify-send "OpenCode" "Task completed"')
  }
  if (phone) {
    sendPhone("Task completed")
  }
}

export default (async (_, options) => {
  const desktop = options?.desktop !== false
  const phone = options?.phone !== false
  const debug = options?.debug === true

  log("Plugin loaded", debug)

  let cancelled = false

  return {
    event: async ({ event }) => {
      log(`Event: ${event.type} ${JSON.stringify(event.properties)}`, debug)
      const handlers: Record<string, () => void> = {
        "session.status": () => {
          const status = event.properties.status?.type
          if (status === "busy") {
            cancelled = false
          }
          if (status === "idle" && !cancelled) {
            notify(desktop, phone, debug)
          }
        },
        "session.error": () => {
          cancelled = true
        },
      }

      handlers[event.type]?.()
    },
  }
}) satisfies Plugin
