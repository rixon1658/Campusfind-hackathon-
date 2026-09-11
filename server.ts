import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { getStorageStatus, uploadImageFile, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from "./server/cloudStorage";

interface Item {
  id: string;
  type: "lost" | "found";
  name: string;
  category: string;
  description: string;
  location: string;
  date: string;
  imageUrl: string;
  imageProvider?: string;
  imageFileName?: string;
  imageFileSize?: number;
  additionalInfo?: string;
  status: "active" | "returned";
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  studentId: string;
  department: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

interface Message {
  id: string;
  itemId: string;
  itemTitle: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  receiverName: string;
  receiverEmail: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface DatabaseSchema {
  users: User[];
  items: Item[];
  messages: Message[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "campusfind_db.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const initialUsers: User[] = [
  {
    id: "user-demo-1",
    name: "Alex Chen",
    email: "alex.chen@campus.edu",
    password: "password123",
    studentId: "STU-2024-8841",
    department: "Computer Science & Engineering",
    phone: "(555) 234-5678",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "user-demo-2",
    name: "Sarah Jenkins",
    email: "sarah.j@campus.edu",
    password: "password123",
    studentId: "STU-2023-4412",
    department: "Biological Sciences",
    phone: "(555) 876-5432",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-09-02T11:30:00.000Z",
  },
  {
    id: "user-demo-3",
    name: "Marcus Miller",
    email: "marcus.m@campus.edu",
    password: "password123",
    studentId: "STU-2025-1092",
    department: "Mechanical Engineering",
    phone: "(555) 345-6789",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-09-03T09:15:00.000Z",
  },
];

const initialItems: Item[] = [
  {
    id: "item-lost-1",
    type: "lost",
    name: "Apple AirPods Pro (2nd Gen)",
    category: "Electronics",
    description: "White AirPods Pro with bright orange silicone protective case. Has a small superficial scratch on the front lid near the LED indicator.",
    location: "Student Union Dining Hall (Near Subway booth)",
    date: "2026-09-08",
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
    additionalInfo: "Reward offered for safe return! Contains initials 'AC' on the inside lid.",
    status: "active",
    userId: "user-demo-1",
    userName: "Alex Chen",
    userEmail: "alex.chen@campus.edu",
    userPhone: "(555) 234-5678",
    department: "Computer Science & Engineering",
    createdAt: "2026-09-08T14:30:00.000Z",
    updatedAt: "2026-09-08T14:30:00.000Z",
  },
  {
    id: "item-found-1",
    type: "found",
    name: "AirPods Pro with Orange Silicone Case",
    category: "Electronics",
    description: "Found white Apple wireless earbuds inside a bright orange rubber case left on a booth table after lunch rush.",
    location: "Student Union 1st Floor Dining Lounge",
    date: "2026-09-08",
    imageUrl: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600&auto=format&fit=crop&q=80",
    additionalInfo: "Currently held at the Student Union Information Desk with staff.",
    status: "active",
    userId: "user-demo-3",
    userName: "Marcus Miller",
    userEmail: "marcus.m@campus.edu",
    userPhone: "(555) 345-6789",
    department: "Mechanical Engineering",
    createdAt: "2026-09-08T16:00:00.000Z",
    updatedAt: "2026-09-08T16:00:00.000Z",
  },
  {
    id: "item-lost-2",
    type: "lost",
    name: "TI-84 Plus CE Graphing Calculator",
    category: "Electronics",
    description: "Matte black TI-84 Plus CE calculator. Slide cover has a holographic NASA meatball sticker and a subtle scratch on back.",
    location: "Science & Engineering Hall Room 204",
    date: "2026-09-09",
    imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
    additionalInfo: "Needed urgently for Calculus III midterm exam this Friday.",
    status: "active",
    userId: "user-demo-2",
    userName: "Sarah Jenkins",
    userEmail: "sarah.j@campus.edu",
    userPhone: "(555) 876-5432",
    department: "Biological Sciences",
    createdAt: "2026-09-09T17:15:00.000Z",
    updatedAt: "2026-09-09T17:15:00.000Z",
  },
  {
    id: "item-found-2",
    type: "found",
    name: "Black TI-84 Graphing Calculator with Sticker",
    category: "Electronics",
    description: "Found on a wooden hallway study bench right outside room 206 after afternoon physics lecture. Has a space agency sticker.",
    location: "Science & Engineering Hall 2nd Floor Hallway",
    date: "2026-09-09",
    imageUrl: "https://images.unsplash.com/photo-1611117775350-ac3950990985?w=600&auto=format&fit=crop&q=80",
    additionalInfo: "I have it in my backpack, can meet anywhere on campus between classes.",
    status: "active",
    userId: "user-demo-1",
    userName: "Alex Chen",
    userEmail: "alex.chen@campus.edu",
    userPhone: "(555) 234-5678",
    department: "Computer Science & Engineering",
    createdAt: "2026-09-09T18:45:00.000Z",
    updatedAt: "2026-09-09T18:45:00.000Z",
  },
  {
    id: "item-lost-3",
    type: "lost",
    name: "Pacific Blue Hydro Flask (32 oz)",
    category: "Sports & Water Bottles",
    description: "Dark blue wide-mouth 32oz Hydro Flask with black flex boot. Decorated with University Outing Club sticker and National Parks sticker.",
    location: "Campus Recreation Center (Basketball Court 2)",
    date: "2026-09-07",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    additionalInfo: "Has small dent on bottom rim from hiking trip.",
    status: "active",
    userId: "user-demo-3",
    userName: "Marcus Miller",
    userEmail: "marcus.m@campus.edu",
    userPhone: "(555) 345-6789",
    department: "Mechanical Engineering",
    createdAt: "2026-09-07T19:00:00.000Z",
    updatedAt: "2026-09-07T19:00:00.000Z",
  },
  {
    id: "item-found-3",
    type: "found",
    name: "Blue Insulated Metal Water Bottle",
    category: "Sports & Water Bottles",
    description: "Blue 32oz vacuum flask with outdoor stickers found under bleachers after intramural evening basketball.",
    location: "Campus Rec Center Bleachers Court 2",
    date: "2026-09-07",
    imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80",
    additionalInfo: "Left with gym front equipment desk under Lost & Found bin.",
    status: "active",
    userId: "user-demo-2",
    userName: "Sarah Jenkins",
    userEmail: "sarah.j@campus.edu",
    userPhone: "(555) 876-5432",
    department: "Biological Sciences",
    createdAt: "2026-09-07T21:10:00.000Z",
    updatedAt: "2026-09-07T21:10:00.000Z",
  },
  {
    id: "item-lost-4",
    type: "lost",
    name: "Subaru Car Key with Navy Blue Campus Lanyard",
    category: "Keys",
    description: "Single Subaru black electronic key fob attached to a navy blue campus bookstore lanyard with a miniature silver carabiner.",
    location: "North Campus Parking Lot B (Row 4)",
    date: "2026-09-06",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    additionalInfo: "Fob has slight wear on the unlock button.",
    status: "returned",
    userId: "user-demo-1",
    userName: "Alex Chen",
    userEmail: "alex.chen@campus.edu",
    userPhone: "(555) 234-5678",
    department: "Computer Science & Engineering",
    createdAt: "2026-09-06T08:30:00.000Z",
    updatedAt: "2026-09-07T10:00:00.000Z",
  },
  {
    id: "item-found-4",
    type: "found",
    name: "Student ID Card - Emily Davis",
    category: "ID & Cards",
    description: "Official Campus ID card found on the 3rd floor quiet study carrel at the University Main Library.",
    location: "Main Library 3rd Floor East Wing",
    date: "2026-09-10",
    imageUrl: "https://images.unsplash.com/photo-1589330694653-dad6ef49ab6e?w=600&auto=format&fit=crop&q=80",
    additionalInfo: "Turned over to library 1st floor security circulation desk.",
    status: "active",
    userId: "user-demo-3",
    userName: "Marcus Miller",
    userEmail: "marcus.m@campus.edu",
    userPhone: "(555) 345-6789",
    department: "Mechanical Engineering",
    createdAt: "2026-09-10T14:00:00.000Z",
    updatedAt: "2026-09-10T14:00:00.000Z",
  },
];

const initialMessages: Message[] = [
  {
    id: "msg-1",
    itemId: "item-lost-1",
    itemTitle: "Apple AirPods Pro (2nd Gen)",
    senderId: "user-demo-3",
    senderName: "Marcus Miller",
    senderEmail: "marcus.m@campus.edu",
    receiverId: "user-demo-1",
    receiverName: "Alex Chen",
    receiverEmail: "alex.chen@campus.edu",
    content: "Hey Alex! I saw your post for the AirPods Pro. I found a pair matching this exact orange case at the Student Union dining area and dropped them off at the info desk! Hope this helps!",
    timestamp: "2026-09-08T16:15:00.000Z",
    read: true,
  },
  {
    id: "msg-2",
    itemId: "item-lost-1",
    itemTitle: "Apple AirPods Pro (2nd Gen)",
    senderId: "user-demo-1",
    senderName: "Alex Chen",
    senderEmail: "alex.chen@campus.edu",
    receiverId: "user-demo-3",
    receiverName: "Marcus Miller",
    receiverEmail: "marcus.m@campus.edu",
    content: "Oh wow Marcus, thank you so much! Heading to the desk right now to verify and pick them up. You saved my study week!",
    timestamp: "2026-09-08T16:22:00.000Z",
    read: true,
  },
];

// Helper to load database
function loadDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const db: DatabaseSchema = {
      users: initialUsers,
      items: initialItems,
      messages: initialMessages,
    };
    saveDb(db);
    return db;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || initialUsers,
      items: parsed.items || initialItems,
      messages: parsed.messages || initialMessages,
    };
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
    return {
      users: initialUsers,
      items: initialItems,
      messages: initialMessages,
    };
  }
}

// Helper to save database
function saveDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}

