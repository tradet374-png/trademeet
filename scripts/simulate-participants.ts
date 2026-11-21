// scripts/simulate-participants.ts
import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';
const TARGET_SERVER_NUMBER = '1';
const SIMULATED_COUNT = 32;

console.log(`🚀 Starting TradeMeet Scalability Stress Test: Connecting ${SIMULATED_COUNT} traders to Server #${TARGET_SERVER_NUMBER}...`);

const sockets: Socket[] = [];
let connectedCount = 0;

const TRADER_NAMES = [
  'ApexTrader', 'QuantAlpha', 'CryptoWhale', 'GoldenEagle', 'PipHunter',
  'DeltaNeutral', 'MacroBull', 'SatoshiDisciple', 'OrderFlowMaster', 'FibonacciFan',
  'BreakoutBeast', 'TrendFollower', 'ScalpKing', 'VolumeProfile', 'LiquiditySeeker',
  'MomentumRider', 'CandleSeeker', 'ArbitrageX', 'GammaSqueeze', 'BullRunner',
  'ShortSqueezer', 'WhaleWatcher', 'ForexPro_UK', 'TokyoTrader', 'NY_OpenScalper',
  'SwingGuru', 'LevelTrader', 'HedgeFundAlum', 'ChartSniper', 'RiskManager99',
  'AlgoTrader_V2', 'AlphaSeeker_01'
];

const CHAT_SHOUTS = [
  'Welcome everyone to the live trading floor! 🔥',
  'Sharing my desktop terminal screen now! 🖥️',
  'Watching price action closely across multiple monitors.',
  'Order flow volume expanding rapidly! 📈',
  'Great trade execution everyone! 🚀',
  'Check out the screens shared on the multi-screen grid!',
  'Holding key support levels cleanly. 💎🙌',
  'Profit target hit on session open!',
];

for (let i = 0; i < SIMULATED_COUNT; i++) {
  const name = TRADER_NAMES[i] || `SimTrader_${i + 1}`;
  const socket = io(SERVER_URL, {
    transports: ['websocket'],
    reconnection: false,
  });

  socket.on('connect', () => {
    // Join Server 1
    socket.emit('room:join', {
      serverNumber: TARGET_SERVER_NUMBER,
      name,
    });
  });

  socket.on('room:joined', (data) => {
    connectedCount++;
    console.log(`[${connectedCount}/${SIMULATED_COUNT}] Connected: ${name} (ID: ${socket.id}) - Room Traders: ${data.participants.length}`);

    if (connectedCount === SIMULATED_COUNT) {
      console.log(`\n🎉 SUCCESS! All ${SIMULATED_COUNT} participants successfully connected to Server #${TARGET_SERVER_NUMBER}!`);
      console.log(`⚡ Testing real-time text chat, audio packets, and simultaneous multi-screen sharing...\n`);

      // 1. Simulate simultaneous multi-screen sharing: Multiple traders share screens at the same time!
      setTimeout(() => {
        console.log('🖥️ Testing Simultaneous Multi-Screen Sharing: Trader 1, Trader 2, and Trader 3 sharing screens at once...');
        sockets[0].emit('screen:start');
        sockets[1].emit('screen:start');
        sockets[2].emit('screen:start');
      }, 1000);

      // Listen for screen list updates
      sockets[0].on('screen:list-updated', ({ activeScreens }) => {
        console.log(`📺 Multi-Screen Broadcast received: ${activeScreens.length} simultaneous active screens in room:`, activeScreens.map((s: any) => s.presenterName).join(', '));
      });

      // 2. Simulate real-time text chat messages
      setInterval(() => {
        const randomSocket = sockets[Math.floor(Math.random() * sockets.length)];
        const randomMsg = CHAT_SHOUTS[Math.floor(Math.random() * CHAT_SHOUTS.length)];
        randomSocket.emit('chat:send', { content: randomMsg, type: 'text' });
      }, 2500);

      // 3. Simulate active speaking state changes
      setInterval(() => {
        const randomSocket = sockets[Math.floor(Math.random() * sockets.length)];
        const isSpeaking = Math.random() > 0.6;
        randomSocket.emit('media:state-update', {
          isSpeaking,
          audioLevel: isSpeaking ? Math.floor(Math.random() * 80 + 20) : 0,
        });
      }, 1500);
    }
  });

  socket.on('disconnect', () => {
    connectedCount = Math.max(0, connectedCount - 1);
  });

  sockets.push(socket);
}

// Timeout after 25s
setTimeout(() => {
  console.log(`\n🏁 Simulation test completed. Disconnecting all ${sockets.length} test clients...`);
  sockets.forEach((s) => s.disconnect());
  process.exit(0);
}, 25000);
