const async = require('async');
const { query, getClient } = require('./db');
const { runJob } = require('./runJob');

const CONCURRENCY = 5; // ! Max number of concurrent jobs that can run at once; MUST be equal to SE_NODE_MAX_SESSIONS of selenium browser nodes.
const MAX_CLAIM = 3; // ! Max number of total jobs to have in the queue at any time (separate from those being processed)

(async () => {
  const client = await getClient();

  const queue = async.queue(
    (jobParameters, callback) => {
      runJob(jobParameters)
      .then(results => {
        callback(null, results)
      })
      .catch(error => callback(error));
    },
    CONCURRENCY
  );

  async function postReport(jobId, result) {
    const { id: reportId } = (await query(`INSERT INTO reports (job_id, report_data) VALUES ($1, $2) RETURNING id;`, [jobId, result])).rows[0];
    // For some reason doing client.query here doesn't work:
    await query(`UPDATE jobs SET status = 'completed', report_id = $1 WHERE id = $2;`, [reportId, jobId]);
    console.log('report posted');
  }

  async function postJobError(jobId) {
    await query(`UPDATE jobs SET status = 'error' WHERE id = $1;`, [jobId]);
  }

  async function enqueueNewJobs() {

    function enqueueJob(jobId, jobParameters) {
      queue.push(
        jobParameters,
        (err, result) => {
          if (err) {
            console.error(err);
            postJobError(jobId);
            return;
          }
          console.log(`Finished processing job ${jobId}`);
          postReport(jobId, result);
        }
      );
    }

    if (queue.length >= MAX_CLAIM) {
      console.log('Queue is full; Not checking for jobs');
      return;
    }

    const count = (CONCURRENCY + MAX_CLAIM) - (queue.running() + queue.length()); // Fill remainder of queue

    console.log('Checking for jobs to claim...');
    try {
      await client.query('BEGIN');

      const jobQuery = `
        SELECT *
        FROM jobs
        WHERE status = 'queued'
        ORDER BY queued_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT $1;
      `;

      const { rows } = await client.query(jobQuery, [count]);

      if (rows.length > 0) {

        for (const job of rows) {
          const updateQuery = `
            UPDATE jobs
            SET status = 'crawling'
            WHERE id = $1;
          `;
          await client.query(updateQuery, [job.id]);

          // Commit the transaction if everything is successful
          await client.query('COMMIT');

          enqueueJob(job.id, job.parameters);

          console.log('Claimed job:', job.id);
        }

      } else {
        await client.query('ROLLBACK');
        console.log('No jobs available to claim');
        return null;
      }

    } catch (err) {
      // If there's any error, rollback the transaction
      await client.query('ROLLBACK');
      console.error('Error claiming job: ', err);
    }
  }

  // Assign a callback to listen when all tasks are processed
  queue.unsaturated(function() {
    console.log('Room in the processing queue is available.');
    enqueueNewJobs();
  });

  // This is only important when the queue is completely empty, and we don't want to continuously poll the db:
  async function listenForJobs() {

    client.on('notification', async (msg) => {
      if (msg.name === 'notification' && msg.channel === 'job_queue') {
        console.log('New notification:', msg.payload, "\nAttempting to claim jobs...");
        await enqueueNewJobs(); // Enqueues any new jobs (if space is available)
      }
    });

    await client.query('LISTEN job_queue');
  }

  listenForJobs().catch(console.error);

  process.on('SIGINT', () => {
    client.end();
    console.log('Disconnected from PostgreSQL.');
    process.exit();
  });
})();