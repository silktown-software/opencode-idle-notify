import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { findGSConnect, createNotificationState, shouldNotify, GSCONNECT_PATHS } from "./core.js";

describe("findGSConnect", () => {
  it("returns undefined on non-linux platforms", () => {
    assert.equal(findGSConnect("darwin"), undefined);
    assert.equal(findGSConnect("win32"), undefined);
  });

  it("returns path when it exists on linux", () => {
    const exists = (p: string | Buffer | URL) => p === GSCONNECT_PATHS.linux;
    assert.equal(findGSConnect("linux", GSCONNECT_PATHS, exists), GSCONNECT_PATHS.linux);
  });

  it("returns local path when global does not exist", () => {
    const exists = (p: string | Buffer | URL) => p === GSCONNECT_PATHS.linuxLocal;
    assert.equal(findGSConnect("linux", GSCONNECT_PATHS, exists), GSCONNECT_PATHS.linuxLocal);
  });

  it("returns undefined when no paths exist", () => {
    const exists = () => false;
    assert.equal(findGSConnect("linux", GSCONNECT_PATHS, exists), undefined);
  });
});

describe("createNotificationState", () => {
  it("starts with cancelled false", () => {
    const state = createNotificationState();
    assert.equal(state.cancelled, false);
  });

  it("marks as cancelled", () => {
    const state = createNotificationState();
    state.markCancelled();
    assert.equal(state.cancelled, true);
  });

  it("resets cancelled state", () => {
    const state = createNotificationState();
    state.markCancelled();
    state.reset();
    assert.equal(state.cancelled, false);
  });
});

describe("shouldNotify", () => {
  it("returns false when status is busy", () => {
    const state = createNotificationState();
    assert.equal(shouldNotify("busy", state), false);
  });

  it("returns true when idle and not cancelled", () => {
    const state = createNotificationState();
    assert.equal(shouldNotify("idle", state), true);
  });

  it("returns false when idle and cancelled", () => {
    const state = createNotificationState();
    state.markCancelled();
    assert.equal(shouldNotify("idle", state), false);
  });

  it("returns false for unknown status", () => {
    const state = createNotificationState();
    assert.equal(shouldNotify("unknown", state), false);
  });

  it("returns false for undefined status", () => {
    const state = createNotificationState();
    assert.equal(shouldNotify(undefined, state), false);
  });
});
