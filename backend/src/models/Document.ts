import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IDocument {
  title: string;
  content: any[];
  version: number;
  owner: string;
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentDocument extends MongooseDocument, IDocument {}

const documentSchema = new Schema({
  title: { type: String, required: true },
  content: { type: Array, default: [] },
  version: { type: Number, default: 1 },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

export const Document = mongoose.model<DocumentDocument>('Document', documentSchema); 