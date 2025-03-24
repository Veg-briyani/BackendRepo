# Book Store Management API Documentation

## Base URL
`http://localhost:5000`

## Authentication
All endpoints except `/api/health` and `/api/auth/*` (except profile) require JWT authentication.
```http
Authorization: Bearer <your_token>
```

## API Endpoints

### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2024-02-13T12:34:56.789Z",
  "uptime": 1234.56
}
```

### Authentication
#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "role": "author"
}
```

#### Login with Email/Password
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "profile": {
    "title": "Lead Author",
    "location": "San Francisco",
    "bio": "Updated bio information"
  },
  "authorStats": {
    "numberOfPublications": 5,
    "averageRating": 4.5,
    "numberOfFollowers": 1000,
    "totalWorks": 8
  }
}
```

### Google Login
```http
POST /api/auth/google-login
Content-Type: application/json

{
  "token": "google-id-token"
}
```

### Book Management
#### Create Book
```http
POST /api/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Sample Book",
  "price": 29.99,
  "stock": 100,
  "category": "Fiction",
  "isbn": "978-3-16-148410-0"
}
```

#### Get Author's Books
```http
GET /api/books
Authorization: Bearer <token>
```

#### Get Book by ID
```http
GET /api/books/:id
Authorization: Bearer <token>
```

#### Get Dashboard Statistics
```http
GET /api/books/dashboard
Authorization: Bearer <token>
```

#### Update Book
```http
PUT /api/books/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Book Title",
  "price": 39.99,
  "stock": 150,
  "category": "Non-Fiction",
  "isbn": "978-0123456789",
  "marketplaceLinks": {
    "amazon": "https://amazon.com/updated-book",
    "flipkart": "https://flipkart.com/updated-book"
  },
  "publication": {
    "publicationId": "pub123",
    "rating": 4.8,
    "publishedDate": "2024-02-13",
    "description": "Updated description..."
  }
}
```

#### Update Book Cover (Admin Only)
```http
PUT /api/books/:id/cover
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data:
- coverImage: (file upload)
```

**Success Response:**
```json
{
  "message": "Cover image updated successfully",
  "coverImage": "http://localhost:5000/book-covers/cover-1234567890.jpg"
}
```

**Error Responses:**
```json
{
  "message": "No image uploaded"
}
```
```json
{
  "message": "Only image files are allowed!"
}
```

#### Get Book Details
```http
GET /api/books/:id
Authorization: Bearer <token>

Response:
{
  "_id": "book_id",
  "title": "Sample Book",
  "printingTimeline": [
    {
      "stage": "Printing",
      "date": "2024-02-15T00:00:00.000Z",
      "status": "In Progress"
    }
  ],
  "marketplaces": {
    "amazonIN": "https://amazon.in/book-link",
    "amazonCOM": "https://amazon.com/book-link",
    "flipkart": "https://flipkart.com/book-link",
    "bookkish": "https://bookkish.com/book-link"
  }
}
```

### Admin Routes
#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

#### Get All Books (Admin)
```http
GET /api/admin/books
Authorization: Bearer <admin_token>
```

#### Manage KYC Approvals
```http
GET /api/admin/kyc/pending
POST /api/admin/kyc/approve/:userId
Authorization: Bearer <admin_token>
```

#### Update Any User
```http
PUT /api/admin/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "bankAccount": {
    "accountNumber": "987654321",
    "ifscCode": "XYZ0987654",
    "bankName": "Global Bank"
  },
  "kycStatus": "approved",
  "authorStats": {
    "averageRating": 4.7
  }
}
```

**Admin Capabilities:**
- Update any user's profile information
- Modify bank account details
- Adjust author statistics
- Update KYC status
- Change user roles (author/admin)
- Manage badges and achievements

### Print Log Management
#### Create Print Log
```http
POST /api/print-logs
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "65c0a4e8a3b7f8b1d8f3d7a1",
  "printDate": "2024-02-15",
  "quantity": 1000,
  "pressName": "City Press",
  "cost": 5000,
  "edition": "First Edition"
}
```

#### Get All Print Logs
```http
GET /api/print-logs
Authorization: Bearer <token>
```

#### Get Single Print Log
```http
GET /api/print-logs/:id
Authorization: Bearer <token>
```

#### Update Print Log
```http
PUT /api/print-logs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 1500,
  "cost": 7500
}
```

#### Delete Print Log
```http
DELETE /api/print-logs/:id
Authorization: Bearer <token>
```

### Royalty Management
#### Request Payout
```http
POST /api/royalties/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "paymentMethod": "bank_transfer"
}
```

#### Get Payout History
```http
GET /api/royalties
Authorization: Bearer <token>
```

#### Process Payout (Admin)
```http
POST /api/royalties/process-payout/:id
Authorization: Bearer <admin_token>
```

#### Get All Payouts (Admin)
```http
GET /api/royalties/all
Authorization: Bearer <admin_token>
```

### Notifications
#### Get Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "65c0a4e8a3b7f8b1d8f3d7a1",
    "message": "Your payout of ₹5000 via bank_transfer has been processed",
    "type": "payout",
    "read": false,
    "createdAt": "2024-02-13T12:34:56.789Z"
  }
]
```

#### Send Admin Notification (Admin Only)
```http
POST /api/notifications/admin
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "authorId": "user_id_here",
  "message": "Important system update"
}
```

#### Mark Notification as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

