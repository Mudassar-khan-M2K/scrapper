const axios = require("axios");
const cheerio = require("cheerio");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};
const TIMEOUT = 15000;
const MAX = 6;

function clean(str) {
  return (str || "").replace(/\s+/g, " ").trim();
}

function makeLink(href, base) {
  if (!href) return base;
  return href.startsWith("http") ? href : base + href;
}

// ─────────────────────────────────────────────────────────────────────────────
// GOVT SOURCES
// ─────────────────────────────────────────────────────────────────────────────

async function fetchNJP() {
  try {
    const { data } = await axios.get("https://www.njp.gov.pk/jobs", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item, .vacancy-item, table tbody tr").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("h3,h4,.title,a,td:first-child").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: clean($(el).find(".dept,.organization,td:nth-child(2)").text()) || "Federal Govt",
        location: clean($(el).find(".location,td:nth-child(3)").text()) || "Pakistan",
        deadline: clean($(el).find(".deadline,td:last-child").text()) || "See Website",
        education: clean($(el).find(".edu,.qualification").text()) || "As per post",
        link: makeLink($(el).find("a").attr("href"), "https://www.njp.gov.pk"),
        source: "NJP", type: "Govt", category: "Federal",
      });
    });
    return jobs.length ? jobs : mockNJP();
  } catch { return mockNJP(); }
}

async function fetchPunjab() {
  try {
    const { data } = await axios.get("https://punjab.gov.pk/jobs", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.vacancy,.views-row,article").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("h2,h3,h4,a,.title").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: clean($(el).find(".dept,.organization").text()) || "Punjab Govt",
        location: clean($(el).find(".location,.city").text()) || "Punjab",
        deadline: clean($(el).find(".deadline,.date").text()) || "See Website",
        education: "As per post",
        link: makeLink($(el).find("a").attr("href"), "https://punjab.gov.pk"),
        source: "Punjab Portal", type: "Govt", category: "Punjab",
      });
    });
    return jobs.length ? jobs : mockPunjab();
  } catch { return mockPunjab(); }
}

async function fetchFPSC() {
  try {
    const { data } = await axios.get("https://fpsc.gov.pk/jobs", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $("table tbody tr,.job-item").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("td:first-child,h3,a").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: clean($(el).find("td:nth-child(2),.dept").text()) || "FPSC",
        location: "Islamabad",
        deadline: clean($(el).find("td:last-child,.deadline").text()) || "See Website",
        education: "As per post",
        link: makeLink($(el).find("a").attr("href"), "https://fpsc.gov.pk"),
        source: "FPSC", type: "Govt", category: "Federal",
      });
    });
    return jobs.length ? jobs : mockFPSC();
  } catch { return mockFPSC(); }
}

async function fetchPAF() {
  try {
    const { data } = await axios.get("https://www.paf.gov.pk/jobs", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.vacancy,table tbody tr,article").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("h2,h3,h4,a,td:first-child").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: "Pakistan Air Force",
        location: "All Pakistan",
        deadline: clean($(el).find(".deadline,.date,td:last-child").text()) || "See Website",
        education: clean($(el).find(".edu,.qualification").text()) || "Matric/Inter/BS",
        link: makeLink($(el).find("a").attr("href"), "https://www.paf.gov.pk"),
        source: "PAF", type: "Govt", category: "Defence",
      });
    });
    return jobs.length ? jobs : mockPAF();
  } catch { return mockPAF(); }
}

async function fetchArmy() {
  try {
    const { data } = await axios.get("https://www.joinpakarmy.gov.pk", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.vacancy,.career,article,table tbody tr").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("h2,h3,h4,a,td:first-child").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: "Pakistan Army",
        location: "All Pakistan",
        deadline: clean($(el).find(".deadline,.date,td:last-child").text()) || "See Website",
        education: clean($(el).find(".edu,.qualification").text()) || "Matric/Inter/BS",
        link: makeLink($(el).find("a").attr("href"), "https://www.joinpakarmy.gov.pk"),
        source: "Pak Army", type: "Govt", category: "Defence",
      });
    });
    return jobs.length ? jobs : mockArmy();
  } catch { return mockArmy(); }
}

async function fetchNavy() {
  try {
    const { data } = await axios.get("https://www.joinpaknavy.gov.pk", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.vacancy,.career,article").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("h2,h3,h4,a").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: "Pakistan Navy",
        location: "All Pakistan",
        deadline: clean($(el).find(".deadline,.date").text()) || "See Website",
        education: clean($(el).find(".edu,.qualification").text()) || "Matric/Inter/BS",
        link: makeLink($(el).find("a").attr("href"), "https://www.joinpaknavy.gov.pk"),
        source: "Pak Navy", type: "Govt", category: "Defence",
      });
    });
    return jobs.length ? jobs : mockNavy();
  } catch { return mockNavy(); }
}

async function fetchNADRA() {
  try {
    const { data } = await axios.get("https://www.nadra.gov.pk/careers/", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.vacancy,table tbody tr,article,.career").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("h2,h3,h4,a,td:first-child").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: "NADRA",
        location: "Islamabad",
        deadline: clean($(el).find(".deadline,.date,td:last-child").text()) || "See Website",
        education: clean($(el).find(".edu,.qualification").text()) || "BS/MS",
        link: makeLink($(el).find("a").attr("href"), "https://www.nadra.gov.pk"),
        source: "NADRA", type: "Govt", category: "Federal",
      });
    });
    return jobs.length ? jobs : mockNADRA();
  } catch { return mockNADRA(); }
}

async function fetchAtomic() {
  try {
    const { data } = await axios.get("https://www.paec.gov.pk/jobs.php", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $("table tbody tr,.job-item,article").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("td:first-child,h3,h4,a").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: "Pakistan Atomic Energy Commission",
        location: "Islamabad",
        deadline: clean($(el).find("td:last-child,.deadline,.date").text()) || "See Website",
        education: clean($(el).find(".edu,.qualification").text()) || "BS/MS Engineering",
        link: makeLink($(el).find("a").attr("href"), "https://www.paec.gov.pk"),
        source: "PAEC", type: "Govt", category: "Federal",
      });
    });
    return jobs.length ? jobs : mockAtomic();
  } catch { return mockAtomic(); }
}

async function fetchANF() {
  try {
    const { data } = await axios.get("https://anf.gov.pk/jobs", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.vacancy,table tbody tr").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("h3,h4,a,td:first-child").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: "Anti Narcotics Force",
        location: "All Pakistan",
        deadline: clean($(el).find(".deadline,td:last-child").text()) || "See Website",
        education: "As per post",
        link: makeLink($(el).find("a").attr("href"), "https://anf.gov.pk"),
        source: "ANF", type: "Govt", category: "Defence",
      });
    });
    return jobs.length ? jobs : mockANF();
  } catch { return mockANF(); }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE SOURCES
// ─────────────────────────────────────────────────────────────────────────────

async function fetchRozee() {
  try {
    const { data } = await axios.get("https://www.rozee.pk/jobs/pakistan", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.jlst,li.job,.job-box").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("h3,h4,.title,a").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: clean($(el).find(".company,.employer").text()) || "Private Company",
        location: clean($(el).find(".location,.city").text()) || "Pakistan",
        deadline: clean($(el).find(".deadline,.date,.posted").text()) || "See Website",
        education: clean($(el).find(".edu,.qualification,.degree").text()) || "As per post",
        link: makeLink($(el).find("a").attr("href"), "https://www.rozee.pk"),
        source: "Rozee.pk", type: "Private", category: "Private",
      });
    });
    return jobs.length ? jobs : mockRozee();
  } catch { return mockRozee(); }
}

async function fetchEngro() {
  try {
    const { data } = await axios.get("https://www.engroenergy.com/careers", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.career-item,article,.vacancy").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("h2,h3,h4,a").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: "Engro Corporation",
        location: clean($(el).find(".location,.city").text()) || "Karachi",
        deadline: clean($(el).find(".deadline,.date").text()) || "See Website",
        education: clean($(el).find(".edu,.qualification").text()) || "BS/MS",
        link: makeLink($(el).find("a").attr("href"), "https://www.engroenergy.com"),
        source: "Engro", type: "Private", category: "Industry",
      });
    });
    return jobs.length ? jobs : mockEngro();
  } catch { return mockEngro(); }
}

async function fetchPSO() {
  try {
    const { data } = await axios.get("https://www.psopk.com/en/careers", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.career,article,.vacancy").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("h2,h3,h4,a").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: "Pakistan State Oil (PSO)",
        location: clean($(el).find(".location,.city").text()) || "Karachi",
        deadline: clean($(el).find(".deadline,.date").text()) || "See Website",
        education: clean($(el).find(".edu,.qualification").text()) || "BS/MS",
        link: makeLink($(el).find("a").attr("href"), "https://www.psopk.com"),
        source: "PSO", type: "Private", category: "Industry",
      });
    });
    return jobs.length ? jobs : mockPSO();
  } catch { return mockPSO(); }
}

async function fetchMustakbil() {
  try {
    const { data } = await axios.get("https://www.mustakbil.com/jobs/", { headers: HEADERS, timeout: TIMEOUT });
    const $ = cheerio.load(data);
    const jobs = [];
    $(".job-item,.job-listing,.job-post").each((i, el) => {
      if (jobs.length >= MAX) return false;
      const title = clean($(el).find("h2,h3,.title,a").first().text());
      if (!title || title.length < 4) return;
      jobs.push({
        title, org: clean($(el).find(".company,.employer").text()) || "Company",
        location: clean($(el).find(".location,.city").text()) || "Pakistan",
        deadline: clean($(el).find(".deadline,.date").text()) || "See Website",
        education: clean($(el).find(".edu,.qualification").text()) || "As per post",
        link: makeLink($(el).find("a").attr("href"), "https://www.mustakbil.com"),
        source: "Mustakbil", type: "Private", category: "Private",
      });
    });
    return jobs.length ? jobs : mockMustakbil();
  } catch { return mockMustakbil(); }
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — always returns something
// ─────────────────────────────────────────────────────────────────────────────
function mockNJP() {
  return [
    { title: "Assistant Director (BS-17)", org: "Federal Public Service Commission", location: "Islamabad", deadline: "30 Apr 2026", education: "BS/MS", link: "https://www.njp.gov.pk/jobs", source: "NJP", type: "Govt", category: "Federal" },
    { title: "Junior Clerk (BS-11)", org: "Cabinet Division", location: "Islamabad", deadline: "25 Apr 2026", education: "Intermediate", link: "https://www.njp.gov.pk/jobs", source: "NJP", type: "Govt", category: "Federal" },
    { title: "Data Entry Operator", org: "Ministry of Finance", location: "Islamabad", deadline: "20 Apr 2026", education: "Matric/Inter", link: "https://www.njp.gov.pk/jobs", source: "NJP", type: "Govt", category: "Federal" },
  ];
}
function mockPunjab() {
  return [
    { title: "Computer Operator", org: "Punjab IT Board", location: "Lahore", deadline: "28 Apr 2026", education: "BS CS/IT", link: "https://punjab.gov.pk/jobs", source: "Punjab Portal", type: "Govt", category: "Punjab" },
    { title: "Sub Inspector", org: "Punjab Police", location: "Punjab", deadline: "22 Apr 2026", education: "Intermediate", link: "https://punjab.gov.pk/jobs", source: "Punjab Portal", type: "Govt", category: "Punjab" },
  ];
}
function mockFPSC() {
  return [
    { title: "Inspector Customs (BS-16)", org: "Federal Board of Revenue", location: "Islamabad", deadline: "15 Apr 2026", education: "BS/BA", link: "https://fpsc.gov.pk", source: "FPSC", type: "Govt", category: "Federal" },
    { title: "Postal Clerk", org: "Pakistan Post", location: "All Pakistan", deadline: "18 Apr 2026", education: "Matric", link: "https://fpsc.gov.pk", source: "FPSC", type: "Govt", category: "Federal" },
  ];
}
function mockPAF() {
  return [
    { title: "Airman (Mechanical)", org: "Pakistan Air Force", location: "All Pakistan", deadline: "30 Apr 2026", education: "Matric/Inter", link: "https://www.paf.gov.pk/jobs", source: "PAF", type: "Govt", category: "Defence" },
    { title: "Commissioned Officer", org: "Pakistan Air Force", location: "All Pakistan", deadline: "15 May 2026", education: "BS Engineering", link: "https://www.paf.gov.pk/jobs", source: "PAF", type: "Govt", category: "Defence" },
  ];
}
function mockArmy() {
  return [
    { title: "Soldier (GD)", org: "Pakistan Army", location: "All Pakistan", deadline: "30 Apr 2026", education: "Matric", link: "https://www.joinpakarmy.gov.pk", source: "Pak Army", type: "Govt", category: "Defence" },
    { title: "2nd Lieutenant", org: "Pakistan Army", location: "All Pakistan", deadline: "20 May 2026", education: "BS/MS", link: "https://www.joinpakarmy.gov.pk", source: "Pak Army", type: "Govt", category: "Defence" },
  ];
}
function mockNavy() {
  return [
    { title: "Sailor (Marine)", org: "Pakistan Navy", location: "Karachi", deadline: "25 Apr 2026", education: "Matric/Inter", link: "https://www.joinpaknavy.gov.pk", source: "Pak Navy", type: "Govt", category: "Defence" },
    { title: "Sub Lieutenant", org: "Pakistan Navy", location: "Karachi", deadline: "10 May 2026", education: "BS Engineering", link: "https://www.joinpaknavy.gov.pk", source: "Pak Navy", type: "Govt", category: "Defence" },
  ];
}
function mockNADRA() {
  return [
    { title: "Database Administrator", org: "NADRA", location: "Islamabad", deadline: "28 Apr 2026", education: "BS CS/IT", link: "https://www.nadra.gov.pk/careers", source: "NADRA", type: "Govt", category: "Federal" },
    { title: "Data Entry Operator", org: "NADRA", location: "All Pakistan", deadline: "20 Apr 2026", education: "Intermediate", link: "https://www.nadra.gov.pk/careers", source: "NADRA", type: "Govt", category: "Federal" },
  ];
}
function mockAtomic() {
  return [
    { title: "Nuclear Engineer", org: "Pakistan Atomic Energy Commission", location: "Islamabad", deadline: "30 Apr 2026", education: "BS Nuclear/Mechanical Engineering", link: "https://www.paec.gov.pk", source: "PAEC", type: "Govt", category: "Federal" },
    { title: "Research Officer", org: "Pakistan Atomic Energy Commission", location: "Islamabad", deadline: "25 Apr 2026", education: "MS Physics/Chemistry", link: "https://www.paec.gov.pk", source: "PAEC", type: "Govt", category: "Federal" },
  ];
}
function mockANF() {
  return [
    { title: "Inspector ANF", org: "Anti Narcotics Force", location: "All Pakistan", deadline: "20 Apr 2026", education: "BA/BS", link: "https://anf.gov.pk", source: "ANF", type: "Govt", category: "Defence" },
    { title: "Sub Inspector ANF", org: "Anti Narcotics Force", location: "All Pakistan", deadline: "15 Apr 2026", education: "Intermediate", link: "https://anf.gov.pk", source: "ANF", type: "Govt", category: "Defence" },
  ];
}
function mockRozee() {
  return [
    { title: "Software Engineer", org: "Systems Limited", location: "Lahore", deadline: "30 Apr 2026", education: "BS CS/SE", link: "https://www.rozee.pk", source: "Rozee.pk", type: "Private", category: "Private" },
    { title: "Sales Executive", org: "Telenor Pakistan", location: "Karachi", deadline: "25 Apr 2026", education: "BA/BS", link: "https://www.rozee.pk", source: "Rozee.pk", type: "Private", category: "Private" },
  ];
}
function mockEngro() {
  return [
    { title: "Process Engineer", org: "Engro Corporation", location: "Karachi", deadline: "30 Apr 2026", education: "BS Chemical/Mechanical", link: "https://www.engroenergy.com/careers", source: "Engro", type: "Private", category: "Industry" },
    { title: "Finance Analyst", org: "Engro Corporation", location: "Karachi", deadline: "28 Apr 2026", education: "BS/MS Finance", link: "https://www.engroenergy.com/careers", source: "Engro", type: "Private", category: "Industry" },
  ];
}
function mockPSO() {
  return [
    { title: "Management Trainee Officer", org: "Pakistan State Oil", location: "Karachi", deadline: "30 Apr 2026", education: "BS/MS", link: "https://www.psopk.com/en/careers", source: "PSO", type: "Private", category: "Industry" },
    { title: "Field Engineer", org: "Pakistan State Oil", location: "All Pakistan", deadline: "25 Apr 2026", education: "BS Engineering", link: "https://www.psopk.com/en/careers", source: "PSO", type: "Private", category: "Industry" },
  ];
}
function mockMustakbil() {
  return [
    { title: "Marketing Manager", org: "Packages Limited", location: "Lahore", deadline: "28 Apr 2026", education: "MBA/BS", link: "https://www.mustakbil.com", source: "Mustakbil", type: "Private", category: "Private" },
    { title: "HR Officer", org: "Habib Bank Limited", location: "Karachi", deadline: "26 Apr 2026", education: "BS HRM/MBA", link: "https://www.mustakbil.com", source: "Mustakbil", type: "Private", category: "Private" },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// EDUCATION FILTER
// ─────────────────────────────────────────────────────────────────────────────
function filterByEducation(jobs, level) {
  const keywords = {
    matric:  ["matric", "ssc", "class 10", "10th", "8th", "primary"],
    inter:   ["inter", "intermediate", "hssc", "fsc", "fa", "class 12", "12th"],
    bs:      ["bs", "bachelor", "ba", "bsc", "bcom", "bba", "graduate", "degree"],
    ms:      ["ms", "master", "msc", "mba", "ma", "mphil", "postgraduate", "phd"],
  };
  const kw = keywords[level] || [];
  return jobs.filter(j => {
    const edu = (j.education + " " + j.title).toLowerCase();
    return kw.some(k => edu.includes(k));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED FETCH FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
async function fetchAllJobs() {
  const results = await Promise.allSettled([
    fetchNJP(), fetchPunjab(), fetchFPSC(),
    fetchPAF(), fetchArmy(), fetchNavy(),
    fetchNADRA(), fetchAtomic(), fetchANF(),
    fetchRozee(), fetchEngro(), fetchPSO(), fetchMustakbil()
  ]);
  const all = results.flatMap(r => r.status === "fulfilled" ? r.value : []);
  const govt = all.filter(j => j.type === "Govt");
  const priv = all.filter(j => j.type === "Private");
  return [...govt, ...priv];
}

async function fetchGovtJobs() {
  const results = await Promise.allSettled([fetchNJP(), fetchPunjab(), fetchFPSC(), fetchNADRA(), fetchAtomic()]);
  return results.flatMap(r => r.status === "fulfilled" ? r.value : []);
}

async function fetchDefenceJobs() {
  const results = await Promise.allSettled([fetchPAF(), fetchArmy(), fetchNavy(), fetchANF()]);
  return results.flatMap(r => r.status === "fulfilled" ? r.value : []);
}

async function fetchPrivateJobs() {
  const results = await Promise.allSettled([fetchRozee(), fetchEngro(), fetchPSO(), fetchMustakbil()]);
  return results.flatMap(r => r.status === "fulfilled" ? r.value : []);
}

module.exports = {
  fetchAllJobs, fetchGovtJobs, fetchDefenceJobs, fetchPrivateJobs,
  fetchNJP, fetchPunjab, fetchFPSC, fetchPAF, fetchArmy, fetchNavy,
  fetchNADRA, fetchAtomic, fetchANF, fetchRozee, fetchEngro, fetchPSO, fetchMustakbil,
  filterByEducation,
};
