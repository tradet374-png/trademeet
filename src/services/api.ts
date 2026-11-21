// src/services/api.ts
import { RoomInfo } from '../types';

// In development or local fullstack, defaults to relative path.
// When deployed on Surge, points to the live backend server URL (e.g. on Render, Railway, or VPS).
const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export async function fetchActiveRooms(): Promise<RoomInfo[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/rooms`);
    if (!res.ok) return [];
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return [];
    const data = await res.json();
    return data.rooms || [];
  } catch (err) {
    return [];
  }
}

export async function checkServerStatus(serverId: string): Promise<{ exists: boolean; isActive: boolean; participantCount: number; activeScreensCount?: number; roomName?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/rooms/${encodeURIComponent(serverId)}`);
    if (!res.ok) return { exists: false, isActive: false, participantCount: 0 };
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { exists: false, isActive: false, participantCount: 0 };
    }
    return await res.json();
  } catch (err) {
    return { exists: false, isActive: false, participantCount: 0 };
  }
}

export async function searchGifs(query: string = '', category: string = ''): Promise<any[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/gifs?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error('Failed to search GIFs');
    const data = await res.json();
    return data.gifs || [];
  } catch (err) {
    console.error('Error searching GIFs:', err);
    return [];
  }
}

export async function getLiveKitToken(roomName: string, participantId: string, participantName: string): Promise<{ token: string; url: string; isConfigured: boolean }> {
  try {
    const res = await fetch(`${BASE_URL}/api/livekit/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, participantId, participantName }),
    });
    if (!res.ok) throw new Error('Failed to fetch LiveKit token');
    return await res.json();
  } catch (err) {
    console.error('LiveKit token request error:', err);
    return { token: '', url: '', isConfigured: false };
  }
}
