require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');

const connectDB = require('../config/database');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',  // Will be hashed by pre-save hook
      role: 'admin',
      profile: {
        title: 'System Administrator',
        location: 'New York, USA',
        bio: 'System administrator for the author dashboard'
      }
    });

    // Create sample authors
    const authors = [];
    for (let i = 1; i <= 3; i++) {
      const author = await User.create({
        name: `Author ${i}`,
        email: `author${i}@example.com`,
        password: `author${i}pass`,  // Will be hashed by pre-save hook
        role: 'author',
        badges: ['Verified Author', 'Best Seller'],
        monthlyRevenue: [
          { month: new Date('2024-01-01'), amount: 1500 * i },
          { month: new Date('2024-02-01'), amount: 2000 * i }
        ],
        profile: {
          title: 'Published Author',
          location: 'California, USA',
          bio: `Bio for Author ${i}`,
          memberSince: new Date('2023-01-01')
        },
        authorStats: {
          numberOfPublications: 3,
          averageRating: 4.5,
          numberOfFollowers: 1000 * i,
          totalWorks: 3
        },
        achievements: ['Best Seller 2023', '10k Readers Club']
      });
      authors.push(author);
    }

    // Create sample books for each author
    for (const author of authors) {
      for (let i = 1; i <= 3; i++) {
        await Book.create({
          title: `Book ${i} by ${author.name}`,
          authorId: author._id,
          price: 19.99 + i,
          stock: 100 * i,
          soldCopies: 50 * i,
          royalties: 500 * i,
          category: ['Fiction', 'Non-Fiction', 'Technical'][i - 1],
          isbn: `ISBN-${author._id}-${i}`,
          marketplaceLinks: {
            amazon: `https://amazon.com/book-${i}`,
            flipkart: `https://flipkart.com/book-${i}`
          },
          lastMonthSale: 20 * i,
          publication: {
            publicationId: `PUB-${i}`,
            rating: 4.5,
            publishedDate: new Date('2023-06-01'),
            description: `Description for Book ${i} by ${author.name}`
          }
        });
      }
    }

    console.log('Seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();