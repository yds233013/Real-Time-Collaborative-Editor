import { io, Socket } from 'socket.io-client';
import type { Descendant } from 'slate';
import { Location } from 'slate';
import { debounce } from 'lodash';

export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: Location;
}

export interface DocumentVersion {
  version: number;
  content: Descendant[];
  timestamp: Date;
}

export interface BatchUpdate {
  changes: Descendant[];
  timestamp: number;
}

export class WebSocketService {
  private socket: Socket;
  private documentId: string;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private activeUsers: Map<string, User> = new Map();
  private documentHistory: DocumentVersion[] = [];
  private currentVersion: number = 0;
  private batchedUpdates: BatchUpdate[] = [];
  private batchTimeout: number = 1000; // 1 second batch window
  private documentCache: Map<string, DocumentVersion> = new Map();

  constructor(documentId: string) {
    this.documentId = documentId;
    this.socket = io('http://localhost:3001', {
      reconnectionAttempts: this.maxRetries,
      reconnectionDelay: 1000,
      autoConnect: true,
      // Optimize WebSocket payloads
      transports: ['websocket'],
      query: { documentId }
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket.emit('join-document', {
        documentId,
        user: {
          name: localStorage.getItem('userName') || 'Anonymous',
          color: this.getRandomColor()
        }
      });
      this.retryCount = 0;
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      this.retryCount++;
      if (this.retryCount >= this.maxRetries) {
        console.error('Max reconnection attempts reached');
        this.socket.disconnect();
      }
    });

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });
  }

  private getRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Debounced update function
  private debouncedUpdate = debounce((changes: Descendant[]) => {
    this.processBatchedUpdates();
  }, 500); // 500ms debounce time

  private processBatchedUpdates = () => {
    if (this.batchedUpdates.length === 0) return;

    // Merge all batched updates into a single update
    const mergedChanges = this.batchedUpdates.reduce((acc, curr) => {
      return curr.changes; // Take the latest changes
    }, this.batchedUpdates[0].changes);

    // Clear the batch
    this.batchedUpdates = [];

    // Send the merged update
    if (this.socket.connected) {
      this.socket.emit('update-document', {
        documentId: this.documentId,
        changes: mergedChanges,
        version: this.currentVersion + 1
      });
    }
  };

  // Cache management
  private cacheDocument(version: DocumentVersion) {
    if (this.documentId) {
      this.documentCache.set(this.documentId, version);
      // Implement LRU cache if needed
      if (this.documentCache.size > 100) { // Limit cache size
        const firstKey = Array.from(this.documentCache.keys())[0];
        if (firstKey) {
          this.documentCache.delete(firstKey);
        }
      }
    }
  }

  private getCachedDocument(): DocumentVersion | undefined {
    return this.documentCache.get(this.documentId);
  }

  public subscribeToChanges(
    onContentChange: (changes: Descendant[]) => void,
    onUsersChange: (users: User[]) => void,
    onHistoryChange: (history: DocumentVersion[]) => void
  ) {
    this.socket.on('document-changed', (data: { changes: Descendant[], version: number }) => {
      console.log('Document changed:', data);
      this.currentVersion = data.version;
      
      // Update cache
      const newVersion: DocumentVersion = {
        version: data.version,
        content: data.changes,
        timestamp: new Date()
      };
      this.cacheDocument(newVersion);
      
      onContentChange(data.changes);
      this.documentHistory.push(newVersion);
      onHistoryChange(this.documentHistory);
    });

    this.socket.on('load-document', (data: { 
      content: Descendant[],
      version: number,
      history: DocumentVersion[]
    }) => {
      console.log('Document loaded:', data);
      this.currentVersion = data.version;
      this.documentHistory = data.history;
      onContentChange(data.content);
      onHistoryChange(this.documentHistory);
    });

    this.socket.on('users-changed', (users: User[]) => {
      console.log('Users changed:', users);
      this.activeUsers.clear();
      users.forEach(user => this.activeUsers.set(user.id, user));
      onUsersChange(users);
    });

    this.socket.on('cursor-moved', (data: { userId: string, cursor: Location }) => {
      const user = this.activeUsers.get(data.userId);
      if (user) {
        user.cursor = data.cursor;
        onUsersChange(Array.from(this.activeUsers.values()));
      }
    });

    return () => {
      this.socket.off('document-changed');
      this.socket.off('load-document');
      this.socket.off('users-changed');
      this.socket.off('cursor-moved');
    };
  }

  public updateDocument(changes: Descendant[]) {
    // Add to batch
    this.batchedUpdates.push({
      changes,
      timestamp: Date.now()
    });

    // Trigger debounced update
    this.debouncedUpdate(changes);
  }

  public updateCursor(cursor: Location) {
    if (this.socket.connected) {
      this.socket.emit('cursor-update', {
        documentId: this.documentId,
        cursor
      });
    }
  }

  public on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  public off(event: string) {
    this.socket.off(event);
  }

  public emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  public destroy() {
    if (this.socket) {
      // Cancel any pending debounced updates
      this.debouncedUpdate.cancel();
      // Clear batched updates
      this.batchedUpdates = [];
      // Clear cache
      this.documentCache.clear();
      
      this.socket.emit('leave-document', this.documentId);
      this.socket.off('document-changed');
      this.socket.off('load-document');
      this.socket.off('users-changed');
      this.socket.off('cursor-moved');
      this.socket.disconnect();
    }
  }
} 