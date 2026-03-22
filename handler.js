const { fetchAllJobs, fetchGovtJobs, fetchPrivateJobs, fetchNJP, fetchPunjab, fetchFPSC } = require("./scraper");
const { buildMenu, formatJobList, pingResponse, timeResponse, statsResponse, aboutResponse, updateStats, stats } = require("./formatter");

async function handleMessage(sock, msg, getUptime) {
  stats.messages++;
  const jid = msg.key.remoteJid;
  const text = (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    ""
  ).trim().toLowerCase();

  if (!text) return;

  await sock.sendPresenceUpdate("composing", jid);

  try {
    // ── Menu triggers ────────────────────────────────────────────────────────
    if (["hi","hello","helo","hey","menu","start","salam","assalam","help","/start","/menu","!help","!menu","menu"].includes(text)) {
      return await sock.sendMessage(jid, { text: buildMenu() });
    }

    // ── Number selections ─────────────────────────────────────────────────────
    if (text === "1") {
      await sock.sendMessage(jid, { text: "⏳ *Govt jobs fetch ho rahi hain...*\nThoda wait karein! 🙏" });
      const jobs = await fetchGovtJobs();
      updateStats(jobs);
      return await sock.sendMessage(jid, { text: formatJobList(jobs, "Government Jobs", "🏛️") });
    }

    if (text === "2") {
      await sock.sendMessage(jid, { text: "⏳ *Private jobs fetch ho rahi hain...*\nThoda wait karein! 🙏" });
      const jobs = await fetchPrivateJobs();
      updateStats(jobs);
      return await sock.sendMessage(jid, { text: formatJobList(jobs, "Private Jobs", "🏢") });
    }

    if (text === "3") {
      await sock.sendMessage(jid, { text: "⏳ *Punjab jobs fetch ho rahi hain...*" });
      const jobs = await fetchPunjab();
      updateStats(jobs);
      return await sock.sendMessage(jid, { text: formatJobList(jobs, "Punjab Government Jobs", "🌿") });
    }

    if (text === "4") {
      await sock.sendMessage(jid, { text: "⏳ *NJP jobs fetch ho rahi hain...*" });
      const jobs = await fetchNJP();
      updateStats(jobs);
      return await sock.sendMessage(jid, { text: formatJobList(jobs, "NJP — National Job Portal", "📌") });
    }

    if (text === "5") {
      await sock.sendMessage(jid, { text: "⏳ *FPSC jobs fetch ho rahi hain...*" });
      const jobs = await fetchFPSC();
      updateStats(jobs);
      return await sock.sendMessage(jid, { text: formatJobList(jobs, "FPSC — Federal Jobs", "⚖️") });
    }

    if (text === "6") {
      await sock.sendMessage(jid, { text: "⏳ *Sari jobs fetch ho rahi hain...*\nThoda zyada time lagega! 🙏" });
      const jobs = await fetchAllJobs();
      updateStats(jobs);
      return await sock.sendMessage(jid, { text: formatJobList(jobs, "All Pakistan Jobs Today", "🇵🇰") });
    }

    // ── Commands ──────────────────────────────────────────────────────────────
    if (["!ping","ping"].includes(text)) {
      return await sock.sendMessage(jid, { text: pingResponse(getUptime()) });
    }

    if (["!time","time"].includes(text)) {
      return await sock.sendMessage(jid, { text: timeResponse() });
    }

    if (["!stats","stats"].includes(text)) {
      return await sock.sendMessage(jid, { text: statsResponse() });
    }

    if (["!about","about"].includes(text)) {
      return await sock.sendMessage(jid, { text: aboutResponse() });
    }

    // ── Default ───────────────────────────────────────────────────────────────
    await sock.sendMessage(jid, { text: `❓ *Samajh nahi aaya!*\n\n${buildMenu()}` });

  } finally {
    await sock.sendPresenceUpdate("available", jid);
  }
}

module.exports = { handleMessage };
