function getPKT() {
  return new Date().toLocaleString("en-PK", {
    timeZone: "Asia/Karachi", weekday: "short", year: "numeric",
    month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

const stats = { messages: 0 };

// ── Single job — very detailed — for channel (1 job = 1 message) ──────────────
function formatSingleJob(job) {
  const typeIcon =
    job.category === "Defence" ? "⚔️" :
    job.type === "Govt" ? "🏛️" : "🏢";

  const typeBadge =
    job.category === "Defence" ? "DEFENCE JOB" :
    job.type === "Govt" ? "SARKARI JOB" : "PRIVATE JOB";

  return `${typeIcon} *${typeBadge}* ${typeIcon}
━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 *Post:* ${job.title}
🏢 *Organization:* ${job.org}
📍 *Location:* ${job.location}
🎓 *Education:* ${job.education}
👥 *Gender:* ${job.gender || "Male / Female"}
📋 *Requirements:* ${job.requirements || "As per advertisement"}
📅 *Last Date:* *${job.deadline}*
📌 *Source:* ${job.source}

🔗 *Apply Here:*
${job.link}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 _Pakistan Jobs Bot v4.0_
🇵🇰 _Developed by Mudassar Khan_
📲 _+92 347 7262704_
🔔 _Har 20 minute mein naye jobs!_`;
}

// ── Menu ──────────────────────────────────────────────────────────────────────
function buildMenu() {
  return `╔══════════════════════════════════╗
║  🇵🇰  *PAKISTAN JOBS BOT v4.0* 🤖  ║
║   *Developed by Mudassar Khan*    ║
║      📲 +92 347 7262704           ║
╚══════════════════════════════════╝

*Assalam o Alaikum!* 👋
Rozana naye *Govt + Defence + Private* jobs!

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ *SARKARI JOBS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
!govt     — Tamam Sarkari Jobs
!njp      — National Job Portal
!punjab   — Punjab Government
!fpsc     — FPSC Federal Jobs
!nadra    — NADRA Jobs
!atomic   — PAEC Atomic Jobs
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚔️ *DEFENCE JOBS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
!defence  — Tamam Defence Jobs
!army     — Pakistan Army
!navy     — Pakistan Navy
!paf      — Pakistan Air Force
!anf      — Anti Narcotics Force
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *PRIVATE JOBS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
!private  — Tamam Private Jobs
!rozee    — Rozee.pk
!engro    — Engro Corporation
!pso      — Pakistan State Oil
━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 *TALEEM KE MUTABIQ*
━━━━━━━━━━━━━━━━━━━━━━━━━━
!matric   — Matric Pass Jobs
!inter    — Intermediate Jobs
!bs       — BS/BA Degree Jobs
!ms       — MS/MBA/MA Jobs
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ *BOT COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
!all      — Aaj ki tamam jobs
!ping     — Bot status
!time     — Pakistan time
!stats    — Statistics
!about    — Bot info
!help     — Ye menu
━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ _${getPKT()}_
🔔 _Har 20 minute mein auto update!_
━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();
}

// ── Job list for DMs/groups ───────────────────────────────────────────────────
function formatJobList(jobs, title, emoji) {
  if (!jobs || jobs.length === 0) {
    return `${emoji} *${title}*\n\n❌ _Abhi koi jobs nahi mili._\nThodi der baad try karein!\n\n🔔 _Har 20 minute mein auto update_`;
  }
  let msg = `${emoji} *${title.toUpperCase()}*\n`;
  msg += `🕐 _${getPKT()}_   📊 _${jobs.length} jobs_\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  jobs.forEach((job, i) => {
    const icon = job.category === "Defence" ? "⚔️" : job.type === "Govt" ? "🏛️" : "🏢";
    msg += `${icon} *${i + 1}. ${job.title}*\n`;
    msg += `┌ 🏢 ${job.org}\n`;
    msg += `├ 📍 ${job.location}\n`;
    msg += `├ 🎓 ${job.education}\n`;
    msg += `├ 👥 ${job.gender || "Male/Female"}\n`;
    msg += `├ 📅 Last Date: *${job.deadline}*\n`;
    msg += `└ 🔗 ${job.link}\n\n`;
  });
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🤖 _Pakistan Jobs Bot v4.0_\n`;
  msg += `🇵🇰 _Developed by Mudassar Khan • +92 347 7262704_`;
  return msg;
}

// ── Command responses ─────────────────────────────────────────────────────────
function pingResponse(uptime) {
  return `🏓 *Pong!* ✅\n\n⏱️ *Uptime:* ${uptime}\n🕐 *Time:* ${getPKT()}\n🌐 *Status:* 🟢 Online\n📡 *Sources:* 13 websites\n\n🤖 _Pakistan Jobs Bot v4.0_\n🇵🇰 _by Mudassar Khan • +92 347 7262704_`;
}

function timeResponse() {
  return `🕐 *PAKISTAN STANDARD TIME*\n\n📅 *${getPKT()}*\n\n🌍 PKT (UTC+5) — Karachi • Lahore • Islamabad\n\n🤖 _Pakistan Jobs Bot v4.0_`;
}

function statsResponse(botStats) {
  return `📊 *BOT STATISTICS*\n━━━━━━━━━━━━━━━━━━━\n🏛️ *Govt Jobs Posted:* ${botStats.govtPosted || 0}\n⚔️ *Defence Jobs:* ${botStats.defencePosted || 0}\n🏢 *Private Jobs:* ${botStats.privatePosted || 0}\n📌 *Total Posted:* ${botStats.totalPosted || 0}\n💬 *Commands:* ${stats.messages}\n🕐 *Last Update:* ${botStats.lastPost || "Not yet"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📡 NJP•Punjab•FPSC•NADRA•PAEC•Army•Navy•PAF•ANF•Rozee•Engro•PSO•Mustakbil\n\n🤖 _Pakistan Jobs Bot v4.0_\n🇵🇰 _by Mudassar Khan • +92 347 7262704_`;
}

function aboutResponse() {
  return `🤖 *PAKISTAN JOBS BOT v4.0*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n👨‍💻 *Developer:* Mudassar Khan\n📲 *Contact:* +92 347 7262704\n\n🇵🇰 *Pakistan ka #1 Automated Job Alert Bot!*\n\n📋 *13 Sources:*\n🏛️ NJP • Punjab • FPSC • NADRA • PAEC\n⚔️ Army • Navy • PAF • ANF\n🏢 Rozee • Engro • PSO • Mustakbil\n\n🎓 *Education Filter:*\n!matric • !inter • !bs • !ms\n\n⚡ *Features:*\n• Har 20 min auto update\n• 1 job = 1 message on channel\n• Gender + Education + Requirements\n• Accurate apply links\n• 24/7 online\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n💬 *!help* — Full menu\n📢 Doston ko share karein! 🙏`;
}

module.exports = { buildMenu, formatSingleJob, formatJobList, pingResponse, timeResponse, statsResponse, aboutResponse, stats, getPKT };
