# API Routes Documentation

## Table of Contents
- [Book Routes](#book-routes)
- [Admin Routes](#admin-routes)
- [Authentication Routes](#authentication-routes)
- [Notification Routes](#notification-routes)
- [Order Routes](#order-routes)
- [Print Routes](#print-routes)
- [Royalty Routes](#royalty-routes)

---

## Book Routes
`Controller: bookController.js`

| Method | Path | Description | Middleware | Validation |
|--------|------|-------------|------------|------------|
| POST   | /books | Create new book | auth | validateBook |
| GET    | /books | Get all books | auth | - |
| GET    | /books/dashboard | Get dashboard statistics | auth | - |
| GET    | /books/:id | Get single book by ID | auth | - |
| PUT    | /books/:id | Update book details | auth | validateBook |
| PUT    | /books/:id/cover | Upload cover image | auth, authorizeRole(['admin']) | File Upload |
| DELETE | /books/:id | Delete book | auth | - |
| GET    | /books/admin/all | Get all books (Admin) | auth, authorizeRole(['admin']) | - |
| PUT    | /books/:id/author-price | Update author price | auth | validateAuthorPrice |

---

## Admin Routes
`Controller: adminController.js`

| Method | Path | Description | Middleware | Validation |
|--------|------|-------------|------------|------------|
| GET    | /admin/users | Get all users | auth, authorizeRole(['admin']) | - |
| PUT    | /admin/users/:id | Update user | auth, authorizeRole(['admin']) | - |
| DELETE | /admin/users/:id | Delete user + books | auth, authorizeRole(['admin']) | - |
| GET    | /admin/books | Get all books | auth, authorizeRole(['admin']) | - |
| PUT    | /admin/books/:id | Update book | auth, authorizeRole(['admin']) | - |
| DELETE | /admin/books/:id | Delete book | auth, authorizeRole(['admin']) | - |
| POST   | /admin/kyc/approve/:userId | Approve/reject KYC | auth, authorizeRole(['admin']) | - |
| GET    | /admin/kyc | Get pending KYCs | auth, authorizeRole(['admin']) | - |
| POST   | /admin/royalties/:id/approve | Approve payout | auth, authorizeRole(['admin']) | - |
| POST   | /admin/royalties/:id/reject | Reject payout | auth, authorizeRole(['admin']) | - |
| GET    | /admin/orders | Get all orders | auth, authorizeRole(['admin']) | - |
| GET    | /admin/print-logs | Get print logs | auth, authorizeRole(['admin']) | - |
| GET    | /admin/payouts/history | Get payout history | auth, authorizeRole(['admin']) | - |
| PUT    | /admin/users/:id/revenue | Update user revenue data | auth, authorizeRole(['admin']) | validateUserRevenue |

---

## Authentication Routes
`Controller: authController.js`

| Method | Path | Description | Middleware | Validation |
|--------|------|-------------|------------|------------|
| POST   | /auth/register | User registration | - | validateUser |
| POST   | /auth/login | User login | - | validateLogin |
| POST   | /auth/forgot-password | Forgot password | - | validateForgotPassword |
| POST   | /auth/reset-password | Password reset | - | validateResetPassword |
| POST   | /auth/google-login | Google login | - | validateGoogleLogin |
| GET    | /auth/profile | Get user profile | auth | - |
| PUT    | /auth/profile | Update profile | auth | validateProfileUpdate |

---

## Notification Routes
`Controller: notificationController.js`

| Method | Path | Description | Middleware | Validation |
|--------|------|-------------|------------|------------|
| POST   | /notifications/admin | Send admin notification | auth, authorizeRole(['admin']) | - |
| GET    | /notifications | Get user notifications | auth | - |
| PUT    | /notifications/:id/read | Mark as read | auth | - |

---

## Order Routes
`Controller: orderController.js`

| Method | Path | Description | Middleware | Validation |
|--------|------|-------------|------------|------------|
| POST   | /orders | Create order | auth | - |
| POST   | /orders/razorpay-webhook | Razorpay payment webhook | - | - |
| GET    | /orders/my-orders | Get user orders | auth | - |
| GET    | /orders/admin | Get all orders (Admin) | auth, authorizeRole(['admin']) | - |
| PUT    | /orders/:id/status | Update order status | auth, authorizeRole(['admin']) | - |

---

## Print Routes
`Controller: printController.js`

| Method | Path | Description | Middleware | Validation |
|--------|------|-------------|------------|------------|
| POST   | /prints | Create print log | auth | validatePrintLog |
| GET    | /prints | Get user print logs | auth | - |
| GET    | /prints/:id | Get single print log | auth | - |
| PUT    | /prints/:id | Update print log | auth | validatePrintLog |
| DELETE | /prints/:id | Delete print log | auth | - |

---

## Royalty Routes
`Controller: royaltyController.js`

| Method | Path | Description | Middleware | Validation |
|--------|------|-------------|------------|------------|
| GET    | /royalties | Get user payouts | auth | - |
| POST   | /royalties/request | Request payout | auth | validatePayoutRequest |
| POST   | /royalties/process-payout/:id | Process payout (Admin) | auth, authorizeRole(['admin']) | - |
| GET    | /royalties/all | Get all payouts (Admin) | auth, authorizeRole(['admin']) | - |
| POST   | /royalties/:id/approve | Approve payout (Admin) | auth, authorizeRole(['admin']) | - |

---

## Key
- **Auth**: Requires valid JWT authentication
- **authorizeRole(['admin'])**: Requires admin privileges
- **Validation**: Uses Joi validation middleware
- **File Upload**: Uses Multer middleware for file handling

## Response Formats
All routes return JSON responses with following structure:
```json
{
  "message": "Descriptive message",
  "data": {} || [],
  "error": "Error message (if any)"
}