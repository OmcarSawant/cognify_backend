import Project from '../models/Project.js';
import Message from '../models/Message.js';

export const createProject = async (req, res, next) => {
  try {
    const { name, description, systemPrompt } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description: description || '',
      systemPrompt: systemPrompt || '',
      userId: req.user.id
    });

    return res.status(201).json({
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        systemPrompt: project.systemPrompt,
        userId: project.userId,
        createdAt: project.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      projects: projects.map((p) => ({
        id: p._id,
        name: p.name,
        description: p.description,
        systemPrompt: p.systemPrompt,
        userId: p.userId,
        createdAt: p.createdAt
      }))
    });
  } catch (err) {
    next(err);
  }
};

export const updatePrompt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { systemPrompt } = req.body;

    if (systemPrompt === undefined) {
      return res.status(400).json({ message: 'systemPrompt is required' });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    project.systemPrompt = systemPrompt || '';
    await project.save();

    return res.status(200).json({
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        systemPrompt: project.systemPrompt,
        userId: project.userId,
        createdAt: project.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};
// Search Project , Any word you used in the chat

export const searchProjects = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Find messages matching the query

    // 1. Find all projects owned by user
    const userProjects = await Project.find({ userId: req.user.id }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    // 2. Find messages matching query AND belonging to user's projects
    const matchingMessages = await Message.find({
      projectId: { $in: projectIds },
      content: { $regex: q, $options: 'i' }
    }).distinct('projectId');

    // 3. Get project details for matched IDs
    const projects = await Project.find({
      _id: { $in: matchingMessages }
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      projects: projects.map((p) => ({
        id: p._id,
        name: p.name,
        description: p.description,
        systemPrompt: p.systemPrompt,
        userId: p.userId,
        createdAt: p.createdAt
      }))
    });
  } catch (err) {
    next(err);
  }
};
