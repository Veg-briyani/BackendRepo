const Joi = require('joi');

const validateUser = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).message('Invalid phone number format'),
    role: Joi.string().valid('author', 'admin'),
    profile: Joi.object({
      title: Joi.string(),
      location: Joi.string()
    }),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      zipCode: Joi.string()
    }),
    bankAccount: Joi.object({
      accountNumber: Joi.string(),
      ifscCode: Joi.string(),
      bankName: Joi.string()
    }).optional(),
    aadhaarNumber: Joi.string().length(12).pattern(/^\d+$/).optional(),
    panNumber: Joi.string().length(10).pattern(/^[A-Z]{5}\d{4}[A-Z]$/).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateBook = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().min(1).max(200),
    price: Joi.number().required().min(0),
    stock: Joi.number().required().min(0),
    category: Joi.string().required(),
    coverImage: Joi.string().optional(),
    isbn: Joi.string().required().pattern(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/),
    authorId: Joi.string().when('$isAdmin', { 
      is: true, 
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),
    marketplaceLinks: Joi.object({
      amazon: Joi.string().uri(),
      flipkart: Joi.string().uri()
    }),
    publication: Joi.object({
      publicationId: Joi.string().required(),
      rating: Joi.number().min(0).max(5),
      publishedDate: Joi.date().required(),
      description: Joi.string().required()
    }).required()
  });

  // Set context for admin validation
  const validationContext = {
    isAdmin: req.user && req.user.role === 'admin'
  };

  const { error } = schema.validate(req.body, { context: validationContext });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateForgotPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().required().email()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().required().min(6)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateProfileUpdate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).message('Invalid phone number format'),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      zipCode: Joi.string()
    }),
    about: Joi.string().max(1000),
    profile: Joi.object({
      title: Joi.string(),
      location: Joi.string(),
      bio: Joi.string(),
      profilePhoto: Joi.string() // Allow profilePhoto in profile object
    }),
    authorStats: Joi.object({
      numberOfPublications: Joi.number().min(0),
      averageRating: Joi.number().min(0).max(5),
      numberOfFollowers: Joi.number().min(0),
      totalWorks: Joi.number().min(0)
    }).optional(),
    // Also allow profilePhoto at root level for backward compatibility
    profilePhoto: Joi.string()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
const validateDashboardData = (req, res, next) => {
  const schema = Joi.object({
    totalRoyaltyEarned: Joi.number().min(0),
    outstandingRoyalty: Joi.number().min(0),
    copiesSold: Joi.number().min(0),
    royaltyReceived: Joi.number().min(0),
    currentMonthGrowth: Joi.number(),
    genres: Joi.array().items(Joi.string()),
    totalInventory: Joi.number().min(0),
    books: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        price: Joi.number().min(0).required(),
        stock: Joi.number().min(0).required(),
        royalty: Joi.number().min(0).required(),
        copiesSold: Joi.number().min(0).required(),
        lastMonthSale: Joi.number().required()
      })
    )
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateAdminUserUpdate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    role: Joi.string().valid('author', 'admin'),
    profile: Joi.object({
      title: Joi.string(),
      location: Joi.string(),
      bio: Joi.string()
    }),
    authorStats: Joi.object({
      numberOfPublications: Joi.number().min(0),
      averageRating: Joi.number().min(0).max(5),
      numberOfFollowers: Joi.number().min(0),
      totalWorks: Joi.number().min(0)
    }),
    badges: Joi.array().items(Joi.string()),
    achievements: Joi.array().items(Joi.string()),
    bankAccount: Joi.object({
      accountNumber: Joi.string().required(),
      ifscCode: Joi.string().required(),
      bankName: Joi.string().required()
    }),
    kycStatus: Joi.string().valid('pending', 'approved', 'rejected'),
    aadhaarNumber: Joi.string().length(12).pattern(/^\d+$/),
    panNumber: Joi.string().length(10).pattern(/^[A-Z]{5}\d{4}[A-Z]$/)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateGoogleLogin = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

const validatePrintLog = (req, res, next) => {
  const schema = Joi.object({
    bookId: Joi.string().required(),
    printDate: Joi.date().required(),
    quantity: Joi.number().min(1).required(),
    pressName: Joi.string().required(),
    cost: Joi.number().min(0).required(),
    edition: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

const validatePayoutRequest = (req, res, next) => {
  const schema = Joi.object({
    amount: Joi.number().min(100).required(),
    paymentMethod: Joi.string().valid('bank_transfer', 'upi', 'paypal').required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

const validateOrder = (req, res, next) => {
  const schema = Joi.object({
    bookId: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    paymentMethod: Joi.string().valid('wallet', 'razorpay').required(),
    isAuthorCopy: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

const validateAuthorPrice = (req, res, next) => {
  const schema = Joi.object({
    price: Joi.number().min(0).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

const validateUserRevenue = (req, res, next) => {
  const schema = Joi.object({
    monthlyRevenue: Joi.array().items(
      Joi.number().min(0)
    ),
    yearlyPerformance: Joi.array().items(
      Joi.object({
        year: Joi.number().required(),
        monthlyRevenue: Joi.array().items(
          Joi.object({
            month: Joi.number().min(1).max(12).required(),
            revenue: Joi.number().min(0).required()
          })
        )
      })
    )
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

const validateMonthlyRevenueUpdate = (req, res, next) => {
  const schema = Joi.object({
    revenue: Joi.number().min(0).required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

const validateKycUpdateRequest = (req, res, next) => {
  const schema = Joi.object({
    bankAccount: Joi.object({
      accountNumber: Joi.string().required(),
      ifscCode: Joi.string().required(),
      bankName: Joi.string().required()
    }).required(),
    kycInformation: Joi.object({
      aadhaarNumber: Joi.string().length(12).pattern(/^\d+$/).required(),
      panNumber: Joi.string().length(10).pattern(/^[A-Z]{5}\d{4}[A-Z]$/).required()
    }).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

module.exports = {
  validateUser,
  validateBook,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateProfileUpdate,
  validateDashboardData,
  validateAdminUserUpdate,
  validateGoogleLogin,
  validatePrintLog,
  validatePayoutRequest,
  validateOrder,
  validateAuthorPrice,
  validateUserRevenue,
  validateMonthlyRevenueUpdate,
  validateKycUpdateRequest
};

