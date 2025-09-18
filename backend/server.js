const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let reliefData = {}; // temporary storage

// Test route
app.get("/", (req, res) => {
  res.send("LifeLink Backend is Running 🚀");
});

// Add Relief
app.post("/addRelief", (req, res) => {
  console.log("Incoming Body:", req.body); // 👀 Debug line
  const { id, item, qty, location } = req.body || {};
  if (!id || !item || !qty || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }
  reliefData[id] = { item, qty, location };
  res.json({ message: "Relief added successfully", data: reliefData[id] });
});

// Check Relief
app.get("/checkRelief/:id", (req, res) => {
  const id = req.params.id;
  if (reliefData[id]) {
    res.json({ id, ...reliefData[id] });
  } else {
    res.status(404).json({ message: "Relief not found" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
