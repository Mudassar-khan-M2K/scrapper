function getPKT() {
  return new Date().toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = { total: 0, govt: 0, private: 0, messages: 0, lastPost: null };

function updateStats(jobs) {
  stats.total += jobs.length;
  stats.govt += jobs.filter(j => j.type === "Govt").length;
  stats.private += jobs.filter(j => j.type === "Private").length;
  stats.lastPost = getPKT();
}

// ── Main menu ─────────────────────────────────────────────────────────────────
function buildMenu() {
  return `
╔═══════════════════════════════╗
║   🇵🇰  *PAKISTAN JOBS BOT*  🤖   ║
║       ᴠ𝟸.𝟶 — 𝟸𝟺/𝟽 𝙰𝙻𝙸𝚅𝙴      ║
╚═══════════════════════════════╝

*Assalam o Alaikum!* 👋
Pakistan ka *#1 Job Alert Bot* hai ye!
Rozana naye govt aur private jobs! 💼

━━━━━━━━━━━━━━━━━━━━━━━━
📋 *JOBS MENU*
━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣  🏛️  *Govt Jobs* — Latest Sarkari
2️⃣  🏢  *Private Jobs* — Corporate
3️⃣  🌿  *Punjab Govt Jobs*
4️⃣  📌  *NJP* — National Job Portal
5️⃣  ⚖️  *FPSC* — Federal Jobs
6️⃣  🇵🇰  *All Jobs Today*
━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  *BOT COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━
🏓  *!ping*   — Bot status check
🕐  *!time*   — Pakistan time
📊  *!stats*  — Bot statistics
ℹ️   *!about*  — About this bot
❓  *!help*   — Show this menu
━━━━━━━━━━━━━━━━━━━━━━━━
💬 *Reply 1-6* ya koi bhi command
📢 *Auto updates har 20 minute!*
⏰ ${getPKT()}
━━━━━━━━━━━━━━━━━━━━━━━━`.trim();
}

// ── Format job list ───────────────────────────────────────────────────────────
function formatJobList(jobs, title, emoji) {
  if (!jobs || jobs.length === 0) {
    return `${emoji} *${title}*\n\n❌ Abhi koi naye jobs nahi mili.\nThodi der baad dobara try karein!\n\n📢 _Auto update har 20 minute hoti hai_`;
  }

  let msg = `${emoji} *${title.toUpperCase()}*\n`;
  msg += `🕐 _${getPKT()}_\n`;
  msg += `📊 _${jobs.length} jobs mili hain_\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  jobs.forEach((job, i) => {
    const icon = job.type === "Govt" ? "🏛️" : "🏢";
    const badge = job.type === "Govt" ? "🟢 *GOVT*" : "🔵 *PRIVATE*";
    msg += `${icon} ${badge} — *Job #${i + 1}*\n`;
    msg += `━━━━━━━━━━━━\n`;
    msg += `💼 *Post:* ${job.title}\n`;
    msg += `🏢 *Organization:* ${job.org}\n`;
    msg += `📍 *Location:* ${job.location}\n`;
    msg += `📅 *Last Date:* ${job.deadline}\n`;
    msg += `📌 *Source:* ${job.source}\n`;
    msg += `🔗 *Apply:* ${job.link}\n\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🤖 _Pakistan Jobs Bot_\n`;
  msg += `📢 _Apne doston ko bhi share karein!_ 🇵🇰`;
  return msg;
}

// ── Channel post format ───────────────────────────────────────────────────────
function formatChannelPost(jobs) {
  const govt = jobs.filter(j => j.type === "Govt");
  const priv = jobs.filter(j => j.type === "Private");

  let msg = `🇵🇰 *PAKISTAN JOBS UPDATE* 🔔\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🕐 *${getPKT()}*\n`;
  msg += `📊 *${jobs.length} naye jobs* aaj ke liye!\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (govt.length > 0) {
    msg += `🏛️ *SARKARI JOBS (GOVT) — ${govt.length}*\n\n`;
    govt.slice(0, 6).forEach((job, i) => {
      msg += `*${i + 1}. ${job.title}*\n`;
      msg += `   🏢 ${job.org}\n`;
      msg += `   📍 ${job.location}\n`;
      msg += `   📅 Last Date: *${job.deadline}*\n`;
      msg += `   🔗 ${job.link}\n\n`;
    });
  }

  if (priv.length > 0) {
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🏢 *PRIVATE JOBS — ${priv.length}*\n\n`;
    priv.slice(0, 6).forEach((job, i) => {
      msg += `*${i + 1}. ${job.title}*\n`;
      msg += `   🏢 ${job.org}\n`;
      msg += `   📍 ${job.location}\n`;
      msg += `   📅 Last Date: *${job.deadline}*\n`;
      msg += `   🔗 ${job.link}\n\n`;
    });
  }

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🤖 *Pakistan Jobs Bot*\n`;
  msg += `📢 *Channel join karein aur share karein!*\n`;
  msg += `🔔 _Har 20 minute mein update hota hai_\n`;
  msg += `\n_NJP • Punjab • FPSC • Rozee • Mustakbil_`;
  return msg;
}

// ── Command responses ─────────────────────────────────────────────────────────
function pingResponse(uptime) {
  return `🏓 *Pong!*\n\n✅ *Bot bilkul theek hai!*\n\n⏱️ *Uptime:* ${uptime}\n🕐 *Time:* ${getPKT()}\n🌐 *Status:* Online 24/7\n\n_Pakistan Jobs Bot — Always Running!_ 🇵🇰`;
}

function timeResponse() {
  return `🕐 *PAKISTAN STANDARD TIME*\n\n📅 *${getPKT()}*\n\n🌍 Timezone: *PKT (UTC+5)*\n🇵🇰 Karachi / Islamabad / Lahore`;
}

function statsResponse() {
  return `📊 *BOT STATISTICS*\n━━━━━━━━━━━━━━━━━━━\n📌 *Total Jobs Fetched:* ${stats.total}\n🏛️ *Govt Jobs:* ${stats.govt}\n🏢 *Private Jobs:* ${stats.private}\n💬 *Messages Handled:* ${stats.messages}\n🕐 *Last Post:* ${stats.lastPost || "Not yet"}\n━━━━━━━━━━━━━━━━━━━\n🤖 *Pakistan Jobs Bot v2.0*\n📢 _Powered by 5 Job Sites_`;
}

function aboutResponse() {
  return `🤖 *PAKISTAN JOBS BOT v2.0*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🇵🇰 *Pakistan ka #1 Job Alert Bot!*\n\n📋 *Job Sources:*\n   📌 NJP — njp.gov.pk\n   🌿 Punjab — punjab.gov.pk\n   ⚖️ FPSC — fpsc.gov.pk\n   🏢 Rozee — rozee.pk\n   💼 Mustakbil — mustakbil.com\n\n⚡ *Features:*\n   • Har 20 minute mein auto update\n   • Govt + Private jobs\n   • 24/7 online\n   • Fast & reliable\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n💬 *!help* type karein menu ke liye\n📢 Doston ko share zaroor karein! 🙏`;
}

module.exports = { buildMenu, formatJobList, formatChannelPost, pingResponse, timeResponse, statsResponse, aboutResponse, updateStats, stats, getPKT };