// Algorithmic Fallback Scorer (dice coefficient + weighted attributes)
function calculateLocalSimilarity(targetItem: Item, candidateItem: Item): { percentage: number; reason: string } {
  // Normalize strings
  const clean = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();

  const tName = clean(targetItem.name);
  const cName = clean(candidateItem.name);
  const tDesc = clean(targetItem.description);
  const cDesc = clean(candidateItem.description);
  const tLoc = clean(targetItem.location);
  const cLoc = clean(candidateItem.location);

  // 1. Name word overlap
  const tWords = new Set(tName.split(/\s+/).filter(w => w.length > 2));
  const cWords = new Set(cName.split(/\s+/).filter(w => w.length > 2));
  let nameMatches = 0;
  tWords.forEach(w => {
    if (cWords.has(w) || cName.includes(w)) nameMatches++;
  });
  const nameScore = tWords.size > 0 ? (nameMatches / Math.max(tWords.size, cWords.size || 1)) : 0;

  // 2. Category score
  const categoryScore = targetItem.category.toLowerCase() === candidateItem.category.toLowerCase() ? 1.0 : 0.0;

  // 3. Location overlap
  const locKeywords = ["union", "library", "hall", "gym", "rec", "quad", "dining", "engineering", "science", "lot", "parking", "room", "center", "lounge", "bleachers"];
  let locOverlap = 0;
  locKeywords.forEach(k => {
    if (tLoc.includes(k) && cLoc.includes(k)) locOverlap++;
  });
  const locScore = locOverlap > 0 ? 0.9 : (tLoc.includes(cLoc) || cLoc.includes(tLoc) ? 0.8 : 0.2);

  // 4. Description overlap
  const tDescWords = new Set(tDesc.split(/\s+/).filter(w => w.length > 3));
  const cDescWords = new Set(cDesc.split(/\s+/).filter(w => w.length > 3));
  let descOverlap = 0;
  tDescWords.forEach(w => {
    if (cDescWords.has(w)) descOverlap++;
  });
  const descScore = tDescWords.size > 0 ? Math.min(1.0, (descOverlap * 2) / Math.max(tDescWords.size, 1)) : 0.3;

  // 5. Date proximity
  const d1 = new Date(targetItem.date).getTime();
  const d2 = new Date(candidateItem.date).getTime();
  const diffDays = Math.abs(d1 - d2) / (1000 * 3600 * 24);
  const dateScore = diffDays <= 1 ? 1.0 : (diffDays <= 3 ? 0.8 : (diffDays <= 7 ? 0.5 : 0.2));

  // Weighted total score
  const totalRaw = (nameScore * 0.35) + (categoryScore * 0.20) + (locScore * 0.20) + (descScore * 0.15) + (dateScore * 0.10);
  const percentage = Math.min(98, Math.max(25, Math.round(totalRaw * 100)));

  // Generate natural language explanation
  const reasons: string[] = [];
  if (categoryScore === 1.0) reasons.push(`matching category (${targetItem.category})`);
  if (nameMatches > 0) reasons.push(`item title keywords match`);
  if (locOverlap > 0) reasons.push(`found in the same campus area (${candidateItem.location})`);
  if (diffDays <= 2) reasons.push(`reported within ${diffDays === 0 ? "the same day" : `${Math.round(diffDays)} days`}`);
  if (descOverlap > 0) reasons.push(`shared descriptive features`);

  const reason = reasons.length > 0
    ? `Strong correlation based on ${reasons.join(", ")}.`
    : `Both items are in the same general department area and timeframe.`;

  return { percentage, reason };
}

// Server-side Gemini AI matching with Gemini 3.8 Flash
async function getGeminiAIMatches(targetItem: Item, candidates: Item[]): Promise<Array<{ id: string; percentage: number; reason: string }>> {
  if (!process.env.GEMINI_API_KEY || candidates.length === 0) {
    return candidates.map(c => {
      const match = calculateLocalSimilarity(targetItem, c);
      return { id: c.id, percentage: match.percentage, reason: match.reason };
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const candidateSummaries = candidates.slice(0, 10).map((c, idx) => ({
      index: idx,
      id: c.id,
      name: c.name,
      category: c.category,
      description: c.description,
      location: c.location,
      date: c.date,
    }));

    const prompt = `You are the CampusFind Lost & Found AI Intelligence Engine.
Analyze this target ${targetItem.type.toUpperCase()} item against the list of candidate opposite items.

Target Item:
- Type: ${targetItem.type}
- Name: ${targetItem.name}
- Category: ${targetItem.category}
- Description: ${targetItem.description}
- Location: ${targetItem.location}
- Date: ${targetItem.date}
- Additional Info: ${targetItem.additionalInfo || "None"}

Candidate Items:
${JSON.stringify(candidateSummaries, null, 2)}

For each candidate item, evaluate the likelihood that this is the same physical object based on name, category, physical description details (color, stickers, scratches, case), location proximity on a college campus, and timeframe.
Assign an integer match percentage between 10 and 98, and write a concise 1-2 sentence explanation of why they match or differ.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              percentage: { type: Type.INTEGER },
              reason: { type: Type.STRING },
            },
            required: ["id", "percentage", "reason"],
          },
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text) as Array<{ id: string; percentage: number; reason: string }>;
      return parsed;
    }
  } catch (err) {
    console.error("Gemini AI matching error, falling back to local heuristic:", err);
  }

  // Fallback to local heuristic if Gemini failed or timed out
  return candidates.map(c => {
    const match = calculateLocalSimilarity(targetItem, c);
    return { id: c.id, percentage: match.percentage, reason: match.reason };
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Ensure uploads directory exists and mount static serving
  const UPLOADS_DIR = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Configure Multer for memory buffering
  const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
  });

  // ==========================================
  // CLOUD STORAGE & IMAGE UPLOAD ROUTES
  // ==========================================

  // Get active cloud storage provider status & limits
  app.get("/api/storage/status", (req, res) => {
    const status = getStorageStatus();
    res.json(status);
  });

  // Upload an image for lost or found items (supports multipart or base64 data URI)
  app.post(
    "/api/upload",
    (req, res, next) => {
      memoryUpload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              error: "File size exceeds 5MB limit. Please upload a smaller image.",
            });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
          return res.status(400).json({ error: err.message || "Failed to process uploaded file." });
        }
        next();
      });
    },
    async (req, res) => {
      try {
        let buffer: Buffer | null = null;
        let originalFileName = "item_image.jpg";
        let declaredMimeType: string | undefined = undefined;

        if (req.file) {
          buffer = req.file.buffer;
          originalFileName = req.file.originalname;
          declaredMimeType = req.file.mimetype;
        } else if (req.body && req.body.image) {
          const raw = req.body.image as string;
          const match = raw.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          if (match) {
            declaredMimeType = match[1];
            buffer = Buffer.from(match[2], "base64");
          } else {
            buffer = Buffer.from(raw, "base64");
          }
          if (req.body.fileName) {
            originalFileName = req.body.fileName;
          }
        }

        if (!buffer || buffer.length === 0) {
          return res.status(400).json({
            error: "No image file provided. Please choose or drop an image to upload.",
          });
        }

        const result = await uploadImageFile(buffer, originalFileName, declaredMimeType);

        return res.status(200).json({
          success: true,
          url: result.url,
          imageUrl: result.url,
          provider: result.provider,
          providerLabel: result.providerLabel,
          fileName: result.fileName,
          fileSize: result.fileSize,
          mimeType: result.mimeType,
          width: result.width,
          height: result.height,
        });
      } catch (err: any) {
        console.error("Image upload processing error:", err);
        return res.status(400).json({
          error: err.message || "Failed to validate or store image.",
        });
      }
    }
  );

  // ==========================================
  // AUTHENTICATION ROUTES (One common system, no admin)
  // ==========================================

  // Signup
  app.post("/api/auth/signup", (req, res) => {
    const { name, email, password, studentId, department, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    const db = loadDb();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password || "password123",
      studentId: studentId?.trim() || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      department: department?.trim() || "General Studies",
      phone: phone?.trim() || "",
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDb(db);

    const safeUser = { ...newUser };
    delete safeUser.password;
    res.status(201).json({ user: safeUser, token: `token-${newUser.id}` });
  });

  // Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const db = loadDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: "No student account found with this email. Please sign up." });
    }

    // Accept password check (or default password for demo ease)
    if (password && user.password && user.password !== password) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    const safeUser = { ...user };
    delete safeUser.password;
    res.json({ user: safeUser, token: `token-${user.id}` });
  });

  // Demo user quick login
  app.get("/api/auth/demo-users", (req, res) => {
    const db = loadDb();
    const safeUsers = db.users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    res.json({ users: safeUsers });
  });

  // Update Profile
  app.put("/api/auth/profile", (req, res) => {
    const { userId, name, studentId, department, phone, avatarUrl } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const db = loadDb();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    db.users[index] = {
      ...db.users[index],
      name: name !== undefined ? name.trim() : db.users[index].name,
      studentId: studentId !== undefined ? studentId.trim() : db.users[index].studentId,
      department: department !== undefined ? department.trim() : db.users[index].department,
      phone: phone !== undefined ? phone.trim() : db.users[index].phone,
      avatarUrl: avatarUrl || db.users[index].avatarUrl,
    };

    saveDb(db);
    const safeUser = { ...db.users[index] };
    delete safeUser.password;
    res.json({ user: safeUser });
  });

  // ==========================================
  // DASHBOARD STATS ROUTE
  // ==========================================
  app.get("/api/stats", (req, res) => {
    const db = loadDb();
    const totalLost = db.items.filter(i => i.type === "lost").length;
    const totalFound = db.items.filter(i => i.type === "found").length;
    const totalReturned = db.items.filter(i => i.status === "returned").length;
    const activeItems = db.items.filter(i => i.status === "active").length;

    // Recent items sorted by createdAt desc
    const recentItems = [...db.items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    res.json({
      totalLost,
      totalFound,
      totalReturned,
      activeItems,
      recentItems,
    });
  });

  // ==========================================
  // ITEMS CRUD ROUTES
  // ==========================================

  // Get Items with Filtering
  app.get("/api/items", (req, res) => {
    const { type, category, location, date, status, search, userId } = req.query;
    const db = loadDb();

    let results = [...db.items];

    // Filter by Type: 'lost' | 'found'
    if (type && typeof type === "string") {
      results = results.filter(i => i.type === type.toLowerCase());
    }

    // Filter by Category
    if (category && typeof category === "string" && category !== "All") {
      results = results.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Location
    if (location && typeof location === "string" && location.trim()) {
      const locTerm = location.toLowerCase().trim();
      results = results.filter(i => i.location.toLowerCase().includes(locTerm));
    }

    // Filter by Date
    if (date && typeof date === "string" && date.trim()) {
      results = results.filter(i => i.date === date.trim());
    }

    // Filter by Status: 'active' | 'returned' | 'all'
    if (status && typeof status === "string" && status !== "all") {
      results = results.filter(i => i.status === status);
    }

    // Filter by User ID (for My Posts)
    if (userId && typeof userId === "string") {
      results = results.filter(i => i.userId === userId);
    }

    // Filter by Search Query
    if (search && typeof search === "string" && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.additionalInfo && i.additionalInfo.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ items: results, count: results.length });
  });

  // Get Single Item by ID
  app.get("/api/items/:id", (req, res) => {
    const db = loadDb();
    const item = db.items.find(i => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }
    res.json({ item });
  });

  // Create New Item
  app.post("/api/items", (req, res) => {
    const {
      type,
      name,
      category,
      description,
      location,
      date,
      imageUrl,
      imageProvider,
      imageFileName,
      imageFileSize,
      additionalInfo,
      userId,
      userName,
      userEmail,
      userPhone,
      department,
    } = req.body;

    if (!type || !name || !category || !location || !date || !userId) {
      return res.status(400).json({ error: "Missing required fields for reporting an item." });
    }

    const defaultImageByType: Record<string, string> = {
      Electronics: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600&auto=format&fit=crop&q=80",
      "ID & Cards": "https://images.unsplash.com/photo-1589330694653-dad6ef49ab6e?w=600&auto=format&fit=crop&q=80",
      Keys: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
      "Bags & Backpacks": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      "Clothing & Accessories": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
      "Books & Stationery": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      "Sports & Water Bottles": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
      Other: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80",
    };

    const newItem: Item = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: type === "found" ? "found" : "lost",
      name: name.trim(),
      category: category.trim(),
      description: (description || "").trim(),
      location: location.trim(),
      date: date.trim(),
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : (defaultImageByType[category] || defaultImageByType.Other),
      imageProvider: imageProvider || undefined,
      imageFileName: imageFileName || undefined,
      imageFileSize: imageFileSize ? Number(imageFileSize) : undefined,
      additionalInfo: (additionalInfo || "").trim(),
      status: "active",
      userId,
      userName: userName || "Campus Student",
      userEmail: userEmail || "",
      userPhone: userPhone || "",
      department: department || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = loadDb();
    db.items.unshift(newItem);
    saveDb(db);

    res.status(201).json({ item: newItem });
  });

  // Edit Item (User can edit their own posts)
  app.put("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const {
      userId,
      name,
      category,
      description,
      location,
      date,
      imageUrl,
      imageProvider,
      imageFileName,
      imageFileSize,
      additionalInfo,
      status,
    } = req.body;

    const db = loadDb();
    const index = db.items.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Item not found." });
    }

    const currentItem = db.items[index];
    // Security check: only the user who created it can edit it
    if (currentItem.userId !== userId) {
      return res.status(403).json({ error: "You are only authorized to edit your own posts." });
    }

    const updatedItem: Item = {
      ...currentItem,
      name: name !== undefined ? name.trim() : currentItem.name,
      category: category !== undefined ? category.trim() : currentItem.category,
      description: description !== undefined ? description.trim() : currentItem.description,
      location: location !== undefined ? location.trim() : currentItem.location,
      date: date !== undefined ? date.trim() : currentItem.date,
      imageUrl: imageUrl !== undefined ? imageUrl.trim() : currentItem.imageUrl,
      imageProvider: imageProvider !== undefined ? imageProvider : currentItem.imageProvider,
      imageFileName: imageFileName !== undefined ? imageFileName : currentItem.imageFileName,
      imageFileSize: imageFileSize !== undefined ? Number(imageFileSize) : currentItem.imageFileSize,
      additionalInfo: additionalInfo !== undefined ? additionalInfo.trim() : currentItem.additionalInfo,
      status: status !== undefined ? status : currentItem.status,
      updatedAt: new Date().toISOString(),
    };

    db.items[index] = updatedItem;
    saveDb(db);

    res.json({ item: updatedItem });
  });

  // Delete Item (User can delete their own posts)
  app.delete("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;

    const db = loadDb();
    const item = db.items.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    // Security check
    if (item.userId !== userId) {
      return res.status(403).json({ error: "You are only authorized to delete your own posts." });
    }

    db.items = db.items.filter(i => i.id !== id);
    saveDb(db);

    res.json({ message: "Post deleted successfully.", id });
  });

  // Mark Item as Returned
  app.patch("/api/items/:id/return", (req, res) => {
    const { id } = req.params;
    const { userId, status } = req.body;

    const db = loadDb();
    const item = db.items.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    // Allow user who posted or someone marking it returned
    item.status = status === "active" ? "active" : "returned";
    item.updatedAt = new Date().toISOString();
    saveDb(db);

    res.json({ item, message: `Item marked as ${item.status}.` });
  });

  // ==========================================
  // AI-POWERED MATCHING ROUTE
  // ==========================================
  app.get("/api/items/:id/matches", async (req, res) => {
    const { id } = req.params;
    const db = loadDb();
    const targetItem = db.items.find(i => i.id === id);
    if (!targetItem) {
      return res.status(404).json({ error: "Item not found." });
    }

    // Opposite pool: if target is 'lost', query active 'found' items, and vice-versa
    const oppositeType = targetItem.type === "lost" ? "found" : "lost";
    const candidates = db.items.filter(i => i.type === oppositeType && i.id !== targetItem.id);

    if (candidates.length === 0) {
      return res.json({ matches: [], totalEvaluated: 0 });
    }

    try {
      const matchEvaluations = await getGeminiAIMatches(targetItem, candidates);

      // Merge evaluation with candidate items and filter matches with >= 40% confidence
      const results = matchEvaluations
        .map(evalResult => {
          const matchedItem = candidates.find(c => c.id === evalResult.id);
          if (!matchedItem) return null;
          return {
            matchedItem,
            similarityPercentage: Math.min(98, Math.max(20, evalResult.percentage)),
            matchReason: evalResult.reason,
            confidence: evalResult.percentage >= 80 ? "high" : (evalResult.percentage >= 60 ? "medium" : "moderate"),
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.similarityPercentage - a.similarityPercentage);

      res.json({
        targetItem,
        matches: results,
        totalEvaluated: candidates.length,
      });
    } catch (err) {
      console.error("Match endpoint error:", err);
      // Fallback
      const fallbackResults = candidates.map(c => {
        const { percentage, reason } = calculateLocalSimilarity(targetItem, c);
        return {
          matchedItem: c,
          similarityPercentage: percentage,
          matchReason: reason,
          confidence: percentage >= 80 ? "high" : (percentage >= 60 ? "medium" : "moderate"),
        };
      }).sort((a, b) => b.similarityPercentage - a.similarityPercentage);

      res.json({
        targetItem,
        matches: fallbackResults,
        totalEvaluated: candidates.length,
      });
    }
  });

  // ==========================================
  // MESSAGING ROUTES (Contact system)
  // ==========================================

  // Get user's messages/threads
  app.get("/api/messages", (req, res) => {
    const { userId, itemId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required to view messages." });
    }

    const db = loadDb();
    let userMessages = db.messages.filter(
      m => m.senderId === userId || m.receiverId === userId
    );

    if (itemId && typeof itemId === "string") {
      userMessages = userMessages.filter(m => m.itemId === itemId);
    }

    userMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Also build a list of unique conversations/threads
    const conversationsMap = new Map<string, {
      conversationId: string;
      itemId: string;
      itemTitle: string;
      otherUserId: string;
      otherUserName: string;
      otherUserEmail: string;
      lastMessage: Message;
      unreadCount: number;
    }>();

    userMessages.forEach(msg => {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const otherName = msg.senderId === userId ? msg.receiverName : msg.senderName;
      const otherEmail = msg.senderId === userId ? msg.receiverEmail : msg.senderEmail;
      const convKey = `${msg.itemId}_${[userId, otherId].sort().join("_")}`;

      const existing = conversationsMap.get(convKey);
      const isUnread = !msg.read && msg.receiverId === userId;

      if (!existing || new Date(msg.timestamp) > new Date(existing.lastMessage.timestamp)) {
        conversationsMap.set(convKey, {
          conversationId: convKey,
          itemId: msg.itemId,
          itemTitle: msg.itemTitle,
          otherUserId: otherId,
          otherUserName: otherName,
          otherUserEmail: otherEmail,
          lastMessage: msg,
          unreadCount: (existing?.unreadCount || 0) + (isUnread ? 1 : 0),
        });
      } else if (isUnread && existing) {
        existing.unreadCount += 1;
      }
    });

    res.json({
      messages: userMessages,
      conversations: Array.from(conversationsMap.values()).sort(
        (a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
      ),
    });
  });

  // Send a message
  app.post("/api/messages", (req, res) => {
    const { itemId, itemTitle, senderId, senderName, senderEmail, receiverId, receiverName, receiverEmail, content } = req.body;

    if (!itemId || !senderId || !receiverId || !content || !content.trim()) {
      return res.status(400).json({ error: "Missing required message fields." });
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemId,
      itemTitle: itemTitle || "Campus Item",
      senderId,
      senderName: senderName || "Campus Student",
      senderEmail: senderEmail || "",
      receiverId,
      receiverName: receiverName || "Campus Student",
      receiverEmail: receiverEmail || "",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    const db = loadDb();
    db.messages.push(newMessage);
    saveDb(db);

    res.status(201).json({ message: newMessage });
  });

  // Mark messages in conversation as read
  app.patch("/api/messages/mark-read", (req, res) => {
    const { userId, otherUserId, itemId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    const db = loadDb();
    let updated = 0;
    db.messages.forEach(m => {
      if (
        m.receiverId === userId &&
        (!otherUserId || m.senderId === otherUserId) &&
        (!itemId || m.itemId === itemId) &&
        !m.read
      ) {
        m.read = true;
        updated++;
      }
    });

    if (updated > 0) {
      saveDb(db);
    }

    res.json({ success: true, count: updated });
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CampusFind Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
