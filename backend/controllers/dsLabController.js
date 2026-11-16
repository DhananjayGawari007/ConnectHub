const { executeCppAction } = require('../services/cppBridge');

// Get all 4 data structure states
const getAllStructures = async (req, res) => {
  try {
    const data = await executeCppAction('all_get');
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving C++ data structures', error: err.message });
  }
};

// Execute arbitrary C++ operation for the lab
const executeOperation = async (req, res) => {
  try {
    const { action, args } = req.body;
    if (!action) {
      return res.status(400).json({ message: 'Action is required' });
    }

    const data = await executeCppAction(action, Array.isArray(args) ? args : []);
    res.json({ success: true, action, data });
  } catch (err) {
    console.error(`dsLab executeOperation [${req.body.action}] error:`, err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllStructures,
  executeOperation
};
