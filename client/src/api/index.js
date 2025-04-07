import axios from "axios";

const API_ENDPOINT = import.meta.env.VITE_APP_ENV === "development" ? import.meta.env.VITE_APP_DEV_HOST : import.meta.env.VITE_APP_HOST;

const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const client = axios.create({
  baseURL: API_ENDPOINT,
  headers: HEADERS,
});

export const startJob = async (req) => {
  try {
    const { url } = req;
    const response = await client.post(`/startJob`, { url });
    return { jobId: response.data.jobId };
  } catch (error) {
    if (error.response) {
      throw new Error(`Failed to start job: ${error.response.data}`);
    }
    throw new Error(`Failed to start job: ${error.message}`);
  }
};

export const getJobStatus = async (req) => {
  try {
    const { jobId } = req;
    const response = await client.get(`/jobStatus`, { params: { jobId } });
    return { status: response.data.status };
  } catch (error) {
    if (error.response) {
      throw new Error(`Failed to get job status: ${error.response.data}`);
    }
    throw new Error(`Failed to get job status: ${error.message}`);
  }
};

export const getReportData = async (req) => {
  try {
    const { jobId } = req;
    const response = await client.get(`/reportData`, { params: { jobId } });
    return response.data.report;
  } catch (error) {
    if (error.response) {
      throw new Error(`Failed to get report data: ${error.response.data}`);
    }
    throw new Error(`Failed to get report data: ${error.message}`);
  }
};
