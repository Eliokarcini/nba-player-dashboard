import express from "express";
import fetchNBA from "../utils/fetchAPI.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: "Missing name" });

  try {
    const data = await fetchNBA(`/players?search=${encodeURIComponent(name)}`);
    res.json(data);  // ✅ Must send JSON response
  } catch (err) {
    console.error("Error fetching player:", err);
    res.status(500).json({ error: "API request failed" });
  }
});

export default router;
