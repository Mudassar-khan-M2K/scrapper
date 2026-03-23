const cron = require("node-cron");
const { fetchAllJobs } = require("./scraper");
const { formatSingleJob, getPKT } = require("./formatter");

// Your channel invite code (from whatsapp.com/channel/XXXXXX)
const CHANNEL_INVITE_CODE = "0029Vb7fEeo59PwPuRwAae2J";
const MSG_DELAY = 4000;

let task = null;
let running = false;
let channelJid = null; // will be resolved on first run

let botStats = {
  totalPosted: 0, govtPosted: 0, defencePosted: 0, privatePosted: 0,
  lastPost: null, nextPost: null, messagesHandled: 0,
};

function getBotStats() { return { ...botStats }; }

// ── Resolve real channel JID from invite code ─────────────────────────────────
async function resolveChannelJid(sock) {
  if (channelJid) return channelJid;
  try {
    const meta = await sock.newsletterMetadata("invite", CHANNEL_INVITE_CODE);
    channelJid = meta.id;
    console.log(`[Channel] ✅ Resolved JID: ${channelJid}`);
    return channelJid;
  } catch (err) {
    console.error("[Channel] Failed to resolve JID:", err.message);
    // Fallback: construct JID manually
    channelJid = CHANNEL_INVITE_CODE + "@newsletter";
    console.log(`[Channel] Using fallback JID: ${channelJid}`);
    return channelJid;
  }
}

// ── Post 1 job per message to channel ────────────────────────────────────────
async function postJobsToChannel(sock) {
  try {
    console.log(`[Scheduler] Fetching jobs at ${getPKT()}...`);
    const jid = await resolveChannelJid(sock);
    const jobs = await fetchAllJobs();
    if (!jobs || jobs.length === 0) return console.log("[Scheduler] No jobs found.");

    console.log(`[Scheduler] Posting ${jobs.length} jobs to ${jid}...`);

    for (const job of jobs) {
      try {
        const msg = formatSingleJob(job);
        await sock.sendMessage(jid, { text: msg });

        botStats.totalPosted++;
        if (job.category === "Defence") botStats.defencePosted++;
        else if (job.type === "Govt") botStats.govtPosted++;
        else botStats.privatePosted++;

        await new Promise(r => setTimeout(r, MSG_DELAY));
      } catch (err) {
        console.error(`[Scheduler] Job post failed: ${err.message}`);
        // If not-acceptable, reset JID so it resolves again next time
        if (err.message?.includes("not-acceptable") || err.message?.includes("forbidden")) {
          channelJid = null;
          console.log("[Channel] JID reset — will re-resolve next attempt");
          break;
        }
      }
    }

    botStats.lastPost = getPKT();
    console.log(`[Scheduler] ✅ Done! Posted to channel.`);

  } catch (err) {
    console.error("[Scheduler] Fatal error:", err.message);
  }
}

function startScheduler(sock) {
  if (running) return;
  running = true;

  // Resolve channel JID immediately
  resolveChannelJid(sock).then(() => {
    // First post after 10 seconds
    setTimeout(() => postJobsToChannel(sock).catch(console.error), 10000);
  });

  // Every 20 minutes
  task = cron.schedule("*/20 * * * *", () => {
    postJobsToChannel(sock).catch(console.error);
  }, { timezone: "Asia/Karachi" });

  console.log("[Scheduler] ✅ Started — every 20 minutes");
}

function stopScheduler() {
  if (task) { task.stop(); task = null; }
  running = false;
  channelJid = null;
}

module.exports = { startScheduler, stopScheduler, getBotStats };
