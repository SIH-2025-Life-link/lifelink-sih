// server.js
// LifeLink backend (Node.js + ethers.js) — connects to Solidity contract and provides APIs
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const crypto = require("crypto");
const qrcode = require("qrcode");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs-extra");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());

// ------------ Config (from .env) ------------
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const ADMIN_REGISTER_CODE = process.env.ADMIN_REGISTER_CODE || "admin_secret";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const PROVIDER_URL = process.env.PROVIDER_URL || "";
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const LEDGER_FILE = path.join(__dirname, "ledger.json");

// Ensure ledger file exists
if (!fs.existsSync(LEDGER_FILE)) fs.writeJsonSync(LEDGER_FILE, { donations: [], supplies: [] }, { spaces: 2 });

// Rate limiter
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

// ------------ Simple in-memory users (demo) ------------
const usersFile = path.join(__dirname, "users.json");
if (!fs.existsSync(usersFile)) fs.writeJsonSync(usersFile, {}, { spaces: 2 });

async function loadUsers() { return fs.readJson(usersFile); }
async function saveUsers(data) { return fs.writeJson(usersFile, data, { spaces: 2 }); }

// ------------ Ethers setup ------------
let provider, wallet, contract;

if (PROVIDER_URL && WALLET_PRIVATE_KEY && CONTRACT_ADDRESS) {
  provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
  wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

  const abi = [
    "event DonationRecorded(address indexed sender, string donorName, uint256 amount, string purpose, bytes32 txId, uint256 timestamp)",
    "event DispatchRecorded(address indexed sender, string item, uint256 qty, string fromLoc, string toLoc, bytes32 trackingId, uint256 timestamp)",
    "function recordDonation(string donorName, uint256 amount, string purpose, bytes32 txId) external",
    "function recordDispatch(string item, uint256 qty, string fromLoc, string toLoc, bytes32 trackingId) external",
    "function isRecorded(bytes32 id) external view returns (bool)"
  ];

  contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
  console.log("Ethers contract initialized:", CONTRACT_ADDRESS);
} else {
  console.warn("Ethers not fully configured. On-chain calls will be mocked.");
}

// ------------ Utilities ------------
function generatePseudoMac() {
  return Array.from({ length: 6 })
    .map(() => ("0" + Math.floor(Math.random() * 256).toString(16)).slice(-2))
    .join(":");
}

function generateTrackingId(payload) {
  const rnd = crypto.randomBytes(8).toString("hex");
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(payload) + rnd + Date.now()));
  return hash;
}

async function appendLedger(type, record) {
  const ledger = await fs.readJson(LEDGER_FILE);
  ledger[type].push(record);
  await fs.writeJson(LEDGER_FILE, ledger, { spaces: 2 });
}

function signToken(payload) { return jwt.sign(payload, JWT_SECRET, { expiresIn: "4h" }); }
function verifyToken(token) { try { return jwt.verify(token, JWT_SECRET); } catch { return null; } }

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Auth required" });
  const token = auth.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: "Invalid token" });
  req.user = decoded;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

// ------------ Routes ------------

app.get("/", (req, res) => res.send("LifeLink Backend running"));

// ----------- Auth & Admin routes ------------
app.post("/auth/register", async (req, res) => {
  const { username, password, role, adminCode } = req.body;
  if (!username || !password || !role) return res.status(400).json({ message: "missing fields" });
  const users = await loadUsers();
  if (users[username]) return res.status(409).json({ message: "User exists" });
  if (role === "admin" && adminCode !== ADMIN_REGISTER_CODE) return res.status(403).json({ message: "Invalid admin code" });
  const hash = await bcrypt.hash(password, 10);
  users[username] = { passwordHash: hash, role, createdAt: new Date().toISOString() };
  await saveUsers(users);
  return res.json({ message: "Registered" });
});

app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const users = await loadUsers();
  const u = users[username];
  if (!u) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = signToken({ username, role: u.role });
  res.json({ message: "ok", token, role: u.role });
});

// Admin portal
app.get("/admin/reliefs", authMiddleware, requireRole("admin", "govt"), async (req, res) => {
  const ledger = await fs.readJson(LEDGER_FILE);
  return res.json({ pending: ledger.supplies });
});

// ----------- Donations ------------
app.post("/donate", authMiddleware, requireRole("ngo", "admin"), async (req, res) => {
  try {
    const { donorName, amount, purpose } = req.body;
    const payload = { donorName, amount, purpose, createdBy: req.user.username, ts: Date.now() };
    const txId = generateTrackingId(payload);

    let onchain = null;
    if (contract) {
      const tx = await contract.recordDonation(donorName, ethers.BigNumber.from(String(amount)), purpose, txId);
      onchain = { txHash: tx.hash, txId };
    }

    const record = { id: txId, donorName, amount, purpose, createdBy: req.user.username, ts: new Date().toISOString(), onchain };
    await appendLedger("donations", record);

    const verifyUrl = `${req.protocol}://${req.get("host")}/verifyRecord/${txId}`;
    const qrDataUrl = await qrcode.toDataURL(verifyUrl);

    return res.json({ message: "donation recorded", record, verifyUrl, qrDataUrl });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
});

// ----------- Dispatch ------------
app.post("/dispatch", authMiddleware, requireRole("ngo", "admin"), async (req, res) => {
  try {
    const { item, quantity, from, to, lat, lng } = req.body;
    const payload = { item, quantity, from, to, lat, lng, createdBy: req.user.username };
    const trackingId = generateTrackingId(payload);

    let onchain = null;
    if (contract) {
      const tx = await contract.recordDispatch(item, quantity, from, to, trackingId);
      onchain = { txHash: tx.hash, trackingId };
    }

    const record = { trackingId, item, quantity, from, to, location: lat && lng ? { lat, lng } : null, createdBy: req.user.username, ts: new Date().toISOString(), onchain };
    await appendLedger("supplies", record);

    const verifyUrl = `${req.protocol}://${req.get("host")}/verifyRecord/${trackingId}`;
    const qrDataUrl = await qrcode.toDataURL(verifyUrl);

    return res.json({ message: "dispatch recorded", record, verifyUrl, qrDataUrl });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
});

// ----------- Maps ------------
app.get("/map/dispatches", async (req, res) => {
  const ledger = await fs.readJson(LEDGER_FILE);
  const features = (ledger.supplies || [])
    .filter(s => s.location && s.location.lat && s.location.lng)
    .map(s => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.location.lng, s.location.lat] },
      properties: { trackingId: s.trackingId, item: s.item, quantity: s.quantity }
    }));
  res.json({ type: "FeatureCollection", features });
});

// ----------- Verification ------------
app.get("/verifyRecord/:id", async (req, res) => {
  const id = req.params.id;
  const ledger = await fs.readJson(LEDGER_FILE);
  const donation = (ledger.donations || []).find(d => d.id === id);
  if (donation) return res.json({ type: "donation", data: donation });
  const supply = (ledger.supplies || []).find(s => s.trackingId === id);
  if (supply) return res.json({ type: "supply", data: supply });
  return res.status(404).json({ message: "not found" });
});

// ----------- Audit Trail ------------
app.get("/auditTrail", authMiddleware, requireRole("admin", "govt", "auditor"), async (req, res) => {
  const ledger = await fs.readJson(LEDGER_FILE);
  return res.json({ donations: ledger.donations, supplies: ledger.supplies });
});

// ----------- Start server ------------
app.listen(PORT, () => console.log(`LifeLink backend on http://localhost:${PORT}`));
