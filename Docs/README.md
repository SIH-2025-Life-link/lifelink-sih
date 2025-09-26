# LifeLink - SIH 2025

**LifeLink** — Transparent Disaster Relief Tracking using Blockchain Technology.

## 📋 Overview

LifeLink is a comprehensive blockchain-based solution for tracking disaster relief distribution. It ensures transparency, prevents duplication, and helps NGOs & governments deliver aid faster and more efficiently.

## ✨ Features

- 🔗 **Blockchain Integration**: Immutable transaction records using Ethereum smart contracts
- 📊 **Real-time Tracking**: Live monitoring of relief supplies and donations
- 🔐 **Secure Authentication**: JWT-based authentication with role-based access control
- 🗺️ **Geographic Tracking**: Interactive maps for supply chain visualization
- 📱 **Multi-language Support**: Interface available in multiple languages
- 📋 **Audit Trail**: Complete tamper-proof history of all transactions
- 🎯 **QR Verification**: Quick verification system for relief packages

## 🏗️ Project Structure

```
lifelink-sih/
├── backend/                 # Node.js/Express backend server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Data models and schemas
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Main server file
│   └── package.json         # Backend dependencies
├── frontend/                # Vanilla HTML/CSS/JS frontend
│   ├── pages/               # HTML pages
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   └── assets/              # Static assets (images, icons)
├── docs/                    # Documentation files
├── scripts/                 # Utility scripts
├── package.json             # Main project configuration
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MayankSharma-2812/lifelink-sih.git
   cd lifelink-sih
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   PORT=3000
   JWT_SECRET=your-secret-key
   ETHEREUM_RPC_URL=your-ethereum-rpc-url
   PRIVATE_KEY=your-private-key
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

5. **Serve the frontend:**
   Open `frontend/index.html` in your browser or use a local server:
   ```bash
   # Using Python (if available)
   cd frontend && python -m http.server 8000

   # Using Node.js
   npx serve frontend
   ```

## 🔧 Development

### Backend Development
- Main server: `backend/src/server.js`
- API routes: `backend/src/routes/`
- Controllers: `backend/src/controllers/`
- Models: `backend/src/models/`

### Frontend Development
- Main page: `frontend/pages/index.html`
- Styles: `frontend/css/`
- Scripts: `frontend/js/`
- Assets: `frontend/assets/`

## 📚 API Documentation

### Core Endpoints

- `GET /` - Health check
- `POST /api/auth/login` - User authentication
- `POST /api/relief/add` - Add new relief request
- `GET /api/relief/track/:id` - Track relief package
- `GET /api/audit` - Get audit trail
- `POST /api/verify` - Verify transaction

## 🔒 Security Features

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Encryption**: bcrypt for password hashing
- **Rate Limiting**: API request rate limiting
- **CORS**: Cross-origin resource sharing protection
- **Helmet**: Security headers

## 🌐 Multi-language Support

The application supports multiple languages with easy translation management:
- English (default)
- Hindi
- Other languages can be added to the translation files

## 📊 Blockchain Integration

- **Smart Contracts**: Ethereum-based contracts for immutable records
- **Transaction Tracking**: Every relief operation recorded on blockchain
- **Verification**: QR codes for easy verification of authenticity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Team

- **Mayank Sharma** - Project Lead & Full Stack Developer

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

**LifeLink** - Making disaster relief transparent, efficient, and accountable. 🌍
