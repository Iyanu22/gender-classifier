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

    // Handle Genderize API errors (rate limit, etc.)
    if (apiData.error) {
      return res.status(502).json({
        status: "error",
        message: apiData.error,
      });
    }

    if (apiData.gender === null || apiData.count === 0) {
      return res.status(200).json({
        status: "error",
        message: "No prediction available for the provided name",
      });
    }

    const gender = apiData.gender;
    const probability = apiData.probability;
    const sample_size = apiData.count;
    const is_confident = probability >= 0.7 && sample_size >= 100;
    const processed_at = new Date().toISOString();

    return res.status(200).json({
      status: "success",
      data: {
        name,
        gender,
        probability,
        sample_size,
        is_confident,
        processed_at,
      },
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});