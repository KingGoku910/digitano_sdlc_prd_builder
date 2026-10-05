/**
 * Axios Client with Bearer Token Interceptor
 * Intercepts all outgoing HTTP requests and injects Authorization: Bearer <AccessToken>
 */

import axios, { AxiosError } from "axios";
import { getStoredToken } from "../config/aws-cognito";

export const API_BASE_URL = "";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request Interceptor: Inject Cognito AccessToken
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth expired gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized API call. Token may be expired or invalid.");
    }
    return Promise.reject(error);
  }
);

/**
 * Health check ping to full-stack server
 */
export async function pingBackendHealth(): Promise<{
  status: "online" | "starting" | "offline";
  latencyMs: number;
  data?: any;
}> {
  const startTime = Date.now();
  try {
    const response = await axios.get(`/api/health`, {
      timeout: 5000,
    });
    const latency = Date.now() - startTime;
    if (response.status === 200) {
      return {
        status: "online",
        latencyMs: latency,
        data: response.data,
      };
    }
    return { status: "offline", latencyMs: latency };
  } catch (err: any) {
    const latency = Date.now() - startTime;
    if (latency >= 3000 && err.code === "ECONNABORTED") {
      return { status: "starting", latencyMs: latency };
    }
    return { status: "offline", latencyMs: latency };
  }
}

/**
 * Fetches user's saved projects
 */
export async function fetchUserProjects() {
  const response = await apiClient.get("/api/projects");
  return response.data;
}

/**
 * Fetches single project detail by projectId
 */
export async function fetchProjectById(projectId: string) {
  const response = await apiClient.get(`/api/projects/${projectId}`);
  return response.data;
}

/**
 * Triggers pure sequential ADK + Bedrock / Gemini PRD generation pipeline
 */
export async function generatePRDViaADK(productName: string, rawBrief: string) {
  const response = await apiClient.post("/api/generate-prd", {
    product_name: productName,
    raw_brief: rawBrief,
  });
  return response.data;
}

