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

  delay,
} = require("@whiskeysockets/baileys");

const { handleMessage } = require("./handler");
const { startScheduler, stopScheduler, getBotStats } = require("./scheduler");

// ─────────────────────────────────────────────────────────────────────────────
// EXPRESS DASHBOARD SERVER
// ─────────────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

app.get("/api/stats", (_, res) => {
  const s = getBotStats();
    const { stats: fmtStats } = require("./formatter");
    s.messagesHandled = fmtStats.messages;
  res.json({
    status: botConnected ? "online" : "offline",
    uptime: getUptime(),
    ...s,
    startTime: new Date(startTime).toISOString(),
    phone: process.env.PHONE_NUMBER || "923347726270",
    channel: "0029Vb7fEeo59PwPuRwAae2J",
  });
});

app.get("/health", (_, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.listen(process.env.PORT || 3000, () =>
  console.log(`[Dashboard] Running on port ${process.env.PORT || 3000}`)
);

// ─────────────────────────────────────────────────────────────────────────────
// SESSION RESTORE
// ─────────────────────────────────────────────────────────────────────────────
const AUTH_DIR = "/tmp/auth_info";

function restoreSession() {
  const SESSION_ID = process.env.SESSION_ID;
  if (!SESSION_ID) { console.error("[Session] No SESSION_ID!"); return false; }
  try {
    if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
    const raw = SESSION_ID.includes("~") ? SESSION_ID.split("~").slice(1).join("~") : SESSION_ID;
    const buffer = Buffer.from(raw, "base64");
    const isGzip = buffer[0] === 0x1f && buffer[1] === 0x8b;
    const decoded = isGzip ? zlib.gunzipSync(buffer).toString("utf-8") : buffer.toString("utf-8");
    const parsed = JSON.parse(decoded);
    if (parsed["creds.json"]) {
      for (const [f, c] of Object.entries(parsed)) fs.writeFileSync(path.join(AUTH_DIR, f), c, "utf-8");
      console.log(`[Session] ✅ Restored ${Object.keys(parsed).length} files`);
    } else {
      fs.writeFileSync(path.join(AUTH_DIR, "creds.json"), JSON.stringify(parsed), "utf-8");
      console.log("[Session] ✅ Restored creds.json");
    }
    return true;
  } catch (err) { console.error("[Session] Failed:", err.message); return false; }
}

// ─────────────────────────────────────────────────────────────────────────────
// BOT STATE
// ─────────────────────────────────────────────────────────────────────────────
let botConnected = false;
let reconnectCount = 0;
const startTime = Date.now();

function getUptime() {
  const sec = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

// ─────────────────────────────────────────────────────────────────────────────
// START BOT
// ─────────────────────────────────────────────────────────────────────────────
async function startBot() {
  try {
    if (!fs.existsSync(path.join(AUTH_DIR, "creds.json"))) {
      const ok = restoreSession();
      if (!ok) { console.error("[Bot] No session. Exiting."); return; }
    }

    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const logger = pino({ level: "silent" });

    const sock = makeWASocket({
      version, logger,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      browser: ["Linux", "Chrome", "20.0.00"],
      defaultQueryTimeoutMs: undefined,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      syncFullHistory: false,
      emitOwnEvents: true,
      fireInitQueries: true,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: false,
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "connecting") console.log("[Bot] Connecting...");
      if (connection === "open") {
        console.log("[Bot] ✅ WhatsApp Connected!");
        botConnected = true;
        reconnectCount = 0;
        setTimeout(() => startScheduler(sock), 30000);
      }
      if (connection === "close") {
        botConnected = false;
        stopScheduler();
        const code = lastDisconnect?.error?.output?.statusCode;
        console.log(`[Bot] Disconnected — code: ${code}`);
        if (code === DisconnectReason.loggedOut) {
          try { fs.rmSync(AUTH_DIR, { recursive: true, force: true }); } catch (_) {}
          restoreSession();
          await delay(5000);
          startBot();
        } else {
          reconnectCount++;
          setTimeout(startBot, Math.min(5000 * reconnectCount, 30000));
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      
      for (const msg of messages) {
        try {
          
          if (msg.key.remoteJid === "status@broadcast") continue;
          if (msg.key.remoteJid?.endsWith("@newsletter")) continue;
          await handleMessage(sock, msg, getUptime);
        } catch (err) {
          console.error("[Messages]", err.message);
        }
      }
    });

  } catch (err) {
    console.error("[Bot] Fatal:", err.message);
    reconnectCount++;
    setTimeout(startBot, Math.min(5000 * reconnectCount, 30000));
  }
}

console.log("🇵🇰 Pakistan Jobs Bot v4.0 — Starting...");
restoreSession();
startBot();
// getMessage stub for message retry
