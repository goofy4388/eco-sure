import express from "express";

const app = express();

// Serve all files in this folder (index.html, styles.css, app.js)
app.use(express.static("."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BBI Checklist running at: http://localhost:${PORT}`);
});