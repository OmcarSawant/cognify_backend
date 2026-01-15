import Project from '../models/Project.js';
import Message from '../models/Message.js';

export const getUsageStats = async (req, res, next) => {
    try {
        // Get all projects owned by the logged-in user
        const userProjects = await Project.find({ userId: req.user.id }).select('_id');
        const projectIds = userProjects.map(p => p._id);

        if (projectIds.length === 0) {
            // New user with no projects
            return res.status(200).json({
                totalMessages: 0,
                userMessages: 0,
                assistantMessages: 0,
                messagesPerProject: [],
                todayMessages: 0
            });
        }

        // Aggregate message stats for user's projects
        const stats = await Message.aggregate([
            { $match: { projectId: { $in: projectIds } } },
            {
                $group: {
                    _id: null,
                    totalMessages: { $sum: 1 },
                    userMessages: {
                        $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] }
                    },
                    assistantMessages: {
                        $sum: { $cond: [{ $eq: ['$role', 'assistant'] }, 1, 0] }
                    }
                }
            }
        ]);

        const messagesPerProject = await Message.aggregate([
            { $match: { projectId: { $in: projectIds } } },
            {
                $group: {
                    _id: '$projectId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'project'
                }
            },
            {
                $project: {
                    projectId: '$_id',
                    projectName: { $arrayElemAt: ['$project.name', 0] },
                    messageCount: '$count'
                }
            }
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayStats = await Message.countDocuments({
            projectId: { $in: projectIds },
            createdAt: { $gte: today }
        });

        const result = stats[0] || {
            totalMessages: 0,
            userMessages: 0,
            assistantMessages: 0
        };

        return res.status(200).json({
            totalMessages: result.totalMessages || 0,
            userMessages: result.userMessages || 0,
            assistantMessages: result.assistantMessages || 0,
            messagesPerProject,
            todayMessages: todayStats
        });
    } catch (err) {
        next(err);
    }
};
