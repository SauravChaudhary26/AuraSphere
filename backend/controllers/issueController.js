const Issue = require('../models/Issue');

const createIssue = async (req, res) => {
    try {
        const {
            title,
            category,
            priority,
            description,
            steps,
            expectedBehavior,
            actualBehavior,
            browserInfo,
            contactEmail
        } = req.body;

        // Basic validation
        if (!title || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title, category, and description are required fields'
            });
        }

        // Create new issue
        const newIssue = new Issue({
            title,
            category,
            priority: priority || 'medium',
            description,
            steps,
            expectedBehavior,
            actualBehavior,
            browserInfo,
            contactEmail
        });

        const savedIssue = await newIssue.save();

        res.status(201).json({
            success: true,
            message: 'Issue reported successfully',
            data: {
                id: savedIssue._id,
                title: savedIssue.title,
                category: savedIssue.category,
                priority: savedIssue.priority,
                status: savedIssue.status,
                createdAt: savedIssue.createdAt
            }
        });

    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

const getAllIssues = async (req, res) => {
    try {
        const { status, category, priority, page = 1, limit = 10 } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        };

        const issues = await Issue.find(filter)
            .sort(options.sort)
            .limit(options.limit * 1)
            .skip((options.page - 1) * options.limit);

        const total = await Issue.countDocuments(filter);

        res.json({
            success: true,
            data: issues,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalItems: total,
                itemsPerPage: options.limit
            }
        });

    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        res.json({
            success: true,
            data: issue
        });

    } catch (error) {
        console.error('Error fetching issue:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createIssue,
    getAllIssues,
    getIssue
};