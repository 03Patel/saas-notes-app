import { PrismaClient } from "@prisma/client";
import { authenticate } from '../../../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const user = authenticate(req, res);
  if (!user) return;

  if (user.role !== "ADMIN") {
    return res.status(403).json({ error: "Only admins can upgrade tenants" });
  }

  const { slug } = req.query;

  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const updatedTenant = await prisma.tenant.update({
      where: { slug },
      data: { plan: "PRO" },
    });

    return res.json({
      message: `Tenant ${updatedTenant.name} upgraded to PRO`,
      tenant: updatedTenant,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
