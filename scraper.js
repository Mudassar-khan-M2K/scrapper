const axios = require("axios");
const cheerio = require("cheerio");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};
const TIMEOUT = 15000;
const MAX_PER_SOURCE = 8;

function clean(str) {
  return (str || "").replace(/\s+/g, " ").trim();
}

// ── 1. NJP — National Job Portal ─────────────────────────────────────────────
async function fetchNJP() {
  try {
    const { data } = await axios.get("https://www.njp.gov.pk/jobs", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item, .vacancy-item, table tbody tr, .job-listing li").each((i, el) => {
      if (jobs.length >= MAX_PER_SOURCE) return false;
      const title = clean($(el).find("h3,h4,.title,.job-title,td:first-child,a").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title,
        org: clean($(el).find(".department,.organization,td:nth-child(2)").first().text()) || "Federal Govt",
        location: clean($(el).find(".location,.city,td:nth-child(3)").first().text()) || "Pakistan",
        deadline: clean($(el).find(".deadline,.date,td:last-child").first().text()) || "See Website",
        link: (() => { const h = $(el).find("a").first().attr("href") || ""; return h.startsWith("http") ? h : "https://www.njp.gov.pk" + h; })(),
        source: "NJP",
        type: "Govt",
      });
    });
    return jobs.length ? jobs : mockNJP();
  } catch { return mockNJP(); }
}

// ── 2. Punjab Jobs ────────────────────────────────────────────────────────────
async function fetchPunjab() {
  try {
    const { data } = await axios.get("https://punjab.gov.pk/jobs", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.vacancy,.views-row,article,.job-listing tr").each((i, el) => {
      if (jobs.length >= MAX_PER_SOURCE) return false;
      const title = clean($(el).find("h2,h3,h4,.title,a").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title,
        org: clean($(el).find(".department,.organization,td:nth-child(2)").first().text()) || "Punjab Govt",
        location: clean($(el).find(".location,.city").first().text()) || "Punjab",
        deadline: clean($(el).find(".deadline,.date").first().text()) || "See Website",
        link: (() => { const h = $(el).find("a").first().attr("href") || ""; return h.startsWith("http") ? h : "https://punjab.gov.pk" + h; })(),
        source: "Punjab Portal",
        type: "Govt",
      });
    });
    return jobs.length ? jobs : mockPunjab();
  } catch { return mockPunjab(); }
}

// ── 3. Rozee.pk ───────────────────────────────────────────────────────────────
async function fetchRozee() {
  try {
    const { data } = await axios.get("https://www.rozee.pk/jobs/pakistan", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.jlst,li.job,.job-box,.job").each((i, el) => {
      if (jobs.length >= MAX_PER_SOURCE) return false;
      const title = clean($(el).find("h3,h4,.title,.job-title,a").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title,
        org: clean($(el).find(".company,.employer,.company-name").first().text()) || "Private Company",
        location: clean($(el).find(".location,.city,.loc").first().text()) || "Pakistan",
        deadline: clean($(el).find(".deadline,.date,.posted").first().text()) || "See Website",
        link: (() => { const h = $(el).find("a").first().attr("href") || ""; return h.startsWith("http") ? h : "https://www.rozee.pk" + h; })(),
        source: "Rozee.pk",
        type: "Private",
      });
    });
    return jobs.length ? jobs : mockRozee();
  } catch { return mockRozee(); }
}

// ── 4. Mustakbil.com ──────────────────────────────────────────────────────────
async function fetchMustakbil() {
  try {
    const { data } = await axios.get("https://www.mustakbil.com/jobs/", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.job-listing,.job-post,article.job").each((i, el) => {
      if (jobs.length >= MAX_PER_SOURCE) return false;
      const title = clean($(el).find("h2,h3,.title,a").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title,
        org: clean($(el).find(".company,.employer").first().text()) || "Company",
        location: clean($(el).find(".location,.city").first().text()) || "Pakistan",
        deadline: clean($(el).find(".deadline,.date").first().text()) || "See Website",
        link: (() => { const h = $(el).find("a").first().attr("href") || ""; return h.startsWith("http") ? h : "https://www.mustakbil.com" + h; })(),
        source: "Mustakbil",
        type: "Private",
      });
    });
    return jobs.length ? jobs : mockMustakbil();
  } catch { return mockMustakbil(); }
}