### Order Management
#### Place Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "book_id",
  "quantity": 5,
  "paymentMethod": "wallet"
}
```

#### Payment Verification (Razorpay)
```http
PUT /api/orders/:id/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpayPaymentId": "pay_123",
  "razorpayOrderId": "order_123",
  "razorpaySignature": "signature_123"
}
```

#### Get My Orders
```http
GET /api/orders/my-orders
Authorization: Bearer <token>
```

#### Get All Orders (Admin)
```http
GET /api/orders/admin
Authorization: Bearer <admin_token>
```

#### Update Order Status (Admin)
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "Shipped"
}
```

#### Webhook
```http
POST /api/orders/razorpay-webhook
Content-Type: application/json
X-Razorpay-Signature: <signature>

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_123",
        "order_id": "order_123"
      }
    }
  }
}
```

## Example Requests

### Get All Books (Author)
```bash
curl -X GET http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Book
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "New Book",
    "price": 29.99,
    "stock": 100,
    "category": "Fiction",
    "isbn": "978-3-16-148410-0"
  }'
```

## Response Formats
### Success
```json
{
  "data": {}
}
```

### Error
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Postman Collection
Import the included `postman_collection.json` for pre-configured requests with examples.

## Rate Limits
- Authentication: 100 requests/15 minutes
- API Endpoints: 200 requests/15 minutes
- OTP Requests: 5 requests/hour

## Notes
- All timestamps in ISO 8601 format
- Prices in USD
- ISBN must be valid and unique
- Phone numbers in E.164 format (+[country code][number])

## Complete Route List

### Authentication
| Method | Endpoint                | Description                     | Auth Required |
|--------|-------------------------|---------------------------------|---------------|
| POST   | /api/auth/register      | Register new user               | No            |
| POST   | /api/auth/login         | Login with email/password       | No            |
| POST   | /api/auth/google-login | Login with Google               | No            |
| POST   | /api/auth/forgot-password| Initiate password reset        | No            |
| POST   | /api/auth/reset-password| Complete password reset        | No            |
| GET    | /api/auth/profile       | Get user profile                | Yes           |
| PUT    | /api/auth/profile       | Update profile                  | Yes           |

### Books
| Method | Endpoint                | Description                     | Auth Required |
|--------|-------------------------|---------------------------------|---------------|
| POST   | /api/books              | Create new book                 | Yes           |
| GET    | /api/books              | Get author's books              | Yes           |
| GET    | /api/books/dashboard    | Get dashboard stats             | Yes           |
| GET    | /api/books/:id          | Get book by ID                  | Yes           |
| PUT    | /api/books/:id          | Update book                     | Yes           |
| DELETE | /api/books/:id          | Delete book                     | Yes           |
| PUT    | /api/books/:id/cover    | Update book cover image         | Yes           |

### Print Logs
| Method | Endpoint                | Description                     | Auth Required |
|--------|-------------------------|---------------------------------|---------------|
| POST   | /api/print-logs         | Create print log                | Yes           |
| GET    | /api/print-logs         | Get all print logs              | Yes           |
| GET    | /api/print-logs/:id     | Get single print log            | Yes           |
| PUT    | /api/print-logs/:id     | Update print log                | Yes           |
| DELETE | /api/print-logs/:id     | Delete print log                | Yes           |

### Admin
| Method | Endpoint                | Description                     | Auth Required | Admin Only |
|--------|-------------------------|---------------------------------|---------------|------------|
| GET    | /api/admin/users        | Get all users                   | Yes           | Yes        |
| PUT    | /api/admin/users/:id    | Update any user                 | Yes           | Yes        |
| DELETE | /api/admin/users/:id    | Delete user                     | Yes           | Yes        |
| GET    | /api/admin/books        | Get all books                   | Yes           | Yes        |
| PUT    | /api/admin/books/:id    | Update any book                 | Yes           | Yes        |
| DELETE | /api/admin/books/:id    | Delete any book                 | Yes           | Yes        |
| GET    | /api/admin/kyc/pending  | Get pending KYCs               | Yes           | Yes        |
| POST   | /api/admin/kyc/approve/:userId | Approve KYC            | Yes           | Yes        |

### Notifications
| Method | Endpoint                     | Description                     | Auth Required | Admin Only |
|--------|------------------------------|---------------------------------|---------------|------------|
| POST   | /api/notifications/admin     | Send admin notification         | Yes           | Yes        |
| GET    | /api/notifications           | Get user notifications          | Yes           | No         |
| PUT    | /api/notifications/:id/read | Mark notification as read       | Yes           | No         |

### Orders
| Method | Endpoint                | Description                     | Auth Required | Admin Only |
|--------|-------------------------|---------------------------------|---------------|------------|
| POST   | /api/orders             | Place author copy order         | Yes           | No         |
| GET    | /api/orders/my-orders  | Get author's orders             | Yes           | No         |
| GET    | /api/orders/admin       | Get all orders (admin)          | Yes           | Yes        |
| PUT    | /api/orders/:id/status | Update order status             | Yes           | Yes        |
| POST   | /api/orders             | Create order with payment       | Yes           | No         |
| PUT    | /api/orders/:id/verify | Verify Razorpay payment         | Yes           | No         |
| POST   | /api/orders/webhook     | Razorpay payment webhook        | No            | No         |

### Email Automation
The system automatically sends emails for these events:

| Event                  | Recipient    | Trigger Point                 |
|------------------------|--------------|-------------------------------|
| Author Welcome         | New Author   | Account creation              |
| Printing Timeline      | Author       | Each production stage update  |
| Royalty Payout         | Author       | Payment processed             |
| Weekly Sales Report    | Author       | Every Monday 9AM              |
| Newsletter             | Subscribers  | New book release              |
