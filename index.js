require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const pino = require("pino");
const zlib = require("zlib");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  Browsers,
  delay,
} = require("@whiskeysockets/baileys");

const { handleMessage } = require("./handler");
const { startScheduler, stopScheduler } = require("./scheduler");

// ── Express keep-alive ────────────────────────────────────────────────────────
const app = express();
app.get("/", (_, res) => res.send("🇵🇰 Pakistan Jobs Bot is ALIVE!"));
app.get("/health", (_, res) => res.json({ status: "ok", uptime: process.uptime() }));
app.listen(process.env.PORT || 3000, () =>
  console.log(`[Server] Keep-alive on port ${process.env.PORT || 3000}`)
);

const AUTH_DIR = "/tmp/auth_info";

// ── Restore session — handles both gzip and plain base64 ──────────────────────
function restoreSession() {
  const SESSION_ID = process.env.SESSION_ID;
  if (!SESSION_ID) {
    console.error("[Session] No SESSION_ID in environment!");
    return false;
  }

  try {
    if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

    // Strip prefix like "Gifted~" or "ARSLAN-MD~"
    const raw = SESSION_ID.includes("~") ? SESSION_ID.split("~").slice(1).join("~") : SESSION_ID;
    const buffer = Buffer.from(raw, "base64");

    // Detect gzip magic bytes: 0x1f 0x8b
    const isGzip = buffer[0] === 0x1f && buffer[1] === 0x8b;

    let decoded;
    if (isGzip) {
      console.log("[Session] Detected gzip compressed session...");
      decoded = zlib.gunzipSync(buffer).toString("utf-8");
    } else {
      decoded = buffer.toString("utf-8");
    }

    const parsed = JSON.parse(decoded);

    // Multi-file format: { "creds.json": "...", "app-state-...": "..." }
    if (parsed["creds.json"]) {
      for (const [filename, content] of Object.entries(parsed)) {
        fs.writeFileSync(path.join(AUTH_DIR, filename), content, "utf-8");
      }
      console.log(`[Session] ✅ Restored ${Object.keys(parsed).length} session files`);
      return true;
    }

    // Single creds.json format
    fs.writeFileSync(path.join(AUTH_DIR, "creds.json"), JSON.stringify(parsed), "utf-8");
    console.log("[Session] ✅ Restored creds.json");
    return true;

  } catch (err) {
    console.error("[Session] Restore failed:", err.message);
    return false;
  }
}

// ── Bot state ─────────────────────────────────────────────────────────────────
let reconnectCount = 0;
const startTime = Date.now();

function getUptime() {
  const sec = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

// ── Start bot ─────────────────────────────────────────────────────────────────
async function startBot() {
  try {
    if (!fs.existsSync(path.join(AUTH_DIR, "creds.json"))) {
      const ok = restoreSession();
      if (!ok) { console.error("[Bot] No valid session. Exiting."); return; }
    }

    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const logger = pino({ level: "silent" });

    const sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      browser: Browsers.macOS("Chrome"),
      defaultQueryTimeoutMs: undefined,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "connecting") console.log("[Bot] Connecting...");

      if (connection === "open") {
        console.log("[Bot] ✅ WhatsApp Connected!");
        reconnectCount = 0;
        setTimeout(() => {
          startScheduler(sock);
          console.log("[Scheduler] ✅ Started!");
        }, 30000);
      }

      if (connection === "close") {
        stopScheduler();
        const code = lastDisconnect?.error?.output?.statusCode;
        console.log(`[Bot] Disconnected — code: ${code}`);
        if (code === DisconnectReason.loggedOut) {
          console.log("[Bot] Logged out — restoring from SESSION_ID...");
          try { fs.rmSync(AUTH_DIR, { recursive: true, force: true }); } catch (_) {}
          restoreSession();
          await delay(5000);
          startBot();
        } else {
          reconnectCount++;
          const wait = Math.min(5000 * reconnectCount, 30000);
          console.log(`[Bot] Reconnecting in ${wait / 1000}s...`);
          setTimeout(startBot, wait);
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        try {
          if (msg.key.fromMe) continue;
          if (msg.key.remoteJid?.endsWith("@g.us")) continue;
          if (msg.key.remoteJid === "status@broadcast") continue;
          if (msg.key.remoteJid?.endsWith("@newsletter")) continue;
          await handleMessage(sock, msg, getUptime);
        } catch (err) {
          console.error("[Messages] Error:", err.message);
        }
      }
    });

  } catch (err) {
    console.error("[Bot] Fatal:", err.message);
    reconnectCount++;
    setTimeout(startBot, Math.min(5000 * reconnectCount, 30000));
  }
}

console.log("🇵🇰 Pakistan Jobs Bot — Starting...");
restoreSession();
startBot();
