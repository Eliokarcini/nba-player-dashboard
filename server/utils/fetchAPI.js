import fetch from "node-fetch";

const API_URL = "https://v1.basketball.api-sports.io";

export default async function fetchNBA(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "x-apisports-key": process.env.API_KEY
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API fetch error:", error);
    return null;
  }
}
