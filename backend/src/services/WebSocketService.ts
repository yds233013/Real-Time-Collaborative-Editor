import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Document, IDocument, DocumentDocument } from '../models/Document';
import { CacheService } from './CacheService';

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: any;
}

interface DocumentUpdate {
  documentId: string;
  changes: any[];
  version: number;
}

export class WebSocketService {
  private io: SocketIOServer;
  private documentVersions: Map<string, number> = new Map();
  private batchTimeout: number = 1000; // 1 second batch window
  private pendingUpdates: Map<string, DocumentUpdate[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  private cacheService: CacheService;

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.cacheService = new CacheService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected');

      socket.on('join-document', async (documentId: string) => {
        socket.join(documentId);
        
        const document = await this.cacheService.getOrFetchDocument(documentId, async () => {
          const doc = await Document.findById(documentId);
          if (!doc) return null;
          return {
            content: doc.content,
            version: doc.version,
            title: doc.title,
            owner: doc.owner,
            sharedWith: doc.sharedWith,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
          } as IDocument;
        });

        if (document) {
          socket.emit('load-document', {
            content: document.content,
            version: document.version
          });
        }
      });

      socket.on('send-changes', (update: DocumentUpdate) => {
        this.addToBatch(update, socket);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private addToBatch(update: DocumentUpdate, socket: Socket) {
    const { documentId } = update;
    
    if (!this.pendingUpdates.has(documentId)) {
      this.pendingUpdates.set(documentId, []);
    }
    
    this.pendingUpdates.get(documentId)?.push(update);

    if (this.batchTimers.has(documentId)) {
      clearTimeout(this.batchTimers.get(documentId));
    }

    const timer = setTimeout(() => {
      this.processBatch(documentId, socket);
    }, this.batchTimeout);

    this.batchTimers.set(documentId, timer);
  }

  private async processBatch(documentId: string, socket: Socket) {
    const updates = this.pendingUpdates.get(documentId) || [];
    if (updates.length === 0) return;

    const lastUpdate = updates[updates.length - 1];
    const doc = await Document.findById(documentId);
    
    if (!doc) return;

    doc.content = lastUpdate.changes;
    doc.version = lastUpdate.version;
    await doc.save();

    const documentData: IDocument = {
      content: doc.content,
      version: doc.version,
      title: doc.title,
      owner: doc.owner,
      sharedWith: doc.sharedWith,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };

    this.cacheService.setDocument(documentId, documentData);
    
    socket.to(documentId).emit('receive-changes', {
      changes: lastUpdate.changes,
      version: lastUpdate.version
    });

    this.pendingUpdates.delete(documentId);
    this.batchTimers.delete(documentId);
  }

  private handleDisconnect(socket: Socket) {
    console.log('Client disconnected');
  }
} 