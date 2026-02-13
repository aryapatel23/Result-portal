const SystemConfig = require('../models/SystemConfig');

// Get current system config
exports.getConfig = async (req, res) => {
    try {
        let config = await SystemConfig.findOne({ key: 'default_config' });

        // Create default if not exists
        if (!config) {
            config = new SystemConfig({ key: 'default_config' });
            await config.save();
        }

        res.json(config);
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ message: 'Server error fetching configuration', error: error.message });
    }
};

// Update system config (Admin only)
exports.updateConfig = async (req, res) => {
    try {
        const { yearlyLeaveLimit, academicYear } = req.body;

        let config = await SystemConfig.findOne({ key: 'default_config' });

        if (!config) {
            config = new SystemConfig({ key: 'default_config' });
        }

        if (yearlyLeaveLimit !== undefined) config.yearlyLeaveLimit = Number(yearlyLeaveLimit);
        if (academicYear) config.academicYear = academicYear;

        await config.save();

        res.json({ message: 'System configuration updated successfully', config });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ message: 'Server error updating configuration', error: error.message });
    }
};
