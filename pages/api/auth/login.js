import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import NextCors from 'nextjs-cors';

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";



export default async function handler(req, res) {
const allowedOrigins = [
  "https://saas-notes-g33lbeju1-03patels-projects.vercel.app",
  "https://saas-notes.vercel.app", // production domain
];

const origin = req.headers.origin;

await NextCors(req, res, {
  origin: allowedOrigins.includes(origin) ? origin : false,
  methods: ["GET", "POST", "OPTIONS"],
  optionsSuccessStatus: 200,
});

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
