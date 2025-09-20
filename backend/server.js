// server.js
// LifeLink Backend with Blockchain Transparency
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----------------------------
// Fake blockchain storage
// ----------------------------
let blockchain = {
  donations: [], // Aid Fund Transactions 💰
  supplies: []   // Relief Supply Logs 📦
};

// Utility: generate hash
function generateHash(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

// Utility: generate QR code
function generateQrCode(data) {
  return QRCode.toDataURL(data);
}

// ----------------------------
// 1. Aid Fund Transactions 💰
// ----------------------------
app.post("/donate", (req, res) => {
  const { donor, amount, purpose } = req.body;
  if (!donor || !amount || !purpose) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const donation = { donor, amount, purpose, timestamp: Date.now() };
  const txHash = generateHash(donation);
  donation.txHash = txHash;

  blockchain.donations.push(donation);

  res.json({
    message: "Donation recorded on blockchain ✅",
    donation,
    qrCode: `http://localhost:5000/verifyRecord/${txHash}`
  });
});

// ----------------------------
// 2. Relief Supply Logs 📦
// ----------------------------
app.post("/dispatch", (req, res) => {
  const { item, qty, location } = req.body;
  if (!item || !qty || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const supply = { item, qty, location, timestamp: Date.now() };
  const txHash = generateHash(supply);
  supply.txHash = txHash;

  blockchain.supplies.push(supply);

  res.json({
    message: "Supply dispatch logged on blockchain ✅",
    supply,
    qrCode: `http://localhost:5000/verifyRecord/${txHash}`
  });
});

// ----------------------------
// 3. Verification Layer 👥
// ----------------------------
app.get("/verifyRecord/:txHash", (req, res) => {
  const txHash = req.params.txHash;

  // Look in donations
  const donation = blockchain.donations.find(d => d.txHash === txHash);
  if (donation) {
    return res.json({
      type: "donation",
      message: "Donation record found ✅",
      data: donation
    });
  }

  // Look in supplies
  const supply = blockchain.supplies.find(s => s.txHash === txHash);
  if (supply) {
    return res.json({
      type: "supply",
      message: "Supply dispatch record found ✅",
      data: supply
    });
  }

  // Not found
  res.status(404).json({ message: "Record not found ❌", txHash });
});

// Generate QR code for verification link
app.get("/generateQR/:txHash", async (req, res) => {
  const txHash = req.params.txHash;
  const verifyUrl = `http://localhost:5000/verifyRecord/${txHash}`;
  const qrCode = await generateQrCode(verifyUrl);

  res.json({
    txHash,
    verifyUrl,
    qrCode
  });
});

// ----------------------------
// 4. Audit Trail 📝
// ----------------------------
app.get("/auditTrail", (req, res) => {
  res.json({
    donations: blockchain.donations,
    supplies: blockchain.supplies
  });
});

// ----------------------------
// Server Start
// ----------------------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 LifeLink server running at http://localhost:${PORT}`);
});