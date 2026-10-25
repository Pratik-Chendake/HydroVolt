type Listener = (data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Set<Listener> = new Set();
  private isConnecting = false;
  private reconnectTimer: any = null;
  private pingTimer: any = null;
  private fallbackTimer: any = null;
  public isConnected = false;

  constructor() {
    this.connect();
  }

  public subscribe(cb: Listener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private connect() {
    if (this.isConnecting || this.isConnected) return;
    this.isConnecting = true;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.isConnecting = false;
        this.stopFallbackPolling();

        // Start ping heartbeat
        this.pingTimer = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send('ping');
          }
        }, 15000);
      };

      this.ws.onmessage = (event) => {
        try {
          if (event.data === 'pong') return;
          const data = JSON.parse(event.data);
          this.listeners.forEach((cb) => cb(data));
        } catch {}
      };

      this.ws.onclose = () => {
        this.cleanup();
        this.startFallbackPolling();
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.cleanup();
        this.startFallbackPolling();
        this.scheduleReconnect();
      };
    } catch {
      this.cleanup();
      this.startFallbackPolling();
      this.scheduleReconnect();
    }
  }

  private cleanup() {
    this.isConnected = false;
    this.isConnecting = false;
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    this.ws = null;
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }

  // Fallback: poll live endpoint every 2 seconds when WebSocket is down
  private startFallbackPolling() {
    if (this.fallbackTimer) return;
    this.fallbackTimer = setInterval(async () => {
      try {
        const res = await fetch('/api/v1/water/live');
        if (res.ok) {
          const live = await res.json();
          const fallbackData = {
            type: 'TELEMETRY_UPDATE',
            timestamp: live.last_reading_time || new Date().toISOString(),
            flow_rate_lpm: live.flow_rate_lpm,
            pulses: live.pulses,
            total_liters: live.total_liters,
            sequence_id: 0,
            sensor_id: 'FALLBACK_POLL',
            sensor_status: live.sensor_status,
            is_simulated: live.is_simulated,
          };
          this.listeners.forEach((cb) => cb(fallbackData));
        }
      } catch {}
    }, 2000);
  }

  private stopFallbackPolling() {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }
}

export const wsClient = new WebSocketClient();
