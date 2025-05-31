import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Descendant } from 'slate';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import debounce from 'lodash.debounce';
import { Box, Chip, Stack, Typography, IconButton, Tooltip, TextField, CircularProgress, Snackbar, Alert, Backdrop } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import { DocumentService } from '../services/DocumentService';
import Toolbar from './Toolbar';
import { WebSocketService } from '../services/WebSocketService';

interface EditorProps {
  documentId: string;
}

interface DocumentData {
  content: Descendant[];
  version: number;
}

interface DocumentUpdate {
  changes: Descendant[];
  version: number;
}

interface CursorUpdate {
  userId: string;
  cursor: {
    anchor: { path: number[]; offset: number };
    focus: { path: number[]; offset: number };
  };
}

const Editor: React.FC<EditorProps> = ({ documentId }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: 'Loading...' }],
    },
  ]);
  const [version, setVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [documentHistory, setDocumentHistory] = useState<DocumentData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocketService | null>(null);

  useEffect(() => {
    const ws = new WebSocketService(documentId);
    setSocket(ws);
    setIsConnected(true);

    return () => {
      ws.destroy();
    };
  }, [documentId]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('load-document', ({ content, version: docVersion }: DocumentData) => {
      setValue(content);
      setVersion(docVersion);
      setIsLoading(false);
    });

    socket.on('document-changed', ({ changes, version: newVersion }: DocumentUpdate) => {
      if (newVersion > version) {
        setValue(changes);
        setVersion(newVersion);
      }
    });

    socket.on('cursor-moved', (update: CursorUpdate) => {
      // Handle remote cursor updates
      // Implementation depends on your cursor visualization strategy
      console.log('Cursor update:', update);
    });

    socket.on('error', (error: string) => {
      setError(error);
    });

    return () => {
      socket.off('load-document');
      socket.off('document-changed');
      socket.off('cursor-moved');
      socket.off('error');
    };
  }, [socket, isConnected, version]);

  const onChange = useCallback(
    (newValue: Descendant[]) => {
      setValue(newValue);
      if (!socket || !isConnected) return;

      const newVersion = version + 1;
      socket.emit('update-document', {
        documentId,
        changes: newValue,
        version: newVersion
      });
      setVersion(newVersion);
    },
    [socket, isConnected, version, documentId]
  );

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      const response = await DocumentService.getDocument(documentId);
      setTitle(response.title);
      setValue(response.content);
      setVersion(response.version);
    } catch (err) {
      setError('Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    try {
      setIsSaving(true);
      await DocumentService.updateTitle(documentId, newTitle);
      setTitle(newTitle);
    } catch (err) {
      setError('Failed to update title');
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedTitleChange = useMemo(
    () => debounce(handleTitleChange, 1000),
    [documentId]
  );

  useEffect(() => {
    loadDocument();
    return () => {
      debouncedTitleChange.cancel();
    };
  }, [documentId]);

  if (isLoading) {
    return (
      <Backdrop open>
        <CircularProgress />
      </Backdrop>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            debouncedTitleChange(e.target.value);
          }}
          variant="standard"
          sx={{ flexGrow: 1 }}
        />
        <Chip
          label={isConnected ? 'Connected' : 'Disconnected'}
          color={isConnected ? 'success' : 'error'}
        />
        <Tooltip title="View History">
          <IconButton onClick={() => setShowHistory(true)}>
            <HistoryIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Save">
          <IconButton onClick={loadDocument}>
            <SaveIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{
        flexGrow: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        overflow: 'auto',
        maxHeight: { xs: 'calc(100vh - 200px)', sm: 'none' }
      }}>
        <Slate editor={editor} initialValue={value} onChange={onChange}>
          <Toolbar editor={editor} />
          <Box sx={{ mt: 2, position: 'relative' }}>
            <Editable
              placeholder="Start typing..."
              spellCheck
              autoFocus
            />
          </Box>
        </Slate>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Editor;