const cron = require("node-cron");
const { fetchAllJobs } = require("./scraper");
const { formatChannelPost, updateStats, getPKT } = require("./formatter");

const CHANNEL_JID = "0029Vb7fEeo59PwPuRwAae2J@newsletter";

let task = null;
let running = false;

async function postToChannel(sock) {
  try {
    console.log(`[Scheduler] Fetching jobs at ${getPKT()}...`);
    const jobs = await fetchAllJobs();
    if (!jobs || jobs.length === 0) return console.log("[Scheduler] No jobs to post.");
    updateStats(jobs);
    const msg = formatChannelPost(jobs);
    await sock.sendMessage(CHANNEL_JID, { text: msg });
    console.log(`[Scheduler] ✅ Posted ${jobs.length} jobs to channel`);
  } catch (err) {
    console.error("[Scheduler] Error:", err.message);
  }
}

function startScheduler(sock) {
  if (running) return;
  running = true;

  // First post immediately
  postToChannel(sock).catch(console.error);

  // Then every 20 minutes
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
