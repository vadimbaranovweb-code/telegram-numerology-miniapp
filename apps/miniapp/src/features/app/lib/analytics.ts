"use client";

type AnalyticsEventProperties = Record<string, string | number | boolean | null>;

type AnalyticsEvent = {
  name: string;
  properties: AnalyticsEventProperties;
  timestamp: string;
};

const STORAGE_KEY = "numerology-miniapp-analytics-events-v1";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

let sessionId: string | null = null;

function getSessionId() {
  if (!sessionId) {
    sessionId = `session_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  }

  return sessionId;
}

export function trackEvent(
  name: string,
  properties: AnalyticsEventProperties = {},
): AnalyticsEvent {
  const event: AnalyticsEvent = {
    name,
    properties: {
      session_id: getSessionId(),
      platform: "telegram_mini_app",
      app_version: "miniapp_mvp_v1",
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const events = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
    events.push(event);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-100)));
  } catch {
    // Ignore analytics storage failures in this temporary client-side layer.
  }

  console.info("[analytics]", event.name, event.properties);
  void sendEventToBackend(event);

  return event;
}

async function sendEventToBackend(event: AnalyticsEvent) {
  try {
    await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        events: [
          {
            event_name: event.name,
            timestamp: event.timestamp,
            properties: event.properties,
          },
        ],
      }),
      keepalive: true,
    });
  } catch {
    // Keep local storage as fallback if backend ingestion is unavailable.
  }
}
