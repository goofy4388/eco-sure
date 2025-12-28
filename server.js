import express from "express";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json({ limit: "20mb" })); // increase if you add lots of photos

// Serve the frontend from same server (simple)
app.use(express.static("."));

app.post("/api/submit", async (req, res) => {
  try {
    const { toEmail, shift, meta, checklist } = req.body || {};
    if (!toEmail || !toEmail.includes("@")) return res.status(400).send("Invalid toEmail");
    if (!shift || !meta || !Array.isArray(checklist)) return res.status(400).send("Bad payload");

    // SMTP config via env vars (recommended)
    // Example: Gmail App Password or your company SMTP
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      FROM_EMAIL
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
      return res.status(500).send(
        "Missing SMTP env vars. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL."
      );
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    const subject = `BBI Checklist (${shift.toUpperCase()}) — ${meta.store || "Store"} — ${meta.date || ""}`;

    const html = buildHtmlReport({ shift, meta, checklist });

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      html
    });

    res.status(200).send("OK");
  } catch (e) {
    res.status(500).send(e?.message || "Server error");
  }
});

function esc(s="") {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}

function buildHtmlReport({ shift, meta, checklist }) {
  const header = `
    <div style="font-family:Arial,sans-serif;">
      <h2 style="margin:0 0 6px;">BBI Internal Checklist — ${esc(shift.toUpperCase())}</h2>
      <div style="margin:0 0 14px; color:#333;">
        <div><b>Store:</b> ${esc(meta.store || "")}</div>
        <div><b>Date:</b> ${esc(meta.date || "")} &nbsp; <b>Time:</b> ${esc(meta.time || "")}</div>
        <div><b>Completed By:</b> ${esc(meta.manager || "")}</div>
        <div><b>Submitted At:</b> ${esc(meta.submittedAt || "")}</div>
      </div>
  `;

  const sections = checklist.map(sec => {
    const items = sec.items.map(it => `
      <li style="margin:6px 0;">
        ✅ ${esc(it.text)}
        ${it.note ? `<div style="margin-left:18px; color:#555;"><i>Note:</i> ${esc(it.note)}</div>` : ""}
      </li>
    `).join("");

    const photos = (sec.photos || []).map(p => `
      <div style="display:inline-block; margin:6px 6px 0 0;">
        <img src="${p.dataUrl}" alt="${esc(p.name)}"
             style="width:120px;height:120px;object-fit:cover;border:1px solid #ddd;border-radius:10px;" />
        <div style="width:120px;font-size:11px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${esc(p.name)}
        </div>
      </div>
    `).join("");

    return `
      <div style="border:1px solid #ddd;border-radius:12px;padding:12px;margin:12px 0;">
        <h3 style="margin:0 0 8px;">${esc(sec.title)}</h3>
        <ul style="margin:0 0 10px; padding-left:18px;">${items}</ul>
        ${photos ? `<div><b>Photos:</b><div>${photos}</div></div>` : `<div style="color:#777;font-size:12px;">No photos.</div>`}
      </div>
    `;
  }).join("");

  return header + sections + `</div>`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
