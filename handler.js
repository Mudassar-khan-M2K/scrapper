const {
  fetchAllJobs, fetchGovtJobs, fetchDefenceJobs, fetchPrivateJobs,
  fetchNJP, fetchPunjab, fetchFPSC, fetchPAF, fetchArmy, fetchNavy,
  fetchNADRA, fetchAtomic, fetchANF, fetchRozee, fetchEngro, fetchPSO, fetchMustakbil,
  filterByEducation,
} = require("./scraper");
const { buildMenu, formatJobList, pingResponse, timeResponse, statsResponse, aboutResponse, stats } = require("./formatter");
const { getBotStats } = require("./scheduler");

const VALID_CMDS = new Set([
  "!help","!menu","!all","!govt","!defence","!private",
  "!njp","!punjab","!fpsc","!nadra","!atomic","!paec",
  "!army","!navy","!paf","!anf",
  "!rozee","!engro","!pso","!mustakbil",
  "!matric","!inter","!bs","!ms",
  "!ping","!time","!stats","!about",
  "menu","help","hi","hello","salam","jobs","start",
]);

async function handleMessage(sock, msg, getUptime) {
  const jid = msg.key.remoteJid;
  const isGroup = jid?.endsWith("@g.us");

  const body = (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption || ""
  ).trim();

  if (!body) return;
  const cmd = body.toLowerCase();

  // ── Only respond to valid commands — no random text ───────────────────────
  const isValid = VALID_CMDS.has(cmd) || cmd.startsWith("!");
  if (!isValid) return;

  stats.messages++;
  await sock.sendPresenceUpdate("composing", jid);

  async function send(text) { await sock.sendMessage(jid, { text }); }

  async function fetchAndSend(fetchFn, title, emoji) {
    await send(`⏳ *${title} fetch ho rahi hain...*\nEk second! 🙏`);
    const jobs = await fetchFn();
    await send(formatJobList(jobs, title, emoji));
  }

  try {
    switch (cmd) {
      case "!help": case "!menu": case "menu": case "help":
      case "hi": case "hello": case "salam": case "jobs": case "start":
        return await send(buildMenu());

      case "!all":
        return await fetchAndSend(fetchAllJobs, "Aaj Ki Tamam Jobs", "🇵🇰");
      case "!govt":
        return await fetchAndSend(fetchGovtJobs, "Sarkari Jobs", "🏛️");
      case "!njp":
        return await fetchAndSend(fetchNJP, "NJP Jobs", "📌");
      case "!punjab":
        return await fetchAndSend(fetchPunjab, "Punjab Govt Jobs", "🌿");
      case "!fpsc":
        return await fetchAndSend(fetchFPSC, "FPSC Jobs", "⚖️");
      case "!nadra":
        return await fetchAndSend(fetchNADRA, "NADRA Jobs", "🪪");
      case "!atomic": case "!paec":
        return await fetchAndSend(fetchAtomic, "PAEC Atomic Jobs", "⚛️");
      case "!defence":
        return await fetchAndSend(fetchDefenceJobs, "Defence Jobs", "⚔️");
      case "!army":
        return await fetchAndSend(fetchArmy, "Pakistan Army Jobs", "🪖");
      case "!navy":
        return await fetchAndSend(fetchNavy, "Pakistan Navy Jobs", "⚓");
      case "!paf":
        return await fetchAndSend(fetchPAF, "Pakistan Air Force Jobs", "✈️");
      case "!anf":
        return await fetchAndSend(fetchANF, "ANF Jobs", "🚔");
      case "!private":
        return await fetchAndSend(fetchPrivateJobs, "Private Jobs", "🏢");
      case "!rozee":
        return await fetchAndSend(fetchRozee, "Rozee.pk Jobs", "💼");
      case "!engro":
        return await fetchAndSend(fetchEngro, "Engro Jobs", "🏭");
      case "!pso":
        return await fetchAndSend(fetchPSO, "PSO Jobs", "⛽");
      case "!mustakbil":
        return await fetchAndSend(fetchMustakbil, "Mustakbil Jobs", "🔍");

      case "!matric": {
        await send("⏳ *Matric pass jobs dhundh raha hoon...*");
        const jobs = filterByEducation(await fetchAllJobs(), "matric");
        return await send(formatJobList(jobs.length ? jobs : (await fetchAllJobs()).slice(0,5), "Matric Jobs", "📚"));
      }
      case "!inter": {
        await send("⏳ *Intermediate jobs dhundh raha hoon...*");
        const jobs = filterByEducation(await fetchAllJobs(), "inter");
        return await send(formatJobList(jobs.length ? jobs : (await fetchAllJobs()).slice(0,5), "Intermediate Jobs", "📗"));
      }
      case "!bs": {
        await send("⏳ *BS/BA degree jobs dhundh raha hoon...*");
        const jobs = filterByEducation(await fetchAllJobs(), "bs");
        return await send(formatJobList(jobs.length ? jobs : (await fetchAllJobs()).slice(0,5), "BS/BA Jobs", "🎓"));
      }
      case "!ms": {
        await send("⏳ *MS/MBA jobs dhundh raha hoon...*");
        const jobs = filterByEducation(await fetchAllJobs(), "ms");
        return await send(formatJobList(jobs.length ? jobs : (await fetchAllJobs()).slice(0,5), "MS/MBA Jobs", "👨‍🎓"));
      }

      case "!ping":
        return await send(pingResponse(getUptime()));
      case "!time":
        return await send(timeResponse());
      case "!stats":
        return await send(statsResponse(getBotStats()));
      case "!about":
        return await send(aboutResponse());

      default:
        if (!isGroup) await send(`❓ *"${body}" samajh nahi aaya!*\n\n${buildMenu()}`);
    }
  } finally {
    await sock.sendPresenceUpdate("available", jid);
  }
}

module.exports = { handleMessage };
