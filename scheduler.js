const cron = require("node-cron");
const { fetchAllJobs } = require("./scraper");
const { formatChannelPost, updateStats, getPKT } = require("./formatter");

// ── Your channel JID ──────────────────────────────────────────────────────────
const CHANNEL_JID = "0029Vb7fEeo59PwPuRwAae2J@newsletter";

let task = null;
let running = false;
let botSock = null;

async function postToChannel(sock) {
  try {
    console.log(`[Scheduler] Fetching jobs at ${getPKT()}...`);
    const jobs = await fetchAllJobs();
    if (!jobs || jobs.length === 0) {
      console.log("[Scheduler] No jobs found.");
      return;
    }
    updateStats(jobs);
    const msg = formatChannelPost(jobs);

    // ── Try newsletter (channel) first ───────────────────────────────────────
    try {
      await sock.sendMessage(CHANNEL_JID, { text: msg });
      console.log(`[Scheduler] ✅ Posted ${jobs.length} jobs to channel`);
    } catch (err) {
      console.error("[Scheduler] Channel post failed:", err.message);
      // Try sending to bot's own number as fallback (for debugging)
      try {
        const botJid = sock.user?.id;
        if (botJid) {
          await sock.sendMessage(botJid, { text: `[DEBUG] Channel post failed: ${err.message}\n\n${msg}` });
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error("[Scheduler] Error:", err.message);
  }
}

function startScheduler(sock) {
  if (running) return;
  running = true;
  botSock = sock;

  // First post immediately
  postToChannel(sock).catch(console.error);

  // Every 20 minutes
  task = cron.schedule("*/20 * * * *", () => {
    postToChannel(sock).catch(console.error);
  }, { timezone: "Asia/Karachi" });

  console.log("[Scheduler] Running — every 20 minutes");
}

function stopScheduler() {
  if (task) { task.stop(); task = null; }
  running = false;
}

module.exports = { startScheduler, stopScheduler, postToChannel };
