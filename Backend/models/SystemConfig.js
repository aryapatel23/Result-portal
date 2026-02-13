const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'default_config'
    },
    yearlyLeaveLimit: {
        type: Number,
        required: true,
        default: 12 // Default to 12 leaves per year
    },
    semesterStartDate: {
        type: Date,
        default: null
    },
    semesterEndDate: {
        type: Date,
        default: null
    },
    academicYear: {
        type: String, // e.g., "2023-2024"
        default: new Date().getFullYear().toString()
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
