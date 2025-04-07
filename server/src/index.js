const express = require("express");
const { query } = require('./db');

const PORT = 3000;

const app = express();
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.get("/api/getDate", (req, res) => {
  res.json({
    timestamp: Date.now()
  });
});

function validateAndInferURL(domain) {
  const domainPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(\/[a-zA-Z0-9-._~:\/?#[\]@!$&'()*+,;=]*)?$/;

  if (domainPattern.test(domain)) {
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      return 'https://' + domain;
    }
    return domain;
  } else {
    return false;
  }
}


app.post("/api/startJob", async (req, res) => {
  const { url } = req.body;

  const validUrl = validateAndInferURL(url);
  // It is possible to construct a feedback loop to fill the queue maliciously (The user-flow feature planned lets GPT control the browser)
  if (!validUrl || url.includes("uxsleuth.com")) {
    res.status(400).send("Invalid URL");
    return;
  }

  const jobParameters = {
    url: validUrl
  };

  const { id: jobId } = (await query(`INSERT INTO jobs (parameters) VALUES ($1) RETURNING id;`, [jobParameters])).rows[0];

  res.json({
    jobId
  });
});

app.get("/api/jobStatus", async (req, res) => {
  try {
    const { jobId } = req.query;

    const { status } = (await query(`SELECT status FROM jobs WHERE id = $1;`, [jobId])).rows[0];

    if (status === 'error') {
      res.status(400).send("Processing error. Please try again later.");
      return;
    }

    res.json({
      status
    });
  } catch (err) {
    res.status(400).send("Bad request");
  }
});

app.get("/api/reportData", async (req, res) => {
  try {
    const { jobId } = req.query;

    const { report_data: report } = (await query(`SELECT report_data FROM reports WHERE job_id = $1;`, [jobId])).rows[0];

    res.json({
      report
    });
  } catch (err) {
    console.log(`ERROR on /api/reportData: ${err}`);
    res.status(400).send("Bad request");
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
