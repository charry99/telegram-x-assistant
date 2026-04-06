import { Request, Response } from "express";
import { prisma } from "../config/db";

export async function getDrafts(_req: Request, res: Response) {
  const drafts = await prisma.draft.findMany({
    orderBy: { createdAt: "desc" }
  });

  res.json(drafts);
}

export async function createDraft(req: Request, res: Response) {
  const { userId, content, source } = req.body;

  const draft = await prisma.draft.create({
    data: {
      userId,
      content,
      source
    }
  });

  res.status(201).json(draft);
}

export async function approveDraft(req: Request, res: Response) {
  const { id } = req.params;

  const draft = await prisma.draft.update({
    where: { id },
    data: { status: "APPROVED" }
  });

  res.json(draft);
}

export async function rejectDraft(req: Request, res: Response) {
  const { id } = req.params;

  const draft = await prisma.draft.update({
    where: { id },
    data: { status: "REJECTED" }
  });

  res.json(draft);
}