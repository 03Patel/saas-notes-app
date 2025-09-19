import { authenticate } from "../../../middleware/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const user = authenticate(req, res);
  if (!user) return;

  const { id } = req.query;

  try {
    if (req.method === "GET") {
      // Get a single note
      const note = await prisma.note.findUnique({
        where: { id: parseInt(id) },
      });

      if (!note || note.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Note not found" });
      }

      // Members can only see their notes
      if (user.role !== "ADMIN" && note.userId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      return res.json(note);
    }

    if (req.method === "PUT") {
      const { title, content } = req.body;

      const note = await prisma.note.findUnique({
        where: { id: parseInt(id) },
      });

      if (!note || note.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Note not found" });
      }

      // Only Admins or Note Owner can update
      if (user.role !== "ADMIN" && note.userId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updated = await prisma.note.update({
        where: { id: parseInt(id) },
        data: { title, content },
      });

      return res.json(updated);
    }

    if (req.method === "DELETE") {
      const note = await prisma.note.findUnique({
        where: { id: parseInt(id) },
      });

      if (!note || note.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Note not found" });
      }

      // Only Admins or Note Owner can delete
      if (user.role !== "ADMIN" && note.userId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await prisma.note.delete({
        where: { id: parseInt(id) },
      });

      return res.json({ message: "Note deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Error in /api/notes/[id]:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
