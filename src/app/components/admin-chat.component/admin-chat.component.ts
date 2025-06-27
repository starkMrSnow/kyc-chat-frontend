import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule and DatePipe
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClient and HttpClientModule
import { Subject, takeUntil } from 'rxjs'; // Import Subject and takeUntil from rxjs

// Define interfaces for better type safety
interface User {
  id: string;
  name: string;
  unreadCount: number;
  lastMessageTime?: Date; // Optional, useful for sorting
}

interface Message {
  id: string;
  userId: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-admin-chat', // Corrected selector
  standalone: true,
  imports: [
    CommonModule, // Required for Angular directives like *ngFor, *ngIf, [class]
    FormsModule,    // Required for [(ngModel)]
    HttpClientModule, // Required for HttpClient
    DatePipe        // Required for the date pipe in the template
  ],
  templateUrl: './admin-chat.component.html',
  styleUrl: './admin-chat.component.scss'
})
export class AdminChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  // @ViewChildren allows access to child elements in the template marked with a template reference variable ('#messageBubble')
  @ViewChildren('messageBubble') messageBubbles!: QueryList<ElementRef>;

  // Array to hold the list of users with whom the admin can chat
  users: User[] = [];
  // Holds the currently selected user, or null if no user is selected
  selectedUser: User | null = null;
  // Array to hold messages for the currently selected user
  messages: Message[] = [];
  // Holds the text being typed in the message input area
  newMessageText: string = '';

  // Subject used to manage subscriptions and ensure they are unsubscribed when the component is destroyed
  private destroy$ = new Subject<void>();

  // Inject HttpClient to simulate backend calls for loading users and messages
  constructor(private http: HttpClient) { }

  /**
   * Angular lifecycle hook, called once after the component's view is initialized.
   * Loads the initial list of users.
   */
  ngOnInit(): void {
    this.loadUsers();
    // Placeholder for WebSocket connection setup. This will be implemented when backend is ready.
    // this.connectWebSocket();
  }

  /**
   * Angular lifecycle hook, called after every check of the component's view.
   * Used here to ensure the chat area scrolls to the bottom after new messages are added or loaded.
   */
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  /**
   * Scrolls the message list area to the very bottom, making sure the latest messages are visible.
   */
  private scrollToBottom(): void {
    try {
      const chatArea = document.querySelector('.message-list');
      if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight; // Set scroll position to the maximum scroll height
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  /**
   * Loads a list of simulated users. In a real application, this would fetch data from a backend API.
   */
  loadUsers(): void {
    // Simulate fetching users from a backend.
    // In a production app, you would use:
    // this.http.get<User[]>('/api/admin/users-with-chats').pipe(takeUntil(this.destroy$)).subscribe(
    //   (data) => { this.users = data; },
    //   (error) => { console.error('Error loading users:', error); }
    // );
    this.users = [
      { id: 'user1', name: 'Alice Smith', unreadCount: 2, lastMessageTime: new Date(Date.now() - 5 * 60 * 1000) }, // 5 mins ago
      { id: 'user2', name: 'Bob Johnson', unreadCount: 0, lastMessageTime: new Date(Date.now() - 60 * 1000) },     // 1 min ago
      { id: 'user3', name: 'Charlie Brown', unreadCount: 5, lastMessageTime: new Date(Date.now() - 120 * 1000) },  // 2 mins ago
      { id: 'user4', name: 'Diana Prince', unreadCount: 0, lastMessageTime: new Date(Date.now() - 300 * 1000) },   // 5 mins ago
    ].sort((a, b) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0)); // Sort by most recent activity
  }

  /**
   * Selects a user from the sidebar and loads their chat messages.
   * @param user The user object that was clicked.
   */
  selectUser(user: User): void {
    // If the same user is already selected, do nothing
    if (this.selectedUser?.id === user.id) {
      return;
    }
    this.selectedUser = user; // Set the newly selected user
    this.messages = []; // Clear messages from the previously selected user
    this.loadMessages(user.id); // Load messages for the new user
    this.markMessagesAsRead(user.id); // Mark messages for this user as read
  }

  /**
   * Loads simulated messages for a given user. In a real application, this would fetch data from a backend API.
   * @param userId The ID of the user whose messages are to be loaded.
   */
  loadMessages(userId: string): void {
    // Simulate fetching messages for the selected user from a backend.
    // In a production app, you would use:
    // this.http.get<Message[]>(`/api/admin/messages/${userId}`).pipe(takeUntil(this.destroy$)).subscribe(
    //   (data) => { this.messages = data; this.scrollToBottom(); },
    //   (error) => { console.error(`Error loading messages for ${userId}:`, error); }
    // );

    // Mock messages based on user ID for demonstration
    if (userId === 'user1') {
      this.messages = [
        { id: 'msg1', userId: 'user1', sender: 'user', text: 'Hi, I have a question about my order #123.', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
        { id: 'msg2', userId: 'user1', sender: 'admin', text: 'Hello Alice! How can I help you with order #123?', timestamp: new Date(Date.now() - 4 * 60 * 1000) },
        { id: 'msg3', userId: 'user1', sender: 'user', text: 'It hasn\'t shipped yet and I need it by Friday.', timestamp: new Date(Date.now() - 3 * 60 * 1000) },
        { id: 'msg4', userId: 'user1', sender: 'user', text: 'Can you check the status?', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
      ];
    } else if (userId === 'user3') {
      this.messages = [
        { id: 'msg5', userId: 'user3', sender: 'user', text: 'My account is locked, please help!', timestamp: new Date(Date.now() - 10 * 60 * 1000) },
        { id: 'msg6', userId: 'user3', sender: 'admin', text: 'Sure, I can help with that. Can you verify your email?', timestamp: new Date(Date.now() - 9 * 60 * 1000) },
      ];
    } else {
      this.messages = []; // No messages for other users in this simulation
    }
  }

  trackByMessageId(index: number, message: Message): string {
  return message.id;
}
  /**
   * Handles sending a message, either by hitting Enter in the textarea or clicking the Send button.
   * Prevents sending empty messages.
   * @param event Optional keyboard event for handling Enter key press.
   */
sendMessage(event?: Event): void {
  // Narrow the event to a KeyboardEvent safely
  if (event instanceof KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!this.newMessageText.trim()) return;
      this.sendActualMessage();
    }
  } else if (!event) {
    // Handles click from "Send" button
    if (!this.newMessageText.trim()) return;
    this.sendActualMessage();
  }
}

  /**
   * Adds the new message to the local messages array and simulates sending it to the backend.
   */
  private sendActualMessage(): void {
    if (this.selectedUser && this.newMessageText.trim()) {
      const message: Message = {
        id: `msg${Date.now()}`, // Generate a unique ID (for demonstration purposes)
        userId: this.selectedUser.id,
        sender: 'admin', // Message is sent by the admin
        text: this.newMessageText.trim(),
        timestamp: new Date()
      };
      this.messages.push(message); // Add the message to the local display

      // In a real application, you would send this message to your backend.
      // This would likely be via a WebSocket connection for real-time chat.
      // For HTTP POST example (less ideal for chat but shown for completeness):
      // this.http.post('/api/admin/send-message', message).pipe(takeUntil(this.destroy$)).subscribe(
      //   (response) => { console.log('Message sent successfully:', response); },
      //   (error) => { console.error('Error sending message:', error); }
      // );
      console.log('Admin sending message:', message);

      this.newMessageText = ''; // Clear the input field after sending
      this.scrollToBottom(); // Scroll to the newest message
    }
  }

  /**
   * Marks all messages from a specific user as read.
   * @param userId The ID of the user whose messages should be marked as read.
   */
  markMessagesAsRead(userId: string): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.unreadCount = 0; // Update the unread count in the UI immediately
      // In a real application, send a request to your backend to persist this change:
      // this.http.post(`/api/admin/mark-read/${userId}`, {}).pipe(takeUntil(this.destroy$)).subscribe(
      //   () => { console.log(`Messages for ${userId} marked as read.`); },
      //   (error) => { console.error(`Error marking messages for ${userId} as read:`, error); }
      // );
    }
  }

  /**
   * Angular lifecycle hook, called once when the component is destroyed.
   * Ensures all active subscriptions are cleaned up to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next(); // Emit a value to signal all subscriptions to complete
    this.destroy$.complete(); // Complete the subject
  }

  // Placeholder method for future WebSocket integration
  // connectWebSocket(): void {
  //   // Example using a hypothetical WebSocket service:
  //   // this.webSocketService.onMessage().pipe(takeUntil(this.destroy$)).subscribe(
  //   //   (incomingMessage: Message) => {
  //   //     // If the message is for the currently selected user, add it to the messages array
  //   //     if (this.selectedUser && incomingMessage.userId === this.selectedUser.id) {
  //   //       this.messages.push(incomingMessage);
  //   //       this.scrollToBottom();
  //   //     } else {
  //   //       // Find the user in the list and increment their unread count
  //   //       const user = this.users.find(u => u.id === incomingMessage.userId);
  //   //       if (user) {
  //   //         user.unreadCount++;
  //   //       }
  //   //       // You might also want to re-sort the users list to bring the active chat to top
  //   //       this.users.sort((a, b) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0));
  //   //     }
  //   //   }
  //   // );
  // }
}