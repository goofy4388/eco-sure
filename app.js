// ---- CONFIG ----
// If you deploy the backend elsewhere, set this to that URL (ex: https://your-domain.com)
const API_URL = ""; // same origin by default

// Checklist data (based on your photo)
const CHECKLIST = [
  {
    id: "bar",
    title: "BAR",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
      "Countertops free of debris in coolers",
      "Soda guns, holder clean — lines to drain",
      "Sanitizer at ___ ppm / test strips available",
      "Bar mats clean / no yeast",
      "Beer taps cleaned / no yeast",
    ]
  },
  {
    id: "foh-rr",
    title: "FOH RR",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
    ]
  },
  {
    id: "expo",
    title: "EXPO LINE",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
      "Cold holding of items at 41°F or below (items stored at proper temp)",
      "Items stored at room temp documented with times",
      "Soda, tea spouts broken down completely & clean",
      "Ice is full, stored properly in ice bucket",
      "Hot holding of items at 140°F or above",
      "Towels immersed in proper and stamped clean sanitizer bucket",
    ]
  },
  {
    id: "ice-machine",
    title: "ICE MACHINE",
    items: [
      "Free of mold in chute/door/ceilings, track",
      "Ice buckets stored inverted and clean on rack/hook",
      "Ice scoop stored clean and proper in bin",
    ]
  },
  {
    id: "dish-area",
    title: "DISH AREA",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
      "Dish machine 180°F for hot OR cold water & sanitizer strength 200–400 ppm",
      "Dish chart — temp/sanitizer tracking",
      "Sanitizer/test strips/dish heat tape available",
      "Dish machine area clean & free of debris",
      "No cracked lexans / no tape or residue",
      "Dishes/lexans/pots free of food",
      "No standing water in sink / utensils stored clean & dry",
      "Spatulas/hanging utensils clean / not damaged",
    ]
  },
  {
    id: "dry-storage",
    title: "DRY STORAGE",
    items: [
      "Chemicals stored away from food",
      "All foods covered/rotated, scoops not in food",
      "No dented or damaged cans",
      "Heavy items (>30 lbs) stored below waist level",
    ]
  },
  {
    id: "back-line",
    title: "BACK LINE",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
      "Towels immersed in proper and stamped clean sanitizer bucket",
      "Salad spinner and other equip — clean and stored properly",
    ]
  },
  {
    id: "walk-in",
    title: "WALK-IN",
    items: [
      "Proper hierarchy — (Produce, dairy, seafood/pork, beef & chicken)",
      "All foods covered/rotated, scoops not in food",
      "Back up thermometers (min 1) in place — temp @ 40°F or less",
      "All food properly dated (2 dates) and not expired",
      "Walk-in floor clean",
      "Gaskets clean and in good repair",
      "Walk-in freezer at 0°F or below, gaskets in good repair",
      "Fan guards, shelves clean and free of rust/corrosion",
    ]
  },
  {
    id: "back-dock",
    title: "BACK DOCK",
    items: [
      "Dumpster lids closed / in good repair, drain plug in place",
      "No piles of trash; dumpster maintained",
      "Proper door sweeps, no gap at the bottom",
    ]
  },
  {
    id: "front-line",
    title: "FRONT LINE",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
      "Accurate and working thermometers in all coolers",
      "Back up thermometers — temp @ 40°F or less",
      "Towels immersed in proper and stamped clean sanitizer bucket",
      "All hot foods at 140°F or more",
      "All cold foods at 41°F or less",
      "Food Safety Spot Checks complete — document, training",
      "All gaskets in good repair and clean",
      "All lights working and shielded",
      "No to-go containers stored inverted; plateware/silverware clean",
    ]
  },
  {
    id: "behaviors",
    title: "BEHAVIORS",
    items: [
      "Employee drinking — lid and straw — local rules",
      "Cook line clean — all items stored and surfaces clean",
      "Proper cooling procedures, temps monitored",
      "Hand washing behaviors — washed when changing gloves",
      "Proper glove use — used when needed",
      "Knife holder and knives cleaned and stored properly",
      "Floors, walls, ceiling in good repair",
      "No food stored on floor or mop sink; trash trap location correct",
      "Pest control document; regular service maintained",
      "Mops and brooms stored on rack (not on floor); mop sink clean",
      "Only approved chemicals (updated MSDS), properly stored and labeled",
      "Glasses stored clean/dry (no mildew smell) and properly stored being used",
      "PPE, non-slip shoes, personal items — properly used/stored",
      "Food manager certificate and food handler — BBI & local rules",
    ]
  },
];

const $ = (sel) => document.querySelector(sel);
const checklistEl = $("#checklist");
const progressEl = $("#progress");
const submitBtn = $("#submitBtn");
const statusEl = $("#status");
const sendToEl = $("#sendTo");

const storeEl = $("#store");
const dateEl = $("#date");
const timeEl = $("#time");
const managerEl = $("#manager");

let shift = "am"; // am | pm

// State format:
// state = { am: { checks: {itemKey: bool}, notes: {itemKey: string}, photos: {sectionId: [FileMeta]} }, pm: {...} }
const state = loadState() || freshState();

function freshState() {
  return {
    am: { checks: {}, notes: {}, photos: {} },
    pm: { checks: {}, notes: {}, photos: {} },
    meta: { store: "", date: "", time: "", manager: "" }
  };
}

function saveState() {
  state.meta.store = storeEl.value.trim();
  state.meta.date = dateEl.value;
  state.meta.time = timeEl.value;
  state.meta.manager = managerEl.value.trim();
  localStorage.setItem("bbiChecklistState", JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem("bbiChecklistState");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function itemKey(sectionId, idx) {
  return `${sectionId}::${idx}`;
}

function setShift(newShift) {
  shift = newShift;
  document.querySelectorAll(".tab").forEach(btn => {
    const isActive = btn.dataset.shift === shift;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  render();
  updateProgress();
}

function render() {
  checklistEl.innerHTML = "";

  CHECKLIST.forEach(section => {
    const card = document.createElement("div");
    card.className = "card";

    const head = document.createElement("div");
    head.className = "cardHead";

    const title = document.createElement("h2");
    title.textContent = section.title;

    const badge = document.createElement("span");
    badge.className = "badge warn";
    badge.textContent = "Incomplete";
    badge.dataset.section = section.id;

    head.appendChild(title);
    head.appendChild(badge);

    const itemsWrap = document.createElement("div");
    itemsWrap.className = "items";

    section.items.forEach((txt, idx) => {
      const key = itemKey(section.id, idx);
      const row = document.createElement("div");
      row.className = "item";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = `${shift}-${key}`;
      cb.checked = !!state[shift].checks[key];

      cb.addEventListener("change", () => {
        state[shift].checks[key] = cb.checked;
        saveState();
        updateProgress();
        updateSectionBadges();
      });

      const label = document.createElement("label");
      label.setAttribute("for", cb.id);
      label.textContent = txt;

      const note = document.createElement("input");
      note.className = "note";
      note.placeholder = "Optional note…";
      note.value = state[shift].notes[key] || "";
      note.addEventListener("input", () => {
        state[shift].notes[key] = note.value;
        saveState();
      });

      row.appendChild(cb);
      row.appendChild(label);
      row.appendChild(note);
      itemsWrap.appendChild(row);
    });

    // Photos per section
    const photosBox = document.createElement("div");
    photosBox.className = "photos";

    const photoRow = document.createElement("div");
    photoRow.className = "photoRow";

    const photoLabel = document.createElement("div");
    photoLabel.style.fontSize = "12px";
    photoLabel.style.opacity = ".85";
    photoLabel.textContent = "Add photos for this area:";

    const photoInput = document.createElement("input");
    photoInput.type = "file";
    photoInput.accept = "image/*";
    photoInput.capture = "environment";
    photoInput.multiple = true;

    photoInput.addEventListener("change", async () => {
      const files = Array.from(photoInput.files || []);
      if (!files.length) return;

      // Store as base64 in localStorage (keeps it “all in one” for now).
      // NOTE: lots of photos can exceed localStorage limits. If you’ll take many photos,
      // we can swap this to IndexedDB.
      const metas = state[shift].photos[section.id] || [];
      for (const f of files) {
        const b64 = await fileToBase64(f);
        metas.push({ name: f.name, type: f.type, dataUrl: b64, size: f.size });
      }
      state[shift].photos[section.id] = metas;
      saveState();
      render(); // rerender to show new thumbs
    });

    const thumbs = document.createElement("div");
    thumbs.className = "thumbs";
    const stored = state[shift].photos[section.id] || [];
    stored.forEach((p, i) => {
      const img = document.createElement("img");
      img.src = p.dataUrl;
      img.title = p.name;

      img.addEventListener("click", () => {
        // quick delete on tap
        if (confirm("Remove this photo?")) {
          const cur = state[shift].photos[section.id] || [];
          cur.splice(i, 1);
          state[shift].photos[section.id] = cur;
          saveState();
          render();
        }
      });

      thumbs.appendChild(img);
    });

    photoRow.appendChild(photoLabel);
    photoRow.appendChild(photoInput);

    photosBox.appendChild(photoRow);
    photosBox.appendChild(thumbs);

    card.appendChild(head);
    card.appendChild(itemsWrap);
    card.appendChild(photosBox);

    checklistEl.appendChild(card);
  });

  updateSectionBadges();
}

function updateSectionBadges() {
  CHECKLIST.forEach(section => {
    const badge = document.querySelector(`.badge[data-section="${section.id}"]`);
    if (!badge) return;

    const all = section.items.map((_, idx) => state[shift].checks[itemKey(section.id, idx)] === true);
    const done = all.every(Boolean);

    badge.classList.toggle("ok", done);
    badge.classList.toggle("warn", !done);
    badge.textContent = done ? "Complete" : "Incomplete";
  });
}

function countTotals() {
  let total = 0;
  let checked = 0;
  CHECKLIST.forEach(section => {
    section.items.forEach((_, idx) => {
      total++;
      if (state[shift].checks[itemKey(section.id, idx)]) checked++;
    });
  });
  return { total, checked };
}

function updateProgress() {
  const { total, checked } = countTotals();
  progressEl.textContent = `${shift.toUpperCase()} Progress: ${checked}/${total} items checked.`;

  const allDone = checked === total;
  const emailOk = (sendToEl.value || "").trim().length > 3 && (sendToEl.value || "").includes("@");

  submitBtn.disabled = !(allDone && emailOk);

  // also update section badges
  updateSectionBadges();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function submit() {
  statusEl.className = "status";
  statusEl.textContent = "";

  const toEmail = sendToEl.value.trim();
  if (!toEmail) {
    statusEl.className = "status err";
    statusEl.textContent = "Email is required.";
    return;
  }

  // validate complete
  const { total, checked } = countTotals();
  if (checked !== total) {
    statusEl.className = "status err";
    statusEl.textContent = "All items must be checked before submitting.";
    return;
  }

  const payload = {
    shift,
    toEmail,
    meta: {
      store: storeEl.value.trim(),
      date: dateEl.value,
      time: timeEl.value,
      manager: managerEl.value.trim(),
      submittedAt: new Date().toISOString(),
    },
    checklist: CHECKLIST.map(section => ({
      id: section.id,
      title: section.title,
      items: section.items.map((txt, idx) => {
        const key = itemKey(section.id, idx);
        return {
          text: txt,
          checked: true,
          note: state[shift].notes[key] || ""
        };
      }),
      photos: (state[shift].photos[section.id] || []).map(p => ({
        name: p.name,
        type: p.type,
        dataUrl: p.dataUrl
      }))
    }))
  };

  try {
    submitBtn.disabled = true;
    statusEl.textContent = "Submitting…";

    const res = await fetch(`${API_URL}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Submit failed");
    }

    statusEl.className = "status ok";
    statusEl.textContent = "Sent! Checklist emailed successfully.";

    // Optional: clear shift state after submit
    // state[shift] = { checks: {}, notes: {}, photos: {} };
    // saveState(); render(); updateProgress();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = `Error: ${e.message}`;
    updateProgress();
  }
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => setShift(btn.dataset.shift));
});

sendToEl.addEventListener("input", updateProgress);
[storeEl, dateEl, timeEl, managerEl].forEach(el => el.addEventListener("input", saveState));

submitBtn.addEventListener("click", submit);

// Init defaults
(function init() {
  // set date/time defaults
  const now = new Date();
  if (!state.meta.date) state.meta.date = now.toISOString().slice(0,10);
  if (!state.meta.time) state.meta.time = now.toTimeString().slice(0,5);

  storeEl.value = state.meta.store || "";
  dateEl.value = state.meta.date || "";
  timeEl.value = state.meta.time || "";
  managerEl.value = state.meta.manager || "";

  render();
  updateProgress();
})();
