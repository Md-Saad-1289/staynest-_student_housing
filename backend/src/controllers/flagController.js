import Flag from '../models/Flag.js';

// Flag a listing
const flagListing = async (req, res) => {
  try {
    const { listingId, reason } = req.body;

    if (!listingId || !reason) {
      return res.status(400).json({ error: 'Listing ID and reason required' });
    }

    const flag = new Flag({
      listingId,
      flaggedBy: req.user.userId,
      reason,
      resolved: false,
    });

    await flag.save();

    res.status(201).json({
      message: 'Listing flagged successfully',
      flag,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { flagListing };
