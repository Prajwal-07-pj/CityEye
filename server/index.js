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
const roles = ["citizen", "admin", "worker", "officer"];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: roles, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.json());

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: "Name, email, and a password of at least 6 characters are required." });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: "citizen" });
    res.status(201).json({ user: publicUser(user) });
  } catch {
    res.status(500).json({ message: "Could not create the account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase() });
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