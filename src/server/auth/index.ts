import { getServerSession } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { authConfig } from "./config";

export const auth = (req: NextApiRequest, res: NextApiResponse) => {
  return getServerSession(req, res, authConfig);
};
