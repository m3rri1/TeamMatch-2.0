import { API_BASE_URL } from "../config/env";

export function getAuthToken() {
  try {
    return localStorage.getItem("teammatch_token");
  } catch {
    return null;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`
    );
  }

  return data;
}

export async function saveProfileToBackend(profileToSave) {
  const token = getAuthToken();

  if (!token) {
    console.warn("No authentication token. Profile saved locally.");
    return profileToSave;
  }

  return apiRequest("/api/profiles", {
    method: "POST",
    body: JSON.stringify(profileToSave),
  });
}
