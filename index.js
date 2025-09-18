const express = require("express");
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("🚀 LifeLink-SIH server is running!");
});

// Example API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
