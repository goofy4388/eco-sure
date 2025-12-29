/* =========================================================
   BBI INTERNAL CHECKLIST
   - AM/PM tabs
   - 1 checkbox per item
   - note + photo per item
   - submit -> downloads PDF
   - reset shift / reset all
========================================================= */

const $ = (s) => document.querySelector(s);

const sectionsEl = $("#sections");
const submitBtn = $("#submitBtn");
const resetShiftBtn = $("#resetShiftBtn");
const resetAllBtn = $("#resetAllBtn");
const statusEl = $("#status");

let shift = "am";

// --- Checklist data (from your BBI Internal Checklist sheet) ---
const CHECKLIST = [
  {
    title: "BAR",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
      "Accurate thermometer in coolers",
      "Soda guns/holder clean - lines to drain",
      "Sanitizer at ____ ppm / test strips available",
      "Beer taps cleaned / no yeast"
    ]
  },
  {
    title: "FOH RR",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink"
    ]
  },
  {
    title: "EXPO LINE",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
      "Cold holding at 41°F or less (food properly iced)",
      "Items stored at room temp documented with times",
      "Soda tea spouts / broken nozzles completely & clean",
      "Hot holding of items at 140°F or above",
      "Food portioned, dated in ice bath",
      "Towels immersed in proper and stamped clean sanitizer bucket"
    ]
  },
  {
    title: "DISH AREA",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
      "Dish machine 180°F / chlorine sanitizer strength 200–400 ppm",
      "Dish chart – temp/sanitizer tracking",
      "Sanitizer test strips / dish heat tape available",
      "Drain basket free of debris",
      "No cracked lexans / no tape or residue",
      "Dishes/lexans/pots free of food",
      "No cleaner / chemicals on dish utensils (stored clean & dry)",
      "Spatulas/hanging utensils clean / not damaged"
    ]
  },
  {
    title: "ICE MACHINE",
    items: [
      "Free of mold in chute/door/ceilings/track",
      "Ice buckets stored inverted and clean on rack/hook",
      "Ice scoop stored clean and proper"
    ]
  },
  {
    title: "DRY STORAGE",
    items: [
      "Chemicals stored away from food",
      "All foods covered/rotated, scoops not in food",
      "No dented or damaged cans",
      "Heavy items (>30 lbs) stored below waist level"
    ]
  },
  {
    title: "BACK LINE",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
      "Towels immersed in proper and stamped clean sanitizer bucket",
      "Flat-top and equipment clean",
      "Salad spinner and other equip – clean and stored properly"
    ]
  },
  {
    title: "WALK-IN",
    items: [
      "Proper hierarchy (produce, dairy/seafood/pork, beef & chicken)",
      "All products covered, separated, and properly placed/dated",
      "Back-up thermometers (min 1) in place – temp @ 40°F or less",
      "All food properly dated (2 dates) and not expired",
      "All racks clean and in good repair",
      "Gaskets clean and in good repair",
      "Walk-in freezer at 0°F or below, baskets in good repair",
      "Fan guards / shelves clean and free of rust/corrosion"
    ]
  },
  {
    title: "BACK DOCK",
    items: [
      "Dumpster lids closed / in good repair / drain plug in place",
      "No grease trap leaks / area free of trash",
      "Proper door sweeps, no gap at the bottom"
    ]
  },
  {
    title: "FRONT LINE",
    items: [
      "Soap, towels, hot water, sign, trash bin at ALL handwash sink",
      "Accurate and working thermometers in all coolers",
      "Back up thermometers – temp @ 40°F or less",
      "Towels immersed in proper and stamped clean sanitizer bucket",
      "All hot foods at 140°F or more",
      "All cold foods at 41°F or less",
      "Food rotation, FIFO, done and documented / training",
      "All gaskets in good repair and clean",
      "All lights working and shielded",
      "To go containers stored inverted, plate ware/silverware clean"
    ]
  },
  {
    title: "BEHAVIORS",
    items: [
      "Employee drinking – lid and straw – local rules",
      "Cross contamination – color boards, knives and surfaces clean",
      "Proper cooling procedures, temps monitored",
      "Hand washing behaviors – washed when changing gloves",
      "Proper glove use – no bare hand contact with ready-to-eat",
      "Knife holder and knives cleaned and stored properly",
      "Floors, walls, ceiling in good repair",
      "No food on floor, no equipment in trap location",
      "Pest control document, regular service maintained",
      "Mops and brooms stored on rack (not on floor), mop sink clean",
      "Only approved chemicals (updated MSDS), properly stored & labeled",
      "GM has current, updated MSDS binder, crew trained",
      "PPE, non-slip shoes, personal items properly used/stored",
      "Food mgr certificate and food handler – BBI & local rules"
    ]
  }
];

// --- State ---
const state = { am: {}, pm: {} };
for (const sec of CHECKLIST) {
  state.am[sec.title] = sec.items.map(txt => ({ item: txt, done:false, note:"", photo:null }));
  state.pm[sec.title] = sec.items.map(txt => ({ item: txt, done:false, note:"", photo:null }));
}

