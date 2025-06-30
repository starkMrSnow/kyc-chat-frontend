import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

@Injectable({ providedIn: 'root' })
export class ChatWebsocketService {
  private stompClient!: Client;

  connect(onMessageReceived: (message: IMessage) => void): void {
    const userId = localStorage.getItem('chat-username') || 'admin';
    const socket = new SockJS(`http://localhost:8010/ws?userId=${userId}`);

    this.stompClient = new Client({
      webSocketFactory: () => socket as WebSocket,
      debug: (str) => console.log('chat-websocket.ts:', str),
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.stompClient.subscribe('/user/queue/messages', onMessageReceived);
      },
      reconnectDelay: 5000,
    });

    this.stompClient.activate();
  }

  sendMessage(destination: string, body: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn('Not connected yet!');
    }
  }

  disconnect(): void {
    this.stompClient.deactivate();
  }
}