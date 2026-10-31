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

  // Optional: email RSVPs & wishes to you via Formspree (leave empty to keep them on this device only)
  formspreeId: "",      // e.g. "xyzabcd" from https://formspree.io/f/xyzabcd

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
   5. MODAL HELPERS
   ========================================================= */
let lastFocus = null;
function openModal(el) {
  lastFocus = document.activeElement;
  el.hidden = false;
  document.body.style.overflow = "hidden";
  const f = el.querySelector("input, button.suggest-item, button:not([data-close])");
  if (f) setTimeout(() => f.focus(), 50);
}
function closeModal(el) {
  el.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
function initModals() {
  $$(".overlay").forEach(ov => {
    ov.addEventListener("click", e => {
      if (e.target === ov || e.target.closest("[data-close]")) closeModal(ov);
    });
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") $$(".overlay:not([hidden])").forEach(closeModal);
  });
}

/* Send to Formspree when configured */
function deliver(subject, fields) {
  if (CONFIG.formspreeId) {
    fetch(`https://formspree.io/f/${CONFIG.formspreeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: subject, ...fields }),
    }).catch(() => {});
  }
}

/* safe localStorage wrappers */
const store = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ } },
};

/* =========================================================
   6. RSVP
   ========================================================= */
function initRSVP() {
  const modal = $("#rsvpModal"), form = $("#rsvpForm"), thanks = $("#rsvpThanks");
  const name = $("#rsvpName"), submit = $("#rsvpSubmit"), extra = $("#attendExtra");
  let choice = null, guests = 1;

  const validate = () => { submit.disabled = !(name.value.trim() && choice); };

  $("#rsvpBtn").addEventListener("click", () => {
    form.hidden = false; thanks.hidden = true;
    openModal(modal);
  });

  $$(".choice", modal).forEach(btn => btn.addEventListener("click", () => {
    choice = btn.dataset.value;
    $$(".choice", modal).forEach(b => b.setAttribute("aria-checked", String(b === btn)));
    extra.hidden = choice !== "yes";
    validate();
  }));

  const setGuests = n => { guests = Math.min(10, Math.max(1, n)); $("#guestCount").textContent = guests; };
  $("#minusBtn").addEventListener("click", () => setGuests(guests - 1));
  $("#plusBtn").addEventListener("click", () => setGuests(guests + 1));
  name.addEventListener("input", validate);

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (submit.disabled) return;
    const entry = {
      Name: name.value.trim(),
      Attending: choice === "yes" ? "Yes" : "No",
      Guests: choice === "yes" ? guests : 0,
      Message: $("#rsvpMsg").value.trim() || "—",
    };
    store.set("ay-rsvp", [...store.get("ay-rsvp"), { ...entry, at: new Date().toISOString() }]);
    deliver("Engagement RSVP — Ahmed & Yasmeen", entry);

    $("#thanksText").textContent = choice === "yes"
      ? "We have received your confirmation. We look forward to seeing you on our special day!"
      : "Thank you for letting us know. You will be missed — we appreciate your kind wishes!";
    form.hidden = true; thanks.hidden = false;

    // reset for next time
    form.reset(); choice = null; setGuests(1); extra.hidden = true;
    $$(".choice", modal).forEach(b => b.setAttribute("aria-checked", "false"));
    validate();
  });
}

/* =========================================================
   7. GUESTBOOK + WISH SUGGESTIONS
   ========================================================= */
const WISHES = [
  "May every single day of yours be one to remember and cherish.",
  "Wishing you little angels soon to fill your home with joy.",
  "Here's to a married life that stays harmonious and strong forever.",
  "May your love be the strength that carries you through every trial.",
  "May you wake up smiling every morning, grateful to have each other.",
  "Congratulations! May your love story be as beautiful as this day.",
  "Wishing you a lifetime of laughter, kindness and endless love.",
  "May your hearts always find their way back to each other.",
  "So happy for you both — may this be the start of your happiest chapter.",
  "May your home be filled with warmth, peace and countless blessings.",
  "Two beautiful souls, one beautiful journey. Congratulations!",
  "May Allah bless your union and fill your days with happiness.",
  "Wishing you a love that grows deeper with every passing year.",
  "May you always be each other's safe place and greatest adventure.",
  "Cheers to love, laughter and happily ever after!",
];

function initGuestbook() {
  const form = $("#wishForm"), nameEl = $("#wishName"), textEl = $("#wishText");
  const list = $("#wishList"), empty = $("#noWishes"), toast = $("#wishToast");

  const render = () => {
    const wishes = store.get("ay-wishes");
    empty.hidden = wishes.length > 0;
    list.replaceChildren(...wishes.slice().reverse().map(w => {
      const card = document.createElement("article");
      card.className = "wish";
      const head = document.createElement("div"); head.className = "wish-head";
      const n = document.createElement("span"); n.className = "wish-name"; n.textContent = w.name;
      const d = document.createElement("span"); d.className = "wish-date"; d.textContent = new Date(w.at).toLocaleString();
      const t = document.createElement("p"); t.className = "wish-text"; t.textContent = w.text;
      head.append(n, d); card.append(head, t);
      return card;
    }));
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = nameEl.value.trim(), text = textEl.value.trim();
    nameEl.classList.toggle("error", !name);
    textEl.classList.toggle("error", !text);
    if (!name || !text) { (name ? textEl : nameEl).focus(); return; }

    store.set("ay-wishes", [...store.get("ay-wishes"), { name, text, at: new Date().toISOString() }]);
    deliver("New guestbook wish — Ahmed & Yasmeen", { Name: name, Wish: text });
    textEl.value = "";
    render();
    toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (toast.hidden = true), 5000);
  });
  [nameEl, textEl].forEach(el => el.addEventListener("input", () => el.classList.remove("error")));

  // suggestion modal
  const modal = $("#suggestModal"), sList = $("#suggestList");
  let shown = [];
  const showWishes = wishes => {
    shown = wishes;
    sList.replaceChildren(...wishes.map(w => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "suggest-item"; b.textContent = w;
      b.addEventListener("click", () => { textEl.value = w; textEl.classList.remove("error"); closeModal(modal); textEl.focus(); });
      return b;
    }));
  };
  // first batch is always the same five; "Generate more" shuffles in new ones
  $("#suggestBtn").addEventListener("click", () => { showWishes(WISHES.slice(0, 5)); openModal(modal); });
  $("#moreBtn").addEventListener("click", () =>
    showWishes(WISHES.filter(w => !shown.includes(w)).sort(() => Math.random() - 0.5).slice(0, 5)));

  render();
}

/* =========================================================
   INIT
   ========================================================= */
initIntro();
initCountdown();
initCalendar();
initAddToCalendar();
initMap();
initModals();
initRSVP();
initGuestbook();
