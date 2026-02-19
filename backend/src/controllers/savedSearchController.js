import SavedSearch from '../models/SavedSearch.js';

// Get saved searches
export const getSavedSearches = async (req, res) => {
  try {
    const userId = req.user.userId;
    const searches = await SavedSearch.find({ userId }).sort({ createdAt: -1 });
    res.json({ searches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create saved search
export const createSavedSearch = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, filters, alertsEnabled } = req.body;

    if (!name || !filters) {
      return res.status(400).json({ error: 'Name and filters required' });
    }

    const savedSearch = new SavedSearch({
      userId,
      name,
      filters,
      alertsEnabled,
    });

    await savedSearch.save();
    res.status(201).json({ message: 'Search saved', savedSearch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update saved search
export const updateSavedSearch = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, filters, alertsEnabled } = req.body;

    const savedSearch = await SavedSearch.findById(id);
    if (!savedSearch) {
      return res.status(404).json({ error: 'Search not found' });
    }

    if (savedSearch.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this search' });
    }

    const updated = await SavedSearch.findByIdAndUpdate(
      id,
      { name, filters, alertsEnabled },
      { new: true }
    );

    res.json({ message: 'Search updated', savedSearch: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete saved search
export const deleteSavedSearch = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const savedSearch = await SavedSearch.findById(id);
    if (!savedSearch) {
      return res.status(404).json({ error: 'Search not found' });
    }

    if (savedSearch.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this search' });
    }

    await SavedSearch.findByIdAndDelete(id);
    res.json({ message: 'Search deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
