import dotenv from "dotenv";
import process from "node:process";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config({ path: new URL("./.env", import.meta.url) });

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || process.env.MONOGODB_URL;
const classifierUrl = process.env.CLASSIFIER_URL || "http://127.0.0.1:8001/classify";
const roles = ["citizen", "admin", "worker", "officer"];
const imageCategories = [
  "Road / Pothole",
  "Garbage",
  "Electrical Hazard",
  "Streetlight",
  "Water Supply",
  "Drainage",
  "Fallen Tree",
  "Public Infrastructure",
];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: roles, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.json({ limit: "12mb" }));

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

app.post("/api/classify-image", async (req, res) => {
  const imageData = String(req.body?.image || "");
  const match = imageData.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) return res.status(400).json({ message: "A JPG, PNG, or WebP image is required." });

  try {
    const response = await fetch(classifierUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData }),
    });
    const result = await response.json();
    if (!response.ok) return res.status(response.status === 400 ? 400 : 502).json({ message: result?.message || "The local image classifier failed." });
    const predictions = Array.isArray(result?.predictions)
      ? result.predictions.filter((item) => imageCategories.includes(item.label))
      : [];
    if (!predictions.length) return res.status(502).json({ message: "The local classifier returned no civic issue categories." });
    res.json({ predictions });
  } catch (error) {
    const message = error.message?.includes("fetch failed")
      ? "The local image classifier is not running. Start it with: python classifier.py"
      : error.message || "The local image classifier could not process this image.";
    console.error("Image classification failed:", error.message);
    res.status(502).json({ message });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!String(name || "").trim() || !email || !password || password.length < 6) return res.status(400).json({ message: "Name, email, and a password of at least 6 characters are required." });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name: name.trim(), email, password: await bcrypt.hash(password, 12), role: "citizen" });
    res.status(201).json({ user: publicUser(user) });
  } catch {
    res.status(500).json({ message: "Could not create the account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({ email: normalizeEmail(req.body.email) });
    if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ message: "Invalid ID or password." });
    res.json({ user: publicUser(user) });
  } catch {
    res.status(500).json({ message: "Could not sign you in." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

async function start() {
  if (!mongoUri) throw new Error("MONGODB_URI is missing from server/.env");
  await mongoose.connect(mongoUri);
  const initialUsers = [
    ["Administrator", "admin@123.gmail", "admin@123", "admin"],
    ["Field Worker", "worker@123.gmail", "worker@123", "worker"],
    ["City Officer", "officer@123.gmail", "officer@123", "officer"],
  ];
  for (const [name, email, password, role] of initialUsers) {
    if (!(await User.exists({ email }))) await User.create({ name, email, password: await bcrypt.hash(password, 12), role });
  }
  app.listen(port, () => console.log(`CityEye API listening on http://localhost:${port}`));
}

start().catch((error) => { console.error("Unable to start CityEye API:", error.message); process.exit(1); });