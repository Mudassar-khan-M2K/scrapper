const cron = require("node-cron");
const { fetchAllJobs } = require("./scraper");
const { formatSingleJob, getPKT } = require("./formatter");

// ── Channel JID (confirmed by Wasi developer) ─────────────────────────────────
const CHANNEL_JID = "120363425538472027@newsletter";
const MSG_DELAY = 4000;

let task = null;
let running = false;

let botStats = {
  totalPosted: 0, govtPosted: 0, defencePosted: 0, privatePosted: 0,
  lastPost: null, messagesHandled: 0,
};

function getBotStats() { return { ...botStats }; }

async function postJobsToChannel(sock) {
  try {
    console.log(`[Scheduler] Fetching jobs at ${getPKT()}...`);
    const jobs = await fetchAllJobs();
    if (!jobs || jobs.length === 0) return console.log("[Scheduler] No jobs.");

    console.log(`[Scheduler] Posting ${jobs.length} jobs to channel...`);

    for (const job of jobs) {
      try {
        await sock.sendMessage(CHANNEL_JID, { text: formatSingleJob(job) });
        botStats.totalPosted++;
        if (job.category === "Defence") botStats.defencePosted++;
        else if (job.type === "Govt") botStats.govtPosted++;
        else botStats.privatePosted++;
        await new Promise(r => setTimeout(r, MSG_DELAY));
      } catch (err) {
        console.error(`[Job Post Failed] ${job.title}: ${err.message}`);
      }
    }

    botStats.lastPost = getPKT();
    console.log(`[Scheduler] ✅ Done!`);
  } catch (err) {
    console.error("[Scheduler] Error:", err.message);
  }
}

function startScheduler(sock) {
  if (running) return;
  running = true;

  // First post after 15 seconds
  setTimeout(() => postJobsToChannel(sock).catch(console.error), 15000);

  // Every 20 minutes
  task = cron.schedule("*/20 * * * *", () => {
    postJobsToChannel(sock).catch(console.error);
  }, { timezone: "Asia/Karachi" });

  console.log("[Scheduler] ✅ Started — every 20 minutes to channel");
}

function stopScheduler() {
  if (task) { task.stop(); task = null; }
  running = false;
}

module.exports = { startScheduler, stopScheduler, getBotStats };
