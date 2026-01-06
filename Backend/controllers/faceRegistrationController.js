const User = require("../models/User");

// Register face for a teacher
exports.registerFace = async (req, res) => {
  try {
    const { userId, referenceFaceImage, faceDescriptor } = req.body;

    if (!userId || !referenceFaceImage || !faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: "User ID, reference face image, and face descriptor are required"
      });
    }

    // Validate that the user exists and is a teacher
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "teacher") {
      return res.status(400).json({
        success: false,
        message: "Only teachers can register face data"
      });
    }

    // Update user with face data
    user.referenceFaceImage = referenceFaceImage;
    user.faceDescriptor = faceDescriptor;
    user.faceRegistered = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Face registered successfully",
      data: {
        userId: user._id,
        name: user.name,
        faceRegistered: true
      }
    });
  } catch (error) {
    console.error("Error registering face:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register face",
      error: error.message
    });
  }
};

// Get face registration status
exports.getFaceStatus = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const user = await User.findById(userId).select('faceRegistered referenceFaceImage name employeeId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        faceRegistered: user.faceRegistered || false,
        hasReferenceImage: !!user.referenceFaceImage,
        name: user.name,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    console.error("Error getting face status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get face status",
      error: error.message
    });
  }
};

// Get face descriptor for verification
exports.getFaceDescriptor = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const user = await User.findById(userId).select('faceDescriptor faceRegistered');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.faceRegistered || !user.faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: "Face not registered. Please register your face first."
      });
    }

    res.status(200).json({
      success: true,
      data: {
        faceDescriptor: user.faceDescriptor
      }
    });
  } catch (error) {
    console.error("Error getting face descriptor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get face descriptor",
      error: error.message
    });
  }
};

// Update/Re-register face
exports.updateFace = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { referenceFaceImage, faceDescriptor } = req.body;

    if (!referenceFaceImage || !faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: "Reference face image and face descriptor are required"
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.referenceFaceImage = referenceFaceImage;
    user.faceDescriptor = faceDescriptor;
    user.faceRegistered = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Face updated successfully"
    });
  } catch (error) {
    console.error("Error updating face:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update face",
      error: error.message
    });
  }
};
