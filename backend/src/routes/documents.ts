import { Router, RequestHandler } from 'express';
import type { Request, Response } from 'express';
import { Document } from '../models/Document';

const router = Router();

interface DocumentBody {
  title: string;
  owner: string;
  content?: any[];
  email?: string;
}

// Create a new document
router.post('/', (req: Request<{}, {}, DocumentBody>, res: Response) => {
  try {
    const { title, owner } = req.body;
    const document = new Document({
      title,
      owner,
      content: [{ type: 'paragraph', children: [{ text: '' }] }]
    });
    document.save()
      .then(doc => res.status(201).json(doc))
      .catch(error => res.status(400).json({ message: 'Error creating document', error }));
  } catch (error) {
    res.status(400).json({ message: 'Error creating document', error });
  }
});

// Get all documents for a user
router.get('/', (req: Request<{}, {}, {}, { userId: string }>, res: Response) => {
  const { userId } = req.query;
  Document.find({
    $or: [
      { owner: userId },
      { sharedWith: userId }
    ]
  })
    .then(documents => res.json(documents))
    .catch(error => res.status(500).json({ message: 'Error fetching documents', error }));
});

// Get a specific document
router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  Document.findById(req.params.id)
    .then(document => {
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      res.json(document);
    })
    .catch(error => res.status(500).json({ message: 'Error fetching document', error }));
});

// Update a document
router.put('/:id', (req: Request<{ id: string }, {}, DocumentBody>, res: Response) => {
  const { content } = req.body;
  Document.findByIdAndUpdate(
    req.params.id,
    { content },
    { new: true }
  )
    .then(document => {
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      res.json(document);
    })
    .catch(error => res.status(500).json({ message: 'Error updating document', error }));
});

// Delete a document
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  Document.findByIdAndDelete(req.params.id)
    .then(document => {
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      res.json({ message: 'Document deleted successfully' });
    })
    .catch(error => res.status(500).json({ message: 'Error deleting document', error }));
});

// Share a document
const shareDocument: RequestHandler = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }
  
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { sharedWith: email } },
      { new: true }
    );
    
    if (!document) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error sharing document', error });
  }
};

router.post('/:id/share', shareDocument);

export default router; 