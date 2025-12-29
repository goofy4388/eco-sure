// =========================
// BBI Checklist (AM/PM) + PDF Download
// - Checks + optional notes
// - Photos per section (tap photo to delete)
// - Submit enabled only when ALL items checked AND meta filled
// - Submit generates & downloads a finished PDF (with photos)
// =========================

const $ = (sel) => document.querySelector(sel);
const checklistEl = $("#checklist");
const progressEl = $("#progress");
const submitBtn = $("#submitBtn");
const statusEl = $("#status");
const resetShiftBtn = $("#resetShiftBtn");
const resetAllBtn = $("#resetAllBtn");

const storeEl = $("#store");
const dateEl = $("#date");
const timeEl = $("#time");
const managerEl = $("#manager");

// ---- Checklist data (based on your form photo) ----
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
      "Beer taps cleaned / no yeast"
    ]
  },
  { id: "foh-rr", title: "FOH RR", items: ["Soap, towels, hot water, sign, trash bin at ALL handwash sink"] },
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
      "Towels immersed in proper and stamped clean sanitizer bucket"
    ]
  },
  {
    id: "ice-machine",
    title: "ICE MACHINE",
    items: [
      "Free of mold in chute/door/ceilings, track",
      "Ice buckets stored inverted and clean on rack/hook",
      "Ice scoop stored clean and proper in bin"
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
      "Spatulas/hanging utensils clean / not damaged"
    ]
  },
  {
    id: "dry-storage",
    title: "DRY STORAGE",
    items: [
      "Chemicals stored away from food",
      "All foods covered/rotated, scoops not in food",
      "No dented or damaged cans",
      "Heavy items (>30 lbs) stored below waist level"
    ]
  },
  {
    id: "back-line",
    title: "BACK LINE",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
      "Towels immersed in proper and stamped clean sanitizer bucket",
      "Salad spinner and other equip — clean and stored properly"
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
      "Fan guards, shelves clean and free of rust/corrosion"
    ]
  },
  {
    id: "back-dock",
    title: "BACK DOCK",
    items: [
      "Dumpster lids closed / in good repair, drain plug in place",
      "No piles of trash; dumpster maintained",
      "Proper door sweeps, no gap at the bottom"
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
      "No to-go containers stored inverted; plateware/silverware clean"
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
      "Food manager certificate and food handler — BBI & local rules"
    ]
  }
];

// Shift: "am" | "pm"
let shift = "am";

// State in localStorage:
// state = {
//   meta: { store, date, time, manager },
//   am: { checks: {}, notes: {}, photos: {sectionId: [ {name,type,dataUrl,size} ] } },
//   pm: { checks: {}, notes: {}, photos: {sectionId: [ ... ] } }
// }
const state = loadState() || freshState();

function freshState() {
  return {
    meta: { store: "", date: "", time: "", manager: "" },
    am: { checks: {}, notes: {}, photos: {} },
    pm: { checks: {}, notes: {}, photos: {} }
  };
}

function saveState() {
  state.meta.store = storeEl.value.trim();
  state.meta.date = dateEl.value;
  state.meta.time = timeEl.value;
  state.meta.manager = managerEl.value.trim();
  localStorage.setItem("bbiChecklistState_pdf", JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem("bbiChecklistState_pdf");
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
    const active = btn.dataset.shift === shift;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  render();
  updateUIState();
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
        updateUIState();
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

    const hint = document.createElement("div");
    hint.className = "photoHint";
    hint.textContent = "Add photos for this area:";

    const photoInput = document.createElement("input");
    photoInput.type = "file";
    photoInput.accept = "image/*";
    photoInput.capture = "environment";
    photoInput.multiple = true;

    photoInput.addEventListener("change", async () => {
      const files = Array.from(photoInput.files || []);
      if (!files.length) return;

      const metas = state[shift].photos[section.id] || [];
      for (const f of files) {
        const dataUrl = await fileToDataUrl(f, { maxDimension: 1400, quality: 0.82 });
        metas.push({ name: f.name || "photo.jpg", type: "image/jpeg", dataUrl, size: f.size });
      }
      state[shift].photos[section.id] = metas;
      saveState();
      render();
      updateUIState();
    });

    const thumbs = document.createElement("div");
    thumbs.className = "thumbs";
    const stored = state[shift].photos[section.id] || [];

    stored.forEach((p, i) => {
      const img = document.createElement("img");
      img.src = p.dataUrl;
      img.title = "Tap to remove";
      img.addEventListener("click", () => {
        if (confirm("Remove this photo?")) {
          const cur = state[shift].photos[section.id] || [];
          cur.splice(i, 1);
          state[shift].photos[section.id] = cur;
          saveState();
          render();
          updateUIState();
        }
      });
      thumbs.appendChild(img);
    });

    photoRow.appendChild(hint);
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

function updateSectionBadges() {
  CHECKLIST.forEach(section => {
    const badge = document.querySelector(`.badge[data-section="${section.id}"]`);
    if (!badge) return;

    const done = section.items.every((_, idx) => state[shift].checks[itemKey(section.id, idx)] === true);
    badge.classList.toggle("ok", done);
    badge.classList.toggle("warn", !done);
    badge.textContent = done ? "Complete" : "Incomplete";
  });
}

function metaComplete() {
  return (
    !!storeEl.value.trim() &&
    !!dateEl.value &&
    !!timeEl.value &&
    !!managerEl.value.trim()
  );
}

function updateUIState() {
  const { total, checked } = countTotals();
  progressEl.textContent = `${shift.toUpperCase()} Progress: ${checked}/${total} items checked.`;

  updateSectionBadges();

  const allDone = checked === total;
  submitBtn.disabled = !(allDone && metaComplete());
}

// -------- Photo helper (compress to JPEG for smaller PDFs/storage) --------
async function fileToDataUrl(file, { maxDimension = 1400, quality = 0.82 } = {}) {
  const img = await loadImageFromFile(file);

  const { width, height } = img;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  return canvas.toDataURL("image/jpeg", quality);
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

// -------- PDF generation --------
async function submit() {
  statusEl.className = "status";
  statusEl.textContent = "";

  const { total, checked } = countTotals();
  if (checked !== total) {
    statusEl.className = "status err";
    statusEl.textContent = "All items must be checked before submitting.";
    return;
  }

  if (!metaComplete()) {
    statusEl.className = "status err";
    statusEl.textContent = "Fill Store, Date, Time, and Completed By before submitting.";
    return;
  }

  try {
    submitBtn.disabled = true;
    statusEl.textContent = "Building PDF…";

    const meta = {
      store: storeEl.value.trim(),
      date: dateEl.value,
      time: timeEl.value,
      manager: managerEl.value.trim(),
      submittedAt: new Date().toLocaleString()
    };

    const doc = await buildPdf({ shift, meta });

    const safeStore = meta.store.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    const filename = `BBI-Checklist-${shift.toUpperCase()}-${safeStore || "Store"}-${meta.date}.pdf`;

    doc.save(filename);

    statusEl.className = "status ok";
    statusEl.textContent = "PDF created. If it opens preview, tap Share → Save to Files.";
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = `PDF Error: ${e?.message || e}`;
  } finally {
    submitBtn.disabled = false;
    updateUIState();
  }
}

async function buildPdf({ shift, meta }) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  const margin = 40;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;

  let y = margin;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`BBI Internal Checklist — ${shift.toUpperCase()} Shift`, margin, y);
  y += 22;

  // Meta block
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const metaLines = [
    `Store: ${meta.store}`,
    `Date: ${meta.date}    Time: ${meta.time}`,
    `Completed By: ${meta.manager}`,
    `Submitted: ${meta.submittedAt}`
  ];

  y = writeWrapped(doc, metaLines.join("\n"), margin, y, maxW, 14);
  y += 10;

  // Status summary
  const { total } = countTotals();
  doc.setFont("helvetica", "bold");
  doc.text(`Status: COMPLETE (${total}/${total} checked)`, margin, y);
  doc.setFont("helvetica", "normal");
  y += 18;

  // Sections
  for (const section of CHECKLIST) {
    y = ensureSpace(doc, y, 26, margin);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(section.title, margin, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    // Items + notes
    for (let idx = 0; idx < section.items.length; idx++) {
      const key = itemKey(section.id, idx);
      const note = (state[shift].notes[key] || "").trim();

      y = ensureSpace(doc, y, 18, margin);
      y = writeWrapped(doc, `✅ ${section.items[idx]}`, margin, y, maxW, 14);

      if (note) {
        doc.setFontSize(10);
        y = ensureSpace(doc, y, 16, margin);
        y = writeWrapped(doc, `   Note: ${note}`, margin, y, maxW, 13);
        doc.setFontSize(11);
      }

      y += 2;
    }

    // Photos grid
    const photos = state[shift].photos[section.id] || [];
    if (photos.length) {
      y += 6;
      y = ensureSpace(doc, y, 18, margin);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Photos:", margin, y);
      doc.setFont("helvetica", "normal");
      y += 10;

      const thumb = 120;
      const gap = 10;
      const perRow = Math.max(1, Math.floor((maxW + gap) / (thumb + gap)));

      let col = 0;
      let x = margin;

      for (const p of photos) {
        y = ensureSpace(doc, y, thumb + 34, margin);

        const fmt = p.dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
        doc.addImage(p.dataUrl, fmt, x, y, thumb, thumb);

        doc.setFontSize(9);
        doc.text((p.name || "photo").slice(0, 26), x, y + thumb + 12);
        doc.setFontSize(11);

        col++;
        if (col >= perRow) {
          col = 0;
          x = margin;
          y += thumb + 26;
        } else {
          x += thumb + gap;
        }
      }

      if (col !== 0) y += thumb + 26;
    }

    y += 8;
  }

  addPageNumbers(doc);
  return doc;
}

function writeWrapped(doc, text, x, y, maxWidth, lineHeight) {
  const lines = String(text).split("\n");
  for (const raw of lines) {
    const wrapped = doc.splitTextToSize(raw, maxWidth);
    for (const w of wrapped) {
      y = ensureSpace(doc, y, lineHeight, 40);
      doc.text(w, x, y);
      y += lineHeight;
    }
  }
  return y;
}

function ensureSpace(doc, y, needed, margin) {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - margin) {
    doc.addPage();
    return margin;
  }
  return y;
}

function addPageNumbers(doc) {
  const pageCount = doc.getNumberOfPages();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 95, pageH - 25);
  }
}

// -------- Events / Init --------
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => setShift(btn.dataset.shift));
});

[storeEl, dateEl, timeEl, managerEl].forEach(el => el.addEventListener("input", () => {
  saveState();
  updateUIState();
}));

submitBtn.addEventListener("click", submit);

(function init() {
  // Defaults
  const now = new Date();
  if (!state.meta.date) state.meta.date = now.toISOString().slice(0, 10);
  if (!state.meta.time) state.meta.time = now.toTimeString().slice(0, 5);

  storeEl.value = state.meta.store || "";
  dateEl.value = state.meta.date || "";
  timeEl.value = state.meta.time || "";
  managerEl.value = state.meta.manager || "";

  render();
  updateUIState();
})();
/* =========================
   RESET BUTTON LOGIC
========================= */

function resetCurrentShift(){
  if (!confirm(`Clear everything for ${shift.toUpperCase()} shift?`)) return;

  CHECKLIST.forEach(sec => {
    state[shift][sec.title].forEach(r => {
      r.done = false;
      r.note = "";
      r.photo = null;
    });
  });

  render();
}

function resetAll(){
  if (!confirm("Clear EVERYTHING (AM + PM + header info)?")) return;

  ["am","pm"].forEach(s => {
    CHECKLIST.forEach(sec => {
      state[s][sec.title].forEach(r => {
        r.done = false;
        r.note = "";
        r.photo = null;
      });
    });
  });

  $("#manager").value = "";
  $("#store").value = "";

  const now = new Date();
  $("#date").value = now.toISOString().slice(0,10);
  $("#time").value = now.toTimeString().slice(0,5);

  render();
}
resetShiftBtn.onclick = resetCurrentShift;
resetAllBtn.onclick = resetAll;