import Project from '../models/Project.js';
import Message from '../models/Message.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const chat = async (req, res, next) => {
  try {
    const { projectId, message } = req.body;

    if (!projectId || !message) {
      return res.status(400).json({ message: 'projectId and message are required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key not configured' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    // Load last 10 messages for context
    const previousMessages = await Message.find({ projectId })
      .sort({ createdAt: 1 })
      .limit(10)
      .select('role content');

    // Build messages array
    const messages = [];

    // Add system prompt if exists
    if (project.systemPrompt) {
      messages.push({
        role: 'system',
        content: project.systemPrompt
      });
    }

    // Add previous conversation messages
    previousMessages.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Save user message
    await Message.create({
      projectId,
      role: 'user',
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || '';

    // Save assistant response
    await Message.create({
      projectId,
      role: 'assistant',
      content: response
    });

    return res.status(200).json({
      response
    });
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      return res.status(500).json({ message: 'OpenAI API error', error: err.message });
    }
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    // Retrieve all messages for the project, sorted by creation time
    const messages = await Message.find({ projectId })
      .sort({ createdAt: 1 })
      .select('role content createdAt');

    return res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
};
