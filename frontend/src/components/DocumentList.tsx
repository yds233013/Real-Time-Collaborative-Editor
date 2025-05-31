import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import type { Document } from '../services/DocumentService';
import { DocumentService } from '../services/DocumentService';

interface DocumentListProps {
  userId: string;
  onDocumentSelect: (document: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ userId, onDocumentSelect }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [userId]);

  const loadDocuments = async () => {
    try {
      const docs = await DocumentService.getDocuments(userId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await DocumentService.deleteDocument(id);
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleShareDocument = async () => {
    if (selectedDocument && shareEmail) {
      try {
        await DocumentService.shareDocument(selectedDocument._id, shareEmail);
        setIsShareDialogOpen(false);
        setShareEmail('');
        setSelectedDocument(null);
      } catch (error) {
        console.error('Error sharing document:', error);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">My Documents</Typography>
      </Box>

      <List>
        {documents.map((doc) => (
          <ListItem
            key={doc._id}
            component="div"
            sx={{ cursor: 'pointer' }}
            onClick={() => onDocumentSelect(doc)}
          >
            <ListItemText
              primary={doc.title}
              secondary={`Last modified: ${new Date(doc.updatedAt).toLocaleString()}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDocument(doc);
                  setIsShareDialogOpen(true);
                }}
              >
                <ShareIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDocument(doc._id);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Share Document Dialog */}
      <Dialog open={isShareDialogOpen} onClose={() => setIsShareDialogOpen(false)}>
        <DialogTitle>Share Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="User Email"
            fullWidth
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShareDocument} variant="contained">Share</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 