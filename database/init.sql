CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE job_status AS ENUM ('queued', 'crawling', 'completed', 'error');

CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    status job_status DEFAULT 'queued',
    parameters JSONB, -- contains url property; will eventually include user-flow prompts, so JSONB is future proof
    report_id INT,
    queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    job_id UUID UNIQUE,
    report_data JSONB,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Add foreign key constraint afterwards to avoid "relation not found" error
ALTER TABLE jobs
ADD CONSTRAINT fk_jobs_report_id
FOREIGN KEY (report_id) REFERENCES reports(id);

CREATE FUNCTION notify_new_job() RETURNS trigger AS $$
BEGIN
  NOTIFY job_queue, 'new_job';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_job_trigger
AFTER INSERT ON jobs
FOR EACH STATEMENT EXECUTE FUNCTION notify_new_job();