import { Router, Request, Response } from "express";
const router = Router();
let codes: any[] = [];

router.get("/", (req: Request, res: Response) => {
  res.json(codes);
});

export default router;
