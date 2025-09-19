
import prisma from "../../../lib/prisma";  // ../../.. to reach lib
import { authenticate } from "../../../middleware/auth";


export default async function handler(req, res) {
  const user = authenticate(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      let notes;
      if (user.role === "ADMIN") {
        notes = await prisma.note.findMany({
          where: { tenantId: user.tenantId },
          include: { user: { select: { email: true } } },
        });
        notes = notes.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          userEmail: n.user.email,
        }));
      } else {
        notes = await prisma.note.findMany({
          where: { tenantId: user.tenantId, userId: user.id },
        });
      }
      res.json(notes);
    } else if (req.method === "POST") {
      const { title, content } = req.body;
      if (!title || !content) return res.status(400).json({ error: "Title and content required" });

      const newNote = await prisma.note.create({
        data: { title, content, tenantId: user.tenantId, userId: user.id },
      });
      res.status(201).json(newNote);
    } else if (req.method === "DELETE") {
      const { id } = req.query;
      const note = await prisma.note.findUnique({ where: { id: parseInt(id) } });
      if (!note) return res.status(404).json({ error: "Note not found" });
      if (user.role !== "ADMIN" && note.userId !== user.id)
        return res.status(403).json({ error: "Not authorized" });

      await prisma.note.delete({ where: { id: parseInt(id) } });
      res.status(200).json({ message: "Deleted" });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
