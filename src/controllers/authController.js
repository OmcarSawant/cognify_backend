import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Authorization Controller  
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({ email, password });
    const token = generateToken(user._id);

    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