// --- Render ---
function render(){
  sectionsEl.innerHTML = "";

  for (const sec of CHECKLIST) {
    const card = document.createElement("div");
    card.className = "section";

    const h2 = document.createElement("h2");
    h2.textContent = sec.title;
    card.appendChild(h2);

    const legend = document.createElement("div");
    legend.className = "legend";
    legend.innerHTML = `
      <div>✔</div>
      <div>Item</div>
      <div>Note</div>
      <div>Photo</div>
    `;
    card.appendChild(legend);

    for (const row of state[shift][sec.title]) {
      const r = document.createElement("div");
      r.className = "row";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = row.done;
      cb.onchange = () => row.done = cb.checked;

      const item = document.createElement("div");
      item.className = "itemText";
      item.textContent = row.item;

      const note = document.createElement("input");
      note.className = "note";
      note.type = "text";
      note.placeholder = "Note (optional)";
      note.value = row.note;
      note.oninput = () => row.note = note.value;

      const photo = document.createElement("input");
      photo.className = "photo";
      photo.type = "file";
      photo.accept = "image/*";
      photo.capture = "environment";
      photo.onchange = (e) => row.photo = e.target.files?.[0] || null;

      r.append(cb, item, note, photo);
      card.appendChild(r);
    }

    sectionsEl.appendChild(card);
  }
}

// --- Tabs ---
document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    shift = btn.dataset.shift;
    render();
  });
});

// --- Resets ---
function resetCurrentShift(){
  if (!confirm(`Reset ${shift.toUpperCase()} shift checklist?`)) return;

  for (const sec of CHECKLIST) {
    for (const row of state[shift][sec.title]) {
      row.done = false;
      row.note = "";
      row.photo = null;
    }
  }
  render();
}

function resetAll(){
  if (!confirm("Reset ALL (AM + PM + header fields)?")) return;

  for (const s of ["am","pm"]) {
    for (const sec of CHECKLIST) {
      for (const row of state[s][sec.title]) {
        row.done = false;
        row.note = "";
        row.photo = null;
      }
    }
  }

  $("#store").value = "";
  $("#amManager").value = "";
  $("#pmManager").value = "";
  $("#completedBy").value = "";

  const now = new Date();
  $("#date").value = now.toISOString().slice(0,10);
  $("#time").value = now.toTimeString().slice(0,5);

  render();
}

resetShiftBtn.addEventListener("click", resetCurrentShift);
resetAllBtn.addEventListener("click", resetAll);

// --- PDF ---
async function fileToDataUrl(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

submitBtn.addEventListener("click", async ()=>{
  statusEl.className = "status";
  statusEl.textContent = "Building PDF…";

  try{
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:"pt", format:"letter" });
    const margin = 40;
    const pageH = doc.internal.pageSize.getHeight();
    const pageW = doc.internal.pageSize.getWidth();
    const maxW = pageW - margin*2;
    let y = margin;

    const ensure = (h) => {
      if (y + h > pageH - margin) { doc.addPage(); y = margin; }
    };

    const store = $("#store").value || "";
    const date = $("#date").value || "";
    const time = $("#time").value || "";
    const amMgr = $("#amManager").value || "";
    const pmMgr = $("#pmManager").value || "";
    const completedBy = $("#completedBy").value || "";

    doc.setFont("helvetica","bold"); doc.setFontSize(15);
    doc.text(`BBI Internal Checklist — ${shift.toUpperCase()}`, margin, y); y += 18;

    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    const header = [
      store ? `Store: ${store}` : "",
      `Date: ${date}  Time: ${time}`,
      amMgr ? `AM Manager: ${amMgr}` : "",
      pmMgr ? `PM Manager: ${pmMgr}` : "",
      completedBy ? `Completed By: ${completedBy}` : ""
    ].filter(Boolean).join("   |   ");

    const wrapped = doc.splitTextToSize(header, maxW);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 12 + 10;

    for (const sec of CHECKLIST) {
      ensure(24);
      doc.setFont("helvetica","bold"); doc.setFontSize(12);
      doc.text(sec.title, margin, y); y += 12;
      doc.setFont("helvetica","normal"); doc.setFontSize(10);

      for (const row of state[shift][sec.title]) {
        const prefix = row.done ? "✅" : "⬜";
        const line = `${prefix} ${row.item}${row.note ? " — " + row.note : ""}`;
        const lines = doc.splitTextToSize(line, maxW);
        ensure(lines.length * 12 + 6);
        doc.text(lines, margin, y);
        y += lines.length * 12 + 2;

        // Photo (optional)
        if (row.photo) {
          const dataUrl = await fileToDataUrl(row.photo);
          ensure(120);
          doc.addImage(dataUrl, "JPEG", margin, y, 140, 105);
          y += 110;
        }
      }

      y += 8;
    }

    const safeStore = (store || "Store").replace(/[^a-z0-9]+/gi,"-");
    const filename = `BBI-${shift.toUpperCase()}-${safeStore}-${date || "date"}.pdf`;
    doc.save(filename);

    statusEl.className = "status ok";
    statusEl.textContent = "PDF downloaded.";
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = `PDF Error: ${e?.message || e}`;
  }
});

// --- Init ---
(() => {
  const now = new Date();
  $("#date").value = now.toISOString().slice(0,10);
  $("#time").value = now.toTimeString().slice(0,5);
  render();
})();