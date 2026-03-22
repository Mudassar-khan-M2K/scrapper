require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const pino = require("pino");
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

// ── Session restore from SESSION_ID env var ───────────────────────────────────
const AUTH_DIR = "/tmp/auth_info";

function restoreSession() {
  const SESSION_ID = process.env.SESSION_ID;
  if (!SESSION_ID) {
    console.log("[Session] No SESSION_ID found in env vars!");
    return false;
  }

  try {
    // Handle both formats: "Gifted~base64data" or plain base64
    const raw = SESSION_ID.includes("~") ? SESSION_ID.split("~")[1] : SESSION_ID;
    const decoded = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));

    if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

    // If decoded has file keys (our format)
    if (typeof decoded === "object" && decoded["creds.json"]) {
      for (const [filename, content] of Object.entries(decoded)) {
        fs.writeFileSync(path.join(AUTH_DIR, filename), content, "utf-8");
      }
      console.log("[Session] ✅ Multi-file session restored from SESSION_ID");
      return true;
    }

    // If decoded is creds.json directly (Arslan/Gifted format)
    fs.writeFileSync(path.join(AUTH_DIR, "creds.json"), JSON.stringify(decoded), "utf-8");
    console.log("[Session] ✅ Single creds.json restored from SESSION_ID");
    return true;
  } catch (err) {
    console.error("[Session] Failed to restore session:", err.message);
    return false;
  }
}

// ── Bot state ─────────────────────────────────────────────────────────────────
let botSocket = null;
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
    // Restore session on every startup
    if (!fs.existsSync(path.join(AUTH_DIR, "creds.json"))) {
      const restored = restoreSession();
      if (!restored) {
        console.error("[Bot] Cannot start — no SESSION_ID in environment!");
        return;
      }
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

    botSocket = sock;

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "connecting") {
        console.log("[Bot] Connecting to WhatsApp...");
      }

      if (connection === "open") {
        console.log("[Bot] ✅ Connected to WhatsApp!");
        reconnectCount = 0;

        // Start scheduler 30s after connect
        setTimeout(() => {
          startScheduler(sock);
          console.log("[Scheduler] ✅ Started — posting every 20 minutes");
        }, 30000);
      }

      if (connection === "close") {
        stopScheduler();
        const code = lastDisconnect?.error?.output?.statusCode;
        console.log(`[Bot] Disconnected — code: ${code}`);

        if (code === DisconnectReason.loggedOut) {
          console.log("[Bot] Logged out. Restoring session from SESSION_ID...");
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
    console.error("[Bot] Fatal error:", err.message);
    reconnectCount++;
    setTimeout(startBot, Math.min(5000 * reconnectCount, 30000));
  }
}

console.log("🇵🇰 Pakistan Jobs Bot — Starting...");
restoreSession();
startBot();

module.exports = { getUptime };
