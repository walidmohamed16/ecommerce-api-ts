# 🛒 E-Commerce API (TypeScript)

A full-featured RESTful E-Commerce API built with TypeScript, Node.js, Express, and MongoDB.

## 🚀 Features

- **TypeScript** - Full type safety and better developer experience
- **Authentication** - Register, Login with JWT tokens
- **Role-Based Access** - User and Admin roles
- **Product Management** - CRUD with search, filter, sort, and pagination
- **Shopping Cart** - Add, update, remove items with stock validation
- **Order System** - Create orders with stock management and status flow
- **Review System** - Rate and review products with auto rating calculation
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Request data validation with Joi
- **Error Handling** - Centralized error handling

## 🛠️ Tech Stack

| Technology | Usage |
|-----------|-------|
| TypeScript | Programming Language |
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt.js | Password Hashing |
| Joi | Validation |
| Helmet | Security Headers |
| express-rate-limit | Rate Limiting |

## 📋 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/me` | Update profile | Private |

### 📦 Products

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/:id` | Get single product | Public |
| GET | `/api/products/category/:category` | Get by category | Public |
| GET | `/api/products/seller/me` | Get my products | Private |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

**Query Parameters:**
?search=keyword Search by name/description
?category=electronics Filter by category
?minPrice=100 Min price filter
?maxPrice=1000 Max price filter
?inStock=true Only in-stock products
?sort=price_asc Sort (price_asc, price_desc, rating, newest)
?page=1&limit=10 Pagination



### 🛒 Cart
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/cart` | Get my cart | Private |
| POST | `/api/cart/add` | Add item to cart | Private |
| PUT | `/api/cart/update/:productId` | Update item quantity | Private |
| DELETE | `/api/cart/remove/:productId` | Remove item | Private |
| DELETE | `/api/cart/clear` | Clear cart | Private |

### 📋 Orders

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/orders` | Create order from cart | Private |
| GET | `/api/orders/me` | Get my orders | Private |
| GET | `/api/orders/:id` | Get single order | Private |
| PUT | `/api/orders/:id/cancel` | Cancel order | Private |
| GET | `/api/orders` | Get all orders | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |

**Order Status Flow:**
processing → shipped → delivered
↓ ↓
cancelled cancelled


### ⭐ Reviews

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/reviews` | Create review | Private |
| GET | `/api/reviews/product/:productId` | Get product reviews | Public |
| GET | `/api/reviews/me` | Get my reviews | Private |
| PUT | `/api/reviews/:id` | Update review | Private |
| DELETE | `/api/reviews/:id` | Delete review | Private |

## ⚙️ Installation

### Prerequisites

- Node.js (v16+)
- MongoDB
- Git

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/walidmohamed16/ecommerce-api-ts.git
cd ecommerce-api-ts
```
2. Install dependencies
```bash
npm install
```
3. Set up environment variables

Create a .env file in the root directory

4. Run the server
```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```
The server will start on http://localhost:5000

📊 Database Models

```text
User
 ├── name, email, password, role
 └── address (street, city, country)

Product
 ├── name, description, price
 ├── category, stock, images
 ├── seller (User ref)
 └── ratings, numReviews

Cart
 ├── user (User ref)
 ├── items [{product, quantity, price}]
 └── totalPrice

Order
 ├── user (User ref)
 ├── items [{product, quantity, price}]
 ├── totalPrice, shippingAddress
 ├── paymentStatus (pending/paid/failed)
 └── orderStatus (processing/shipped/delivered/cancelled)

Review
 ├── user (User ref)
 ├── product (Product ref)
 ├── order (Order ref)
 └── rating (1-5), comment
```
📁 Project Structure
```text
ecommerce-api-ts/
├── src/
│   ├── config/
│   │   └── db.ts
│   ├── types/
│   │   └── index.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Cart.ts
│   │   ├── Order.ts
│   │   └── Review.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── cartController.ts
│   │   ├── orderController.ts
│   │   └── reviewController.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts
│   │   ├── cartRoutes.ts
│   │   ├── orderRoutes.ts
│   │   └── reviewRoutes.ts
│   ├── middlewares/
│   │   ├── auth.ts
│   │   ├── authorize.ts
│   │   ├── errorHandler.ts
│   │   ├── validate.ts
│   │   └── rateLimiter.ts
│   ├── utils/
│   │   └── apiError.ts
│   ├── validations/
│   │   ├── authValidation.ts
│   │   ├── productValidation.ts
│   │   ├── cartValidation.ts
│   │   ├── orderValidation.ts
│   │   └── reviewValidation.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

🔒 Security Features


✅ TypeScript Type Safety

✅ JWT Authentication

✅ Password Hashing (bcrypt)

✅ Rate Limiting (100 req/15min)

✅ Auth Rate Limiting (10 req/15min)

✅ Helmet Security Headers

✅ CORS Configuration

✅ Input Validation (Joi)

✅ Role-Based Authorization


🔄 Stock Management

Event	                 Stock

Add to Cart	           No change

Create Order	          Decreases ⬇️

Cancel Order	           Restores ⬆️


👨‍💻 Author

walidmohamed16 - GitHub
