import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';


interface Message {
  id: string;
  userId: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-customer-chat.component',
  standalone: true,
  imports: [
     CommonModule,
    FormsModule,
    HttpClientModule,
    DatePipe
  ],
  templateUrl: './customer-chat.component.html',
  styleUrl: './customer-chat.component.scss'

  
})
export class CustomerChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChildren('messageBubble') messageBubbles!: QueryList<ElementRef>;

  // In a real app, this userId would come from your authentication service
  // For demonstration, we'll use a static ID or generate one.
  currentUserId: string = 'customer123'; // Example customer ID

  messages: Message[] = [];
  newMessageText: string = '';

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) { }
  

  ngOnInit(): void {
    this.loadMessages(); // Load messages for the current user
    // Placeholder for WebSocket connection for real-time updates
    // this.connectWebSocket();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const chatArea = document.querySelector('.message-list');
      if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  trackByMessageId(index: number, message: any): string {
  return message.id;
}
  /**
   * Loads simulated messages for the current user.
   * In a real application, this would fetch data from your backend.
   */
  loadMessages(): void {
    // In a production app, you would fetch messages for the current user:
    // this.http.get<Message[]>(`/api/customer/messages/${this.currentUserId}`).pipe(takeUntil(this.destroy$)).subscribe(
    //   (data) => { this.messages = data; this.scrollToBottom(); },
    //   (error) => { console.error('Error loading customer messages:', error); }
    // );

    // Simulate messages for demonstration
    this.messages = [
      { id: 'c_msg1', userId: this.currentUserId, sender: 'user', text: 'Hi, I need help with my recent purchase, order #456.', timestamp: new Date(Date.now() - 10 * 60 * 1000) },
      { id: 'c_msg2', userId: this.currentUserId, sender: 'admin', text: 'Hello! I see your inquiry. What seems to be the issue with order #456?', timestamp: new Date(Date.now() - 9 * 60 * 1000) },
      { id: 'c_msg3', userId: this.currentUserId, sender: 'user', text: 'The item arrived damaged.', timestamp: new Date(Date.now() - 8 * 60 * 1000) },
      { id: 'c_msg4', userId: this.currentUserId, sender: 'admin', text: 'I apologize for that. Can you please send us a photo of the damaged item?', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
    ];
  }

  /**
   * Handles sending a message from the customer, either by hitting Enter or clicking the Send button.
   * @param event Optional keyboard event.
   */
  sendMessage(event?: Event): void {
     if (event instanceof KeyboardEvent && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!this.newMessageText.trim()) {
        return;
      }
      this.sendActualMessage();
    } else if (!event) { // For button click
      if (!this.newMessageText.trim()) {
        return;
      }
      this.sendActualMessage();
    }
  }

  /**
   * Adds the new message to the local messages array and simulates sending it to the backend.
   */
  private sendActualMessage(): void {
    if (this.newMessageText.trim()) {
      const message: Message = {
        id: `c_msg${Date.now()}`,
        userId: this.currentUserId,
        sender: 'user', // This message is sent by the current user
        text: this.newMessageText.trim(),
        timestamp: new Date()
      };
      this.messages.push(message);

      // In a real application, send this message to your backend via WebSocket or HTTP POST
      // Example for HTTP POST:
      // this.http.post('/api/customer/send-message', message).pipe(takeUntil(this.destroy$)).subscribe(
      //   (response) => { console.log('Customer message sent:', response); },
      //   (error) => { console.error('Error sending customer message:', error); }
      // );
      console.log('Customer sending message:', message);

      this.newMessageText = '';
      this.scrollToBottom();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Placeholder for WebSocket connection for real-time updates from admin
  // connectWebSocket(): void {
  //   // Use your WebSocket service to listen for incoming messages for this user
  //   // this.webSocketService.onMessageForUser(this.currentUserId).pipe(takeUntil(this.destroy$)).subscribe(
  //   //   (incomingMessage: Message) => {
  //   //     if (incomingMessage.userId === this.currentUserId) {
  //   //       this.messages.push(incomingMessage);
  //   //       this.scrollToBottom();
  //   //     }
  //   //   }
  //   // );
  // }
}
