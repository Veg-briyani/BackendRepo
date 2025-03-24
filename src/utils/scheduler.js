const cron = require('node-cron');
const { sendSalesReport } = require('./emailService');
const Book = require('../models/Book');

// Every Monday at 9AM
cron.schedule('0 9 * * 1', async () => {
  const authors = await User.find({ role: 'author' });
  
  authors.forEach(async author => {
    const salesData = await Book.aggregate([
      { $match: { author: author._id } },
      { $group: { 
        _id: null,
        totalSales: { $sum: "$soldCopies" },
        totalRoyalty: { $sum: "$royalties" }
      }}
    ]);
    
    // Handle case where author has no sales
    const reportData = salesData.length > 0 ? salesData[0] : {
      totalSales: 0,
      totalRoyalty: 0
    };
    
    sendSalesReport(author.email, {
      period: 'weekly',
      ...reportData
    });
  });
}); 