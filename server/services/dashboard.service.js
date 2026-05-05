const PGListing = require('../models/PGListing');
const Inquiry = require('../models/Inquiry');

/**
 * Get dashboard analytics summary for an owner
 */
exports.getDashboardStats = async (ownerId) => {
  const [listings, inquiryCounts] = await Promise.all([
    PGListing.find({ owner: ownerId }).lean(),
    Inquiry.aggregate([
      { $match: { owner: ownerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const totalViews = listings.reduce((sum, l) => sum + (l.analytics?.views || 0), 0);
  const totalSaves = listings.reduce((sum, l) => sum + (l.analytics?.saves || 0), 0);
  const totalInquiries = listings.reduce((sum, l) => sum + (l.analytics?.inquiries || 0), 0);
  const totalListings = listings.length;
  const availableListings = listings.filter((l) => l.isAvailable).length;

  const inquiryByStatus = inquiryCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    totalListings,
    availableListings,
    totalViews,
    totalSaves,
    totalInquiries,
    inquiryByStatus,
    recentListings: listings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
  };
};
