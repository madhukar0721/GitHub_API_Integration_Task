import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { Octokit } from "@octokit/core";
dotenv.config();

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const USER_GITHUB_TOKEN = req.header("Authorization")?.replace("Bearer ", "");
  let DEFAULT_GITHUB_TOKEN = "";
// I have also added functionality to use the User GITHUB_TOKEN
  if (!USER_GITHUB_TOKEN) {
    try {
      DEFAULT_GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
      const octokit = new Octokit({
        auth: DEFAULT_GITHUB_TOKEN,
      });
      const user = await octokit.request("GET /user", {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      if(user.status === 200) {
        req.user = user.data;
        next();
      }
    } catch (error) {
      console.error("Error", error);
    }
  }
  else{
    try {
      const octokit = new Octokit({
        auth: USER_GITHUB_TOKEN,
      });
      const user = await octokit.request("GET /user", {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      if(user.status === 200) {
        req.user = user.data;
        next();
      }
    } catch (error) {
      console.error("Error", error);
    }
  }
};

export default authMiddleware;
