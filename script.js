/* =========================================================
   A & Y Engagement Invitation — behaviour
   100% client-side. Edit CONFIG below to customise.
   ========================================================= */

const CONFIG = {
  // Event start in Cairo time (UTC+2 in November)
  eventStart: "2026-11-12T18:00:00+02:00",
  eventEnd: "2026-11-12T22:00:00+02:00",
  title: "Ahmed Salah & Yasmeen Hassan — Engagement",
  venue: "Lake Dream Compound, T29",
  address: "X2FC+WHF First 6th of October, Giza Governorate, Egypt",

  // Optional background music played after "Open" (e.g. "music.mp3" next to index.html)
  music: "",
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* =========================================================
   1. INTRO — falling hearts + opening sequence
   ========================================================= */
function initIntro() {
  const box = $(".hearts");
  const heartSvg = '<svg viewBox="0 0 24 24"><path d="M12 21s-8.5-5.3-8.5-11.2A4.8 4.8 0 0 1 12 6.9a4.8 4.8 0 0 1 8.5 2.9C20.5 15.7 12 21 12 21z"/></svg>';
  const colors = ["#c9a15a", "#d4ae63", "#a8263f", "#8e1a30"];
  for (let i = 0; i < 16; i++) {
    const h = document.createElement("span");
    h.className = "heart";
    h.innerHTML = heartSvg;
    h.style.cssText = `left:${Math.random() * 100}%;--s:${8 + Math.random() * 9}px;--c:${colors[i % colors.length]};` +
      `--d:${11 + Math.random() * 10}s;--delay:${-Math.random() * 20}s;--r:${-60 + Math.random() * 120}deg`;
    box.appendChild(h);
  }

  $("#openBtn").addEventListener("click", () => {
    const intro = $("#intro");
    intro.classList.add("opening");
    startMusic();
    setTimeout(() => {
      intro.classList.add("hide");
      document.body.classList.remove("locked");
      const main = $("#main");
      main.removeAttribute("aria-hidden");
      main.classList.add("show");
      window.scrollTo(0, 0);
      initReveal();
    }, 1400);
    setTimeout(() => intro.remove(), 2600);
  });
}

function startMusic() {
  if (!CONFIG.music) return;
  const audio = new Audio(CONFIG.music);
  audio.loop = true;
  const btn = $("#musicBtn");
  audio.play().then(() => {
    btn.hidden = false;
    btn.addEventListener("click", () => {
      if (audio.paused) { audio.play(); btn.classList.remove("paused"); }
      else { audio.pause(); btn.classList.add("paused"); }
    });
  }).catch(() => {});
}

/* scroll-triggered fade-up */
function initReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach(el => el.classList.add("in")); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  items.forEach(el => io.observe(el));
}

/* =========================================================
   2. COUNTDOWN + CALENDAR
   ========================================================= */
function initCountdown() {
  const el = $("#countdown");
  const target = new Date(CONFIG.eventStart).getTime();
  const tick = () => {
    let s = Math.floor((target - Date.now()) / 1000);
    if (s <= 0) { el.textContent = "The celebration has begun!"; return false; }
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); s %= 60;
    el.textContent = `${d} days ${h} hours ${m} min ${s} sec`;
    return true;
  };
  if (tick()) { const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000); }
}

function initCalendar() {
  const grid = $("#calGrid");
  const year = 2026, month = 10, highlight = 12; // November (0-based month)
  const lead = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const days = new Date(year, month + 1, 0).getDate();
  let html = "<span></span>".repeat(lead);
  for (let d = 1; d <= days; d++) {
    html += d === highlight
      ? `<span class="hl" aria-label="${d} — our day"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8.5-5.3-8.5-11.2A4.8 4.8 0 0 1 12 6.9a4.8 4.8 0 0 1 8.5 2.9C20.5 15.7 12 21 12 21z"/></svg><b>${d}</b></span>`
      : `<span>${d}</span>`;
  }
  grid.innerHTML = html;
}

/* =========================================================
   3. ADD TO CALENDAR (Google link + .ics download)
   ========================================================= */
const toICSDate = iso => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function initAddToCalendar() {
  const btn = $("#addCalBtn"), menu = $("#calMenu");
  const start = toICSDate(CONFIG.eventStart), end = toICSDate(CONFIG.eventEnd);
  const details = "We would be honored to celebrate our engagement with you.";
  const location = `${CONFIG.venue}, ${CONFIG.address}`;

  $("#gcalLink").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(CONFIG.title)}&dates=${start}/${end}` +
    `&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;

  $("#icsBtn").addEventListener("click", () => {
    const esc = s => s.replace(/([,;\\])/g, "\\$1");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AY Engagement//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:ay-engagement-20261112@invitation`,
      `DTSTAMP:${toICSDate(new Date().toISOString())}`,
      `DTSTART:${start}`, `DTEND:${end}`,
      `SUMMARY:${esc(CONFIG.title)}`,
      `DESCRIPTION:${esc(details)}`,
      `LOCATION:${esc(location)}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Engagement tomorrow", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "Ahmed-Yasmeen-Engagement.ics" });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toggleMenu(false);
  });

  const toggleMenu = open => { menu.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", e => { e.stopPropagation(); toggleMenu(menu.hidden); });
  menu.addEventListener("click", e => e.stopPropagation());
  $("#gcalLink").addEventListener("click", () => toggleMenu(false));
  document.addEventListener("click", () => toggleMenu(false));
}

/* =========================================================
   4. MAP
   ========================================================= */
function initMap() {
  const q = encodeURIComponent(CONFIG.address);
  $("#mapFrame").src = `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
  $("#directionsLink").href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  $("#venueName").textContent = CONFIG.venue;
}

/* =========================================================
   INIT
   ========================================================= */
initIntro();
initCountdown();
initCalendar();
initAddToCalendar();
initMap();
