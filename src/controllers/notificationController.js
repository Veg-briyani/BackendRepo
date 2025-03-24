exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Ensure we always return an array
    res.json(notifications || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
}; 