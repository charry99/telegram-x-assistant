import { Request, Response } from "express";
import { prisma } from "../config/db";

export async function getOverview(_req: Request, res: Response) {
  const posts = await prisma.post.findMany({
    include: {
      metrics: {
        orderBy: { capturedAt: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(posts);
}