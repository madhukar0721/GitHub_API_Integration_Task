import express, { Request, Response, urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authMiddleware from "./middleware";
import { Octokit } from "@octokit/core";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

app.use(express.json());
app.use(cors());

// API to get users from GitHub
app.get("/github", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user) {
      //   res.json(req.user);
      const { name, login, followers, following, public_repos } = req.user;
      res.json({ username: login, name, followers, following, public_repos });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch GitHub data" });
  }
});

// GET /github/:repo → Fetch details about a specific repo
app.get(
  "/github/:repo",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { repo } = req.params;
      const { login } = req.user;

      const octokit = new Octokit({
        auth: GITHUB_TOKEN,
      });

      const repoData = await octokit.request(`GET /repos/{owner}/{repo}`, {
        owner: login,
        repo: repo,
        path: "",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      res.json(repoData.data);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
);

// GET /github/:repo/issues → Fetch issues for a specific repo
app.get(
  "/github/:repo/issues",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { repo } = req.params;
      const { login } = req.user;
      const octokit = new Octokit({
        auth: GITHUB_TOKEN,
      });
      const issues = await octokit.request("GET /repos/{owner}/{repo}/issues", {
        owner: login,
        repo: repo,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
    const mappedIssues = issues.data.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        state: issue.state,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        closed_at: issue.closed_at,
        body: issue.body,
        comments: issue.comments,
        html_url: issue.html_url,
    }));
    res.json(mappedIssues);

    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
);

// POST /github/:repo/issues → Create an issue in a repository
app.post(
  "/github/:repo/issues",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { repo } = req.params;
      const { login } = req.user;
      const { title, body, labels } = req.body;

      const octokit = new Octokit({
        auth: GITHUB_TOKEN,
      });

      const issue = await octokit.request("POST /repos/{owner}/{repo}/issues", {
        owner: login,
        repo: repo,
        title: title,
        body: body,
        labels: labels,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      res.json({
        url: issue.data.url,
        title: issue.data.title,
        state: issue.data.state,
        locked: issue.data.locked,
        labels: issue.data.labels,
        assignee: issue.data.assignee,
        created_at: issue.data.created_at,
        updated_at: issue.data.updated_at,
        closed_at: issue.data.closed_at,
        body: issue.data.body,
        comments: issue.data.comments,
        html_url: issue.data.html_url,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
