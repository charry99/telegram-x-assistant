import { Request, Response } from "express";
import { prisma } from "../config/db";
import { publishTweet } from "../services/x.service";

export async function publishApprovedDraft(req: Request, res: Response) {
  const { draftId } = req.params;

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      user: { include: { xAccount: true } }
    }
  });

  if (!draft) {
    return res.status(404).json({ error: "Draft not found" });
  }

  if (draft.status !== "APPROVED") {
    return res.status(400).json({ error: "Draft must be approved first" });
  }

  if (!draft.user.xAccount?.accessTokenEnc) {
    return res.status(400).json({ error: "X account not connected" });
  }

  const result = await publishTweet(
    draft.user.xAccount.accessTokenEnc,
    draft.content
  );

  const post = await prisma.post.create({
    data: {
      userId: draft.userId,
      draftId: draft.id,
      xPostId: result.data.id,
      content: draft.content,
      publishedAt: new Date()
    }
  });

  await prisma.draft.update({
    where: { id: draft.id },
    data: { status: "POSTED" }
  });

  res.json(post);
}