const cron = require("node-cron");
const { fetchAllJobs } = require("./scraper");
const { formatSingleJob, getPKT } = require("./formatter");

const CHANNEL_JID = "0029Vb7fEeo59PwPuRwAae2J@newsletter";
const MSG_DELAY = 3000; // 3 seconds between each job message

let task = null;
let running = false;
let jobQueue = [];
let botStats = {
  totalPosted: 0,
  govtPosted: 0,
  defencePosted: 0,
  privatePosted: 0,
  lastPost: null,
  nextPost: null,
  messagesHandled: 0,
  channelName: "Pakistan Jobs Bot",
};

function getBotStats() { return { ...botStats }; }

// ── Post each job as separate message to channel ──────────────────────────────
async function postJobsToChannel(sock) {
  try {
    console.log(`[Scheduler] Fetching jobs at ${getPKT()}...`);
    const jobs = await fetchAllJobs();
    if (!jobs || jobs.length === 0) return console.log("[Scheduler] No jobs.");

    console.log(`[Scheduler] Posting ${jobs.length} jobs — 1 per message...`);

    for (const job of jobs) {
      try {
        const msg = formatSingleJob(job);
        await sock.sendMessage(CHANNEL_JID, { text: msg });

        // Update stats
        botStats.totalPosted++;
        if (job.category === "Defence") botStats.defencePosted++;
        else if (job.type === "Govt") botStats.govtPosted++;
        else botStats.privatePosted++;

        // Wait between messages to avoid spam
        await new Promise(r => setTimeout(r, MSG_DELAY));
      } catch (err) {
        console.error(`[Scheduler] Failed to post "${job.title}":`, err.message);
      }
    }

    botStats.lastPost = getPKT();
    console.log(`[Scheduler] ✅ Done! Posted ${jobs.length} jobs to channel`);

  } catch (err) {
    console.error("[Scheduler] Error:", err.message);
  }
}

function startScheduler(sock) {
  if (running) return;
  running = true;

  // Post immediately on start
  postJobsToChannel(sock).catch(console.error);

  // Every 20 minutes
  task = cron.schedule("*/20 * * * *", () => {
    botStats.nextPost = "In 20 minutes";
    postJobsToChannel(sock).catch(console.error);
  }, { timezone: "Asia/Karachi" });

  console.log("[Scheduler] ✅ Started — 1 job per message, every 20 minutes");
}

function stopScheduler() {
  if (task) { task.stop(); task = null; }
  running = false;
}

module.exports = { startScheduler, stopScheduler, getBotStats };
