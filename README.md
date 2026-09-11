# CampusFind 🎒🔍

**CampusFind** is a modern, student-centric Lost and Found platform tailored for university campuses. It allows students, faculty, and staff to report lost possessions, log discovered items, chat directly through an integrated campus messaging center, and leverage automated smart matching to reunite items with their owners quickly and securely.

---

## ✨ Features

- **📊 Campus Dashboard**: Real-time metrics tracking lost items, discovered items, reunited possessions, and automated matching status.
- **🏷️ Category Filtering & Search**: Instant filtering across Electronics, ID Cards, Keys, Backpacks, Clothing, Books, Water Bottles, and more.
- **🤖 Automated AI Cross-Matching**: Algorithmic scoring that compares item titles, descriptions, categories, campus locations, and dates to automatically alert owners and finders of potential matches.
- **💬 Direct In-App Chat**: Private, campus-contained messaging between finders and owners with item context and unread badges.
- **🛡️ Secure Verification & Claim Workflow**: Safe return handoff system with claim questions, status updates, and security guidance.
- **📸 Flexible Cloud & Local Storage**: Support for Cloudinary, Supabase Storage, AWS S3, or high-performance local server CDN fallback for item photos.
- **📱 Fully Responsive**: Tailored layout with an ergonomic mobile bottom navigation dock and quick-action report picker.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Motion
- **Backend / API**: Node.js, Express, RESTful endpoints, Multer file handling
- **Build System**: Vite, TypeScript, tsx

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
# Clone repository
git clone https://github.com/rixon1658/campusfind.git
cd campusfind

# Install dependencies
npm install
```

### Environment Configuration (Optional)

Copy `.env.example` to `.env` if you wish to configure optional third-party cloud storage or Gemini AI keys:

```bash
cp .env.example .env
```

Supported optional integrations:
- Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_BUCKET`)
- AWS S3 (`AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)

*Note: CampusFind works out-of-the-box using the built-in local server CDN without requiring any third-party credentials.*

### Running Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── src/
│   ├── components/      # React components (Dashboard, ItemCard, Messages, Modals)
│   ├── context/         # Auth and session state context
│   ├── types.ts         # Shared TypeScript interfaces & models
│   ├── App.tsx          # Main application orchestrator
│   └── main.tsx         # React DOM entry point
├── server.ts            # Express server, REST API endpoints, auto-seeding
├── server/
│   └── cloudStorage.ts  # Multi-provider image storage engine
├── public/              # Static public assets
└── metadata.json        # Platform metadata
```

---

## 📜 License

MIT
