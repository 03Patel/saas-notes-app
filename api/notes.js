import prisma from "../prisma/client.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const notes = await prisma.note.findMany();
    res.status(200).json(notes);
  } 
  else if (req.method === "POST") {
    const { title, content, userId } = req.body;
    const note = await prisma.note.create({
      data: { title, content, userId },
    });
    res.status(201).json(note);
  } 
  else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
