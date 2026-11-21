// server/livekit.ts
import { AccessToken } from 'livekit-server-sdk';

export interface LiveKitTokenResponse {
  token: string;
  url: string;
  isConfigured: boolean;
}

export async function generateLiveKitToken(
  roomName: string,
  participantId: string,
  participantName: string
): Promise<LiveKitTokenResponse> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL || 'wss://demo.livekit.cloud';

  // Check if real keys are provided
  const isConfigured = Boolean(
    apiKey &&
    apiSecret &&
    apiKey !== 'devkey' &&
    apiSecret.length >= 10
  );

  try {
    // Generate valid LiveKit JWT AccessToken
    const at = new AccessToken(apiKey || 'devkey', apiSecret || 'devsecret_trademeet_live_room_webrtc_sfu_2024', {
      identity: participantId,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: `trademeet-${roomName}`,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    return {
      token,
      url: livekitUrl,
      isConfigured,
    };
  } catch (err) {
    console.warn('LiveKit token generation note:', err);
    return {
      token: '',
      url: livekitUrl,
      isConfigured: false,
    };
  }
}
