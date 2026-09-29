<<<<<<< HEAD
export type CallEventName =
  | 'ready'
  | 'call:incoming'
  | 'call:ringing'
  | 'call:accepted'
  | 'call:rejected'
  | 'call:ended'
  | 'call:signal'
  | 'call:error';

export interface CallEvent {
  event: CallEventName;
  callId?: string;
  peerCallId?: string;
  role?: 'caller' | 'callee';
  reason?: string;
  error?: string;
  signal?: RTCSessionDescriptionInit | RTCIceCandidateInit | { type: 'ice'; candidate: RTCIceCandidateInit };
}

type CallListener = (event: CallEvent) => void;

class CallService {
  private socket: WebSocket | null = null;
  private connection: Promise<void> | null = null;
  private listeners = new Map<CallEventName, Set<CallListener>>();

  public connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) return Promise.resolve();
    if (this.connection) return this.connection;

    const connection = new Promise<void>((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
      this.socket = socket;

      socket.onopen = () => resolve();
      socket.onerror = () => reject(new Error('Unable to connect to the call signaling server.'));
      socket.onclose = () => {
        this.socket = null;
        this.connection = null;
        this.dispatch({ event: 'call:error', error: 'Call signaling disconnected.' });
      };
      socket.onmessage = (message) => {
        try {
          this.dispatch(JSON.parse(message.data) as CallEvent);
        } catch {
          this.dispatch({ event: 'call:error', error: 'Received an invalid signaling message.' });
        }
      };
    });
    this.connection = connection.catch((error: unknown) => {
      this.connection = null;
      throw error;
    });

    return this.connection;
  }

  public on(eventName: CallEventName, listener: CallListener): () => void {
    const eventListeners = this.listeners.get(eventName) || new Set<CallListener>();
    eventListeners.add(listener);
    this.listeners.set(eventName, eventListeners);
    return () => eventListeners.delete(listener);
  }

  public async startCall(targetCallId: string): Promise<void> {
    await this.send({ event: 'call:start', targetCallId });
  }

  public async acceptCall(callId: string): Promise<void> {
    await this.send({ event: 'call:accept', callId });
  }

  public async rejectCall(callId: string): Promise<void> {
    await this.send({ event: 'call:reject', callId });
  }

  public async endCall(callId: string): Promise<void> {
    await this.send({ event: 'call:end', callId });
  }

  public async sendSignal(callId: string, signal: RTCSessionDescriptionInit | RTCIceCandidateInit | { type: 'ice'; candidate: RTCIceCandidateInit }): Promise<void> {
    await this.send({ event: 'call:signal', callId, signal });
  }

  private async send(message: Record<string, unknown>): Promise<void> {
    await this.connect();
    if (this.socket?.readyState !== WebSocket.OPEN) throw new Error('Call signaling is not connected.');
    this.socket.send(JSON.stringify(message));
  }

  private dispatch(event: CallEvent): void {
    this.listeners.get(event.event)?.forEach((listener) => listener(event));
  }
}

=======
export type CallEventName =
  | 'ready'
  | 'call:incoming'
  | 'call:ringing'
  | 'call:accepted'
  | 'call:rejected'
  | 'call:ended'
  | 'call:signal'
  | 'call:error';

export interface CallEvent {
  event: CallEventName;
  callId?: string;
  peerCallId?: string;
  role?: 'caller' | 'callee';
  reason?: string;
  error?: string;
  signal?: RTCSessionDescriptionInit | RTCIceCandidateInit | { type: 'ice'; candidate: RTCIceCandidateInit };
}

type CallListener = (event: CallEvent) => void;

class CallService {
  private socket: WebSocket | null = null;
  private connection: Promise<void> | null = null;
  private listeners = new Map<CallEventName, Set<CallListener>>();

  public connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) return Promise.resolve();
    if (this.connection) return this.connection;

    const connection = new Promise<void>((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
      this.socket = socket;

      socket.onopen = () => resolve();
      socket.onerror = () => reject(new Error('Unable to connect to the call signaling server.'));
      socket.onclose = () => {
        this.socket = null;
        this.connection = null;
        this.dispatch({ event: 'call:error', error: 'Call signaling disconnected.' });
      };
      socket.onmessage = (message) => {
        try {
          this.dispatch(JSON.parse(message.data) as CallEvent);
        } catch {
          this.dispatch({ event: 'call:error', error: 'Received an invalid signaling message.' });
        }
      };
    });
    this.connection = connection.catch((error: unknown) => {
      this.connection = null;
      throw error;
    });

    return this.connection;
  }

  public on(eventName: CallEventName, listener: CallListener): () => void {
    const eventListeners = this.listeners.get(eventName) || new Set<CallListener>();
    eventListeners.add(listener);
    this.listeners.set(eventName, eventListeners);
    return () => eventListeners.delete(listener);
  }

  public async startCall(targetCallId: string): Promise<void> {
    await this.send({ event: 'call:start', targetCallId });
  }

  public async acceptCall(callId: string): Promise<void> {
    await this.send({ event: 'call:accept', callId });
  }

  public async rejectCall(callId: string): Promise<void> {
    await this.send({ event: 'call:reject', callId });
  }

  public async endCall(callId: string): Promise<void> {
    await this.send({ event: 'call:end', callId });
  }

  public async sendSignal(callId: string, signal: RTCSessionDescriptionInit | RTCIceCandidateInit | { type: 'ice'; candidate: RTCIceCandidateInit }): Promise<void> {
    await this.send({ event: 'call:signal', callId, signal });
  }

  private async send(message: Record<string, unknown>): Promise<void> {
    await this.connect();
    if (this.socket?.readyState !== WebSocket.OPEN) throw new Error('Call signaling is not connected.');
    this.socket.send(JSON.stringify(message));
  }

  private dispatch(event: CallEvent): void {
    this.listeners.get(event.event)?.forEach((listener) => listener(event));
  }
}

>>>>>>> 187d472 (Add original Amaterasu app)
export const callService = new CallService();