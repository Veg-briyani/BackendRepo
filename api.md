Here’s a structured `API.md` file based on your specifications:

```markdown
# Cursor API v1 Documentation

API for managing authors, books, royalties, payments, and administrative tasks.  
**Base URL**: `http://localhost:5000` (configurable via `{{base_url}}`).

---

## **Table of Contents**
- [Base Configuration](#base-configuration)
- [Authentication](#authentication)
- [Profile Management](#profile-management)
- [Books Management](#books-management)
- [Admin Routes](#admin-routes)
- [Print Logs](#print-logs)
- [Royalty Payouts](#royalty-payouts)
- [Notifications](#notifications)
- [Order Payments](#order-payments)
- [Email Testing](#email-testing)

---

## **Base Configuration**
| Variable         | Description                          | Example Value                   |
|------------------|--------------------------------------|---------------------------------|
| `{{base_url}}`   | Root URL of the API                  | `http://localhost:5000`         |
| `{{auth_token}}` | User authentication token (JWT)      | Obtained via `/api/auth/login`  |
| `{{admin_token}}`| Admin authentication token (JWT)     | Pre-configured                  |
| `{{sendgrid_key}}`| SendGrid API key for emails         | `SG.xxx`                        |
| `{{email_from}}` | Default sender email for notifications | `notifications@yourapp.com`   |

---

## **Authentication**

### **Register User**
**POST** `{{base_url}}/api/auth/register`  
**Headers**:  
- `Content-Type: application/json`  

**Request Body**:
```json
{
  "name": "Test Author",
  "email": "testing1@example.com",
  "password": "password123"
}
```

### **Login**
**POST** `{{base_url}}/api/auth/login`  
**Headers**:  
- `Content-Type: application/json`  

**Request Body**:
```json
{
  "email": "testing1@example.com",
  "password": "password123"
}
```

### **Create Book**
**POST** `{{base_url}}/api/books`  
**Headers**:  
- `Content-Type: application/json`  

**Request Body**:
```json
{
  "title": "New Book",
  "price": 29.99,
  "isbn": "978-0123456789"
}
```

## **Profile Management**

## **Books Management**

## **Admin Routes**

## **Print Logs**

## **Royalty Payouts**

## **Notifications**

## **Order Payments**

## **Email Testing**
