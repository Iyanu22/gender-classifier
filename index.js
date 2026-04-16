const express = require("express");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/api/classify", async (req, res) => {
  const { name } = req.query;

  if (name === undefined || name === "") {
    return res.status(400).json({
      status: "error",
      message: "Missing or empty name parameter",
    });
  }

  if (typeof name !== "string") {
    return res.status(422).json({
      status: "error",
      message: "Name must be a string",
    });
  }

  try {
    const apiData = await new Promise((resolve, reject) => {
      https.get(
        `https://api.genderize.io/?name=${encodeURIComponent(name)}`,
        (apiRes) => {
          let raw = "";
          apiRes.on("data", (chunk) => (raw += chunk));
          apiRes.on("end", () => {
            try {
              resolve(JSON.parse(raw));
            } catch {
              reject(new Error("Invalid JSON from Genderize"));
            }
          });
        }
      ).on("error", reject);
    });

    // TEMPORARY: return raw apiData so we can see exactly what Genderize sends
    return res.status(200).json({ debug: apiData });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});