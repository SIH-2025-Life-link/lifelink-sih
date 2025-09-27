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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// ------------ Config (from .env) ------------
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const ADMIN_REGISTER_CODE = process.env.ADMIN_REGISTER_CODE || "admin_secret";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const PROVIDER_URL = process.env.PROVIDER_URL || "";
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const LEDGER_FILE = path.join(__dirname, "ledger.json");

// Ensure ledger file exists
if (!fs.existsSync(LEDGER_FILE)) {
  const initialLedger = {
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: "1.0"
    },
    donations: [],
    supplies: [],
    feedback: [],
    statistics: {
      totalDonations: 0,
      totalSupplies: 0,
      lastDonationDate: null,
      lastSupplyDate: null
    }
  };
  fs.writeJsonSync(LEDGER_FILE, initialLedger, { spaces: 2 });
}

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
  try {
    provider = new ethers.JsonRpcProvider(PROVIDER_URL);
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
  } catch (err) {
    console.error("Error initializing ethers:", err);
    contract = null;
  }
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
  const dataString = JSON.stringify(payload) + rnd + Date.now();
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return "0x" + hash;
}

function generateId(prefix) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}_${year}${month}${day}${random}`;
}

async function appendLedger(type, record) {
  const ledger = await fs.readJson(LEDGER_FILE);
  const now = new Date().toISOString();
  
  // Update metadata
  ledger.metadata.lastUpdated = now;
  
  if (type === 'donations') {
    ledger.statistics.totalDonations += (record.details?.amount || 0);
    ledger.statistics.lastDonationDate = now;
  } else if (type === 'supplies') {
    ledger.statistics.totalSupplies += 1;
    ledger.statistics.lastSupplyDate = now;
  }
  
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

// Audit Trail Route
app.get("/audit-trail", async (req, res) => {
  try {
    const ledger = await fs.readJson(LEDGER_FILE);
    res.json({
      donations: ledger.donations,
      supplies: ledger.supplies,
      statistics: ledger.statistics
    });
  } catch (error) {
    console.error("Error fetching audit trail:", error);
    res.status(500).json({ message: "Error fetching audit trail data" });
  }
});

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
    const { donorName, amount, purpose, paymentMethod = "direct" } = req.body;
    const txId = generateTrackingId({ donorName, amount, purpose });
    const now = new Date().toISOString();

    let blockchain = null;
    if (contract) {
      const tx = await contract.recordDonation(donorName, amount, purpose, txId);
      blockchain = {
        txHash: tx.hash,
        txId: txId,
        network: "mumbai",
        status: "confirmed"
      };
    }

    const record = {
      id: generateId("DON"),
      type: "monetary",
      details: {
        donorName,
        amount,
        currency: "INR",
        purpose,
        paymentMethod
      },
      tracking: {
        status: blockchain ? "completed" : "pending",
        createdBy: req.user.username,
        createdAt: now,
        verificationId: txId
      },
      blockchain
    };
    
    await appendLedger("donations", record);

    const verifyUrl = `${req.protocol}://${req.get("host")}/verifyRecord/${txId}`;
    const qrDataUrl = await qrcode.toDataURL(verifyUrl);

    return res.json({ message: "donation recorded", record, verifyUrl, qrDataUrl });
  } catch (err) {
    console.error('Donation error:', err);
    return res.status(500).json({ message: "server error", error: err.message });
  }
});

// ----------- Dispatch ------------
app.post("/dispatch", authMiddleware, requireRole("ngo", "admin"), async (req, res) => {
  try {
    const { item, quantity, from, to, lat, lng, category = "essential", unit = "packages" } = req.body;
    const trackingId = generateTrackingId({ item, quantity, from, to });
    const now = new Date().toISOString();

    let blockchain = null;
    if (contract) {
      const tx = await contract.recordDispatch(item, quantity, from, to, trackingId);
      blockchain = {
        txHash: tx.hash,
        trackingId,
        network: "mumbai",
        status: "confirmed"
      };
    }

    const record = {
      id: generateId("SUP"),
      type: category.toLowerCase(),
      details: {
        item,
        quantity,
        unit,
        category
      },
      logistics: {
        from: {
          name: from,
          type: "warehouse"
        },
        to: {
          name: to,
          type: "relief_center"
        },
        location: lat && lng ? {
          lat,
          lng,
          locationName: to
        } : null
      },
      tracking: {
        status: "in_transit",
        trackingId,
        createdBy: req.user.username,
        createdAt: now
      },
      blockchain
    };
    
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

// ----------- Public Statistics (no auth required) ------------
app.get("/public/stats", async (req, res) => {
  try {
    const ledger = await fs.readJson(LEDGER_FILE);
    res.json({
      statistics: ledger.statistics,
      donations: ledger.donations,
      supplies: ledger.supplies
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
});

// ----------- Audit Trail ------------
app.get("/auditTrail", authMiddleware, requireRole("admin", "govt", "auditor"), async (req, res) => {
  const ledger = await fs.readJson(LEDGER_FILE);
  return res.json({ donations: ledger.donations, supplies: ledger.supplies });
});

// ----------- Feedback ------------
// Simple feedback storage in ledger
app.post("/feedback", async (req, res) => {
  try {
    const { name, email, subject, message, type = "general" } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    const ledger = await fs.readJson(LEDGER_FILE);
    const feedbackId = generateId("FB");

    const feedbackRecord = {
      id: feedbackId,
      type: "feedback",
      details: {
        name,
        email,
        subject,
        message,
        type
      },
      tracking: {
        status: "received",
        createdAt: new Date().toISOString()
      }
    };

    ledger.feedback = ledger.feedback || [];
    ledger.feedback.push(feedbackRecord);

    await fs.writeJson(LEDGER_FILE, ledger, { spaces: 2 });

    return res.json({ message: "Feedback submitted successfully", id: feedbackId });
  } catch (err) {
    console.error('Feedback error:', err);
    return res.status(500).json({ message: "Error submitting feedback" });
  }
});

// ----------- Static file serving for frontend -----------
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ----------- API routes -----------
app.get("/api", (req, res) => {
  res.json({
    message: "LifeLink API is running!",
    endpoints: {
      donations: "/api/donations",
      supplies: "/api/supplies",
      users: "/api/users",
      audit: "/api/auditTrail (requires auth)",
      "public-stats": "/api/public/stats (no auth)",
      feedback: "/api/feedback",
      verify: "/verifyRecord/:id"
    }
  });
});

// ----------- Start server ------------
app.listen(PORT, () => console.log(`LifeLink backend on http://localhost:${PORT}`));
