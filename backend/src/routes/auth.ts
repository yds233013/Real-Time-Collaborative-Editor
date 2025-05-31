import { Router, RequestHandler } from 'express';
import { User, UserDocument } from '../models/User';
import { generateToken } from '../middleware/auth';

const router = Router();

interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

// Register a new user
const register: RequestHandler<{}, any, RegisterBody> = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ error: 'Username or email already exists' });
      return;
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id.toString());
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
};

// Login user
const login: RequestHandler<{}, any, LoginBody> = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid login credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid login credentials' });
      return;
    }

    const token = generateToken(user._id.toString());
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Error logging in' });
  }
};

router.post('/register', register);
router.post('/login', login);

export default router; 