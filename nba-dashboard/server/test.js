// server/test.js
import 'dotenv/config'; // loads .env automatically
import fetch from 'node-fetch'; // required for Node < 18; optional in Node 18+

const API_KEY = process.env.API_KEY;

async function test() {
  try {
    const res = await fetch(
      'https://v1.basketball.api-sports.io/players?search=lebron',
      {
        headers: { 'x-apisports-key': API_KEY }
      }
    );
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