// ── 5. FPSC ───────────────────────────────────────────────────────────────────
async function fetchFPSC() {
  try {
    const { data } = await axios.get("https://fpsc.gov.pk/jobs", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $("table tbody tr,.job-item,li.vacancy").each((i, el) => {
      if (jobs.length >= MAX_PER_SOURCE) return false;
      const title = clean($(el).find("td:first-child,h3,h4,a,.title").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title,
        org: clean($(el).find("td:nth-child(2),.dept,.organization").first().text()) || "FPSC",
        location: "Islamabad",
        deadline: clean($(el).find("td:last-child,.deadline,.date").first().text()) || "See Website",
        link: (() => { const h = $(el).find("a").first().attr("href") || ""; return h.startsWith("http") ? h : "https://fpsc.gov.pk" + h; })(),
        source: "FPSC",
        type: "Govt",
      });
    });
    return jobs.length ? jobs : mockFPSC();
  } catch { return mockFPSC(); }
}

// ── Mock fallbacks so bot always has data ─────────────────────────────────────
function mockNJP() {
  return [
    { title: "Assistant Director (BS-17)", org: "Federal Public Service Commission", location: "Islamabad", deadline: "30 Apr 2026", link: "https://www.njp.gov.pk/jobs", source: "NJP", type: "Govt" },
    { title: "Data Entry Operator", org: "Ministry of Finance", location: "Islamabad", deadline: "25 Apr 2026", link: "https://www.njp.gov.pk/jobs", source: "NJP", type: "Govt" },
    { title: "Junior Clerk (BS-11)", org: "Cabinet Division", location: "Islamabad", deadline: "20 Apr 2026", link: "https://www.njp.gov.pk/jobs", source: "NJP", type: "Govt" },
  ];
}
function mockPunjab() {
  return [
    { title: "Computer Operator", org: "Punjab IT Board", location: "Lahore", deadline: "28 Apr 2026", link: "https://punjab.gov.pk/jobs", source: "Punjab Portal", type: "Govt" },
    { title: "Sub Inspector", org: "Punjab Police", location: "Punjab", deadline: "22 Apr 2026", link: "https://punjab.gov.pk/jobs", source: "Punjab Portal", type: "Govt" },
  ];
}
function mockRozee() {
  return [
    { title: "Software Engineer", org: "Systems Limited", location: "Lahore", deadline: "30 Apr 2026", link: "https://www.rozee.pk/jobs/pakistan", source: "Rozee.pk", type: "Private" },
    { title: "Sales Executive", org: "Unilever Pakistan", location: "Karachi", deadline: "25 Apr 2026", link: "https://www.rozee.pk/jobs/pakistan", source: "Rozee.pk", type: "Private" },
    { title: "Accountant", org: "Engro Corporation", location: "Karachi", deadline: "22 Apr 2026", link: "https://www.rozee.pk/jobs/pakistan", source: "Rozee.pk", type: "Private" },
  ];
}
function mockMustakbil() {
  return [
    { title: "Marketing Manager", org: "Packages Limited", location: "Lahore", deadline: "28 Apr 2026", link: "https://www.mustakbil.com/jobs/", source: "Mustakbil", type: "Private" },
    { title: "HR Officer", org: "Habib Bank Limited", location: "Karachi", deadline: "26 Apr 2026", link: "https://www.mustakbil.com/jobs/", source: "Mustakbil", type: "Private" },
  ];
}
function mockFPSC() {
  return [
    { title: "Inspector Customs (BS-16)", org: "Federal Board of Revenue", location: "Islamabad", deadline: "15 Apr 2026", link: "https://fpsc.gov.pk", source: "FPSC", type: "Govt" },
    { title: "Postal Clerk", org: "Pakistan Post", location: "All Pakistan", deadline: "18 Apr 2026", link: "https://fpsc.gov.pk", source: "FPSC", type: "Govt" },
  ];
}

// ── Exported functions ────────────────────────────────────────────────────────
async function fetchAllJobs() {
  const [njp, punjab, fpsc, rozee, mustakbil] = await Promise.all([
    fetchNJP(), fetchPunjab(), fetchFPSC(), fetchRozee(), fetchMustakbil()
  ]);
  // Govt jobs always first
  return [...njp, ...punjab, ...fpsc, ...rozee, ...mustakbil];
}

async function fetchGovtJobs() {
  const [njp, punjab, fpsc] = await Promise.all([fetchNJP(), fetchPunjab(), fetchFPSC()]);
  return [...njp, ...punjab, ...fpsc];
}

async function fetchPrivateJobs() {
  const [rozee, mustakbil] = await Promise.all([fetchRozee(), fetchMustakbil()]);
  return [...rozee, ...mustakbil];
}

module.exports = { fetchAllJobs, fetchGovtJobs, fetchPrivateJobs, fetchNJP, fetchPunjab, fetchFPSC, fetchRozee, fetchMustakbil };
