import axios from 'axios';
import type { Descendant } from 'slate';

const API_URL = 'http://localhost:3001/api';

export interface Document {
  _id: string;
  title: string;
  content: Descendant[];
  version: number;
  owner: string;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

export const DocumentService = {
  // Create a new document
  createDocument: async (title: string, owner: string): Promise<Document> => {
    console.log('Making API call to create document:', { title, owner });
    const response = await axios.post(`${API_URL}/documents`, { title, owner });
    console.log('API response:', response.data);
    return response.data;
  },

  // Get all documents for a user
  getDocuments: async (userId: string): Promise<Document[]> => {
    console.log('Fetching documents for user:', userId);
    const response = await axios.get(`${API_URL}/documents?userId=${userId}`);
    console.log('Fetched documents:', response.data);
    return response.data;
  },

  // Get a specific document
  getDocument: async (id: string): Promise<Document> => {
    const response = await axios.get(`${API_URL}/documents/${id}`);
    return response.data;
  },

  // Update a document
  updateDocument: async (id: string, content: Descendant[]): Promise<Document> => {
    const response = await axios.put(`${API_URL}/documents/${id}`, { content });
    return response.data;
  },

  // Update a document's title
  updateTitle: async (id: string, title: string): Promise<Document> => {
    const response = await axios.patch(`${API_URL}/documents/${id}/title`, { title });
    return response.data;
  },

  // Delete a document
  deleteDocument: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/documents/${id}`);
  },

  // Share a document with a user
  shareDocument: async (id: string, email: string): Promise<Document> => {
    const response = await axios.post(`${API_URL}/documents/${id}/share`, { email });
    return response.data;
  }
}; 