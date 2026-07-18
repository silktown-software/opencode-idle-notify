import { existsSync } from "fs";

export const GSCONNECT_PATHS: Record<string, string> = {
  linux: "/usr/share/gnome-shell/extensions/gsconnect@andyholmes.github.io/service/daemon.js",
  linuxLocal: `${process.env.HOME}/.local/share/gnome-shell/extensions/gsconnect@andyholmes.github.io/service/daemon.js`,
};

export function findGSConnect(platform: string, paths = GSCONNECT_PATHS, exists = existsSync): string | undefined {
  if (platform !== "linux") {
    return undefined;
  }
  const candidates = [paths.linux, paths.linuxLocal];
  return candidates.find(exists);
}

export function createNotificationState() {
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
    },
  };
}

export function shouldNotify(status: string | undefined, state: { cancelled: boolean }): boolean {
  if (status === "busy") {
    return false;
  }
  if (status === "idle" && !state.cancelled) {
    return true;
  }
  return false;
}
