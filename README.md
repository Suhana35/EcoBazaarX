# EcoBazar - Eco-Friendly E-Commerce Platform

**EcoBazar** is a comprehensive eco-friendly e-commerce platform designed to promote sustainable shopping practices. The platform connects eco-conscious consumers with sustainable product sellers while providing detailed carbon footprint tracking and environmental impact metrics.

### Problem Statement
Traditional e-commerce platforms lack transparency regarding the environmental impact of products. EcoBazar bridges this gap by providing detailed sustainability metrics, eco-scores, and carbon footprint tracking for every product and order.

### Who Can Use It
- **Consumers** - Browse and purchase eco-friendly products while tracking their environmental impact
- **Sellers** - List sustainable products and manage inventory with carbon emission tracking
- **Administrators** - Monitor platform health, manage users, and analyze overall carbon footprint data

### Key Features
- 🌱 **Eco-Score System** - Products rated on environmental friendliness (0-5 scale)
- 📊 **Carbon Footprint Tracking** - Material and shipping CO2 emissions per product
- 🛒 **Smart Shopping Cart** - Persistent cart with guest and authenticated modes
- 📦 **Order Management** - Complete order lifecycle with tracking and status updates
- 👥 **Multi-role System** - Consumer, Seller, and Admin dashboards
- 📈 **Advanced Analytics** - Carbon emission analysis, product filtering, statistics
- 🔐 **JWT Authentication** - Secure token-based authentication (24-hour expiration)
- 📱 **Responsive Design** - Mobile-friendly interface using Tailwind CSS
- 🔍 **Smart Search & Filtering** - Filter by price, eco-score, product type, seller
- 📦 **Inventory Management** - Track stock levels, low-stock alerts

---

## 🛠 Tech Stack

### Frontend Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.1.1 | UI Framework with functional components |
| **React Router DOM** | 7.8.2 | Client-side routing and navigation |
| **Axios** | 1.11.0 | HTTP client with JWT interceptor |
| **Tailwind CSS** | 4.1.12 | Utility-first CSS framework |
| **Recharts** | 3.2.0 | Data visualization & charts |
| **React Icons** | 5.5.0 | Icon library (FontAwesome, Feather, etc.) |
| **Vite** | 7.1.2 | Build tool with HMR dev server |

### Backend Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Spring Boot** | 3.5.5 | REST API framework |
| **Spring Security** | Latest | Authentication & role-based access control |
| **Spring Data JPA** | Latest | Database ORM with Hibernate |
| **JJWT (JWT)** | 0.11.5 | JWT token generation & validation |
| **MySQL** | 8.0 | Relational database |
| **Maven** | Latest | Build and dependency management |
| **Java** | 17 | Programming language |

### Database
- **MySQL 8.0** - Relational database
- **Hibernate ORM** - Auto schema generation via JPA
- **Database Name** - `ecobazarx`

### Development Tools & Platforms
- **VS Code** - Code editor
- **Postman** - API testing and documentation
- **Git** - Version control
- **Maven** - Backend build tool
- **npm** - Frontend package manager

---

## 🏗 System Architecture

### High-Level Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                  CLIENT SIDE (React + Vite)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Consumer/Seller/Admin Components                      │  │
│  │  (React Router Navigation)                             │  │
│  │  - Home | Products | Cart | Orders | Dashboards        │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Global Context API (State Management)                 │  │
│  │  - currentUser, products, cartItems, orders            │  │
│  │  - API methods: loginUser, addProduct, checkout...     │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Axios HTTP Client with JWT Interceptor                │  │
│  │  (Automatically adds Authorization header)             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                          ↓ HTTPS
                    http://localhost:8080/api
                          ↓
┌──────────────────────────────────────────────────────────────┐
│              SERVER SIDE (Spring Boot + MySQL)               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  REST Controllers (7 Controllers)                      │  │
│  │  AuthController | ProductController | CartController   │  │
│  │  OrderController | HealthController                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Spring Security Filter Chain & JWT Validation         │  │
│  │  (JwtTokenFilter validates every request)              │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Service Layer (Business Logic & Calculations)         │  │
│  │  ProductService | CartService | OrderService           │  │
│  │  UserDetailsServiceImpl | AnalyticsService             │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Repository Layer (Spring Data JPA)                    │  │
│  │  UserRepository | ProductRepository | OrderRepository  │  │
│  │  CartRepository                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Entity Layer (JPA Models)                             │  │
│  │  User | Product | Order | OrderItem | Cart             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                          ↓ JDBC
┌──────────────────────────────────────────────────────────────┐
│         MYSQL DATABASE (Port: 3306)                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  users | products | orders | order_items | cart        │  │
│  │  cart_items                                            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Frontend & Backend Data Flow

1. **User Authentication**
   - User submits login → `POST /api/auth/signin` → Backend validates credentials
   - JWT token returned → Frontend stores in `localStorage.jwtToken`
   - Axios interceptor adds token to all subsequent requests

2. **JWT Token Lifecycle**
   - Generated on login with user ID and role
   - Expires in 24 hours (86400000 ms)
   - Stored client-side in localStorage
   - Sent in header: `Authorization: Bearer {token}`
   - Validated by Spring Security on every request

3. **Shopping Flow**
   - Browse products → `GET /api/products` (all, filtered, or searched)
   - Add to cart → `POST /api/cart/add` → Cart persisted in database
   - View cart → `GET /api/cart`
   - Checkout → `POST /api/orders` → Order created with order items
   - Order confirmation → Tracking number generated

4. **State Management**
   - Global Context maintains: currentUser, products, cartItems, orders
   - Fetched from backend on initialization and on user actions
   - Guest cart stored in localStorage (if not authenticated)

5. **Role-Based Access**
   - Frontend routes protected by role checking in components
   - Backend endpoints protected by `@PreAuthorize` annotations
   - Invalid role attempts return 403 Forbidden

---

## 📦 Modules & Their Working

### 1. **Authentication Module** (/api/auth)
- **Purpose** - Secure user registration, login, session management, profile updates
- **Technologies** - Spring Security, JWT (JJWT), bcrypt password encoding, JPA
- **How It Works**
  - Users register with name, email, password, and role (CONSUMER/SELLER/ADMIN)
  - Password encrypted using bcrypt before database storage
  - Login validates credentials and generates JWT token (expires 24 hours)
  - Token includes email, user ID, and role claims
  - All authenticated endpoints verify token validity
  - Admin can activate/deactivate users and change roles

- **Key Functions/Endpoints**
  - `POST /api/auth/signin` - User login with credentials
  - `POST /api/auth/signup` - Register new user account
  - `GET /api/auth/me` - Get authenticated user details
  - `PUT /api/auth/profile` - Update user profile (name, email, password)
  - `GET /api/auth/admin/users` - Admin: Get all users
  - `PATCH /api/auth/admin/{id}/status` - Admin: Activate/deactivate user
  - `PATCH /api/auth/admin/{id}/role` - Admin: Change user role

### 2. **Product Module** (/api/products)
- **Purpose** - Manage eco-friendly product catalog with sustainability metrics
- **Technologies** - JPA, MySQL, validation annotations, BigDecimal for precision
- **How It Works**
  - Products stored with eco-score (0-5), material CO2, shipping CO2, stock quantity
  - Sellers CRUD only their own products (protected by seller ID verification)
  - Products filterable by category, price range, eco-score range
  - Stock automatically decremented on order creation
  - Search functionality across product names and types
  - Top eco-friendly products ranked by eco-score

- **Key Functions/Endpoints**
  - `GET /api/products` - Get all products (public)
  - `GET /api/products/paginated` - Get paginated products (10 items/page)
  - `GET /api/products/{id}` - Get single product details
  - `GET /api/products/seller/{sellerId}` - Get seller's products (SELLER/ADMIN)
  - `GET /api/products/search` - Search by product name
  - `GET /api/products/type/{type}` - Filter by product type
  - `GET /api/products/price-range` - Filter by min/max price
  - `GET /api/products/eco-range` - Filter by eco-score range
  - `GET /api/products/top-eco` - Top 10 eco-friendly products
  - `GET /api/products/types` - Get all available product types
  - `GET /api/products/low-stock` - Get products below threshold
  - `POST /api/products` - Create product (SELLER/ADMIN)
  - `PUT /api/products/{id}` - Update any product (ADMIN)
  - `PUT /api/products/seller/{id}` - Update own product (SELLER)
  - `PATCH /api/products/{id}/stock` - Update stock quantity
  - `PATCH /api/products/{id}/status` - Update product status (active/inactive)
  - `PATCH /api/products/{id}/rating` - Update product rating
  - `DELETE /api/products/{id}` - Delete product (ADMIN)
  - `DELETE /api/products/seller/{id}` - Delete own product (SELLER)

### 3. **Cart Module** (/api/cart)
- **Purpose** - Manage shopping cart for both authenticated and guest users
- **Technologies** - JPA, Hibernate relationships, localStorage (guest cart)
- **How It Works**
  - **Authenticated Users**: Cart stored in database with foreign key to user
  - **Guest Users**: Cart stored in localStorage as JSON array
  - Cart items include product reference, quantity, and auto-calculated prices
  - On authentication, guest cart can be merged with database cart
  - Cart persists across sessions (authenticated users)
  - Quantities validated against product stock

- **Key Functions/Endpoints**
  - `GET /api/cart` - Retrieve user's cart (CONSUMER)
  - `POST /api/cart/add` - Add item to cart with quantity (CONSUMER)
  - `PUT /api/cart/items/{cartItemId}` - Update item quantity (CONSUMER)
  - `DELETE /api/cart/items/{cartItemId}` - Remove item from cart (CONSUMER)
  - `DELETE /api/cart/clear` - Empty entire cart (CONSUMER)
  - `GET /api/cart/count` - Get total item count in cart (CONSUMER)

### 4. **Order Module** (/api/orders)
- **Purpose** - Handle order creation, status tracking, and order history
- **Technologies** - JPA relationships (User → Orders → OrderItems), enum OrderStatus
- **How It Works**
  - Orders created from cart items or direct product purchase
  - Auto-generates unique tracking numbers for each order
  - Sets estimated delivery to 7-10 days from order date
  - Calculates order totals and carbon footprint
  - Decrements product stock quantities
  - Order statuses: PROCESSING → SHIPPED → DELIVERED (or CANCELLED)
  - Sellers update status as they process orders
  - Consumers can only view and cancel orders

- **Key Functions/Endpoints**
  - `POST /api/orders` - Create order from cart (CONSUMER)
  - `POST /api/orders/product/{productId}` - Create direct product order (CONSUMER)
  - `GET /api/orders` - Get user's order history (CONSUMER)
  - `GET /api/orders/paginated` - Get paginated orders (CONSUMER)
  - `GET /api/orders/{orderId}` - Get specific order details (CONSUMER)
  - `GET /api/orders/tracking/{trackingNumber}` - Track by number (CONSUMER)
  - `GET /api/orders/seller` - Get seller's received orders (SELLER)
  - `GET /api/orders/all` - Get all orders (ADMIN only)
  - `GET /api/orders/status/{status}` - Filter by status (ADMIN)
  - `GET /api/orders/recent` - Get recent orders (last N days)
  - `GET /api/orders/stats` - Get user order statistics
  - `PATCH /api/orders/{orderId}/cancel` - Cancel pending order (CONSUMER)
  - `PATCH /api/orders/seller/{orderId}/status` - Update status (SELLER)
  - `PATCH /api/orders/{orderId}/status` - Update consumer-level status (CONSUMER)

### 5. **User Management Module** (Admin)
- **Purpose** - Administer users, roles, and account statuses
- **Technologies** - Spring Security, JPA queries, enum Status
- **How It Works**
  - Admins view all users with detailed information
  - Activate/deactivate accounts (Status: ACTIVE/INACTIVE)
  - Inactive users cannot login
  - Change user roles (CONSUMER → SELLER → ADMIN, etc.)
  - Monitor user activity and statistics
  - Automatic timestamp tracking (createdAt, updatedAt)

- **Key Functions/Endpoints**
  - `GET /api/auth/admin/users` - Get all users (ADMIN)
  - `PATCH /api/auth/admin/{id}/status` - Deactivate/activate user (ADMIN)
  - `PATCH /api/auth/admin/{id}/role` - Change user role (ADMIN)

### 6. **Analytics & Health Module**
- **Purpose** - System health check and analytics support
- **Technologies** - Custom analytics service, data aggregation
- **How It Works**
  - AnalyticsService calculates platform metrics (prepared for future use)
  - Health endpoint provides system status
  - Ready for carbon emissions reporting features

- **Key Functions/Endpoints**
  - `GET /api/health` - API health check status

---

## 💻 Frontend Details

### Framework & Architecture
- **React 19.1.1** - Functional components with hooks (useState, useEffect, useContext)
- **Vite 7.1.2** - Fast build tool with Hot Module Replacement (HMR)
- **React Router DOM 7.8.2** - Client-side routing with nested routes
- **Context API** - Global state management via GlobalContext

### Folder Structure
```
Frontend/
├── src/
│   ├── Admin/                              # Administrator dashboard
│   │   ├── AdminDashboard.jsx             # Main admin overview
│   │   ├── AdminNavbar.jsx                # Admin navigation menu
│   │   ├── UserManagement.jsx             # User CRUD interface
│   │   └── CarbonInsightDashboard.jsx    # Carbon analytics & reporting
│   │
│   ├── Consumer/                           # Customer-facing components
│   │   ├── Home.jsx                       # Product listing & browsing
│   │   ├── UserNavbar.jsx                 # Consumer navigation
│   │   ├── ProductCart.jsx                # Shopping cart page
│   │   ├── ProductDetails.jsx             # Single product details
│   │   ├── OrderHistory.jsx               # Order tracking & history
│   │   ├── CheckOut.jsx                   # Checkout process
│   │   └── Footer.jsx                     # Footer component
│   │
│   ├── Seller/                             # Seller dashboard
│   │   ├── SellerDashboard.jsx            # Seller overview & stats
│   │   ├── SellerNavbar.jsx               # Seller navigation
│   │   ├── ProductModel.jsx               # Add/edit product form modal
│   │   └── SellerOrders.jsx               # Orders received from customers
│   │
│   ├── context/                            # Global state management
│   │   └── GlobalContext.jsx              # State, auth, and API methods
│   │
│   ├── App.jsx                            # Main routing component
│   ├── App.css                            # Global styles
│   ├── Login.jsx                          # Login form page
│   ├── RegistrationForm.jsx               # Signup form page
│   ├── UserProfile.jsx                    # User profile management
│   ├── EditProfileModal.jsx               # Edit profile modal
│   ├── ErrorBoundary.jsx                  # Error handling component
│   ├── api.js                             # Axios instance configuration
│   ├── main.jsx                           # React DOM render entry
│   └── index.css                          # Global CSS
│
├── public/
│   └── vite.svg                          # Vite logo
│
├── package.json                           # Dependencies & npm scripts
├── vite.config.js                         # Vite build configuration
├── eslint.config.js                       # ESLint linting rules
├── index.html                             # HTML template
└── README.md                              # Project readme
```

### Important Components & Pages

| Component | Path | Purpose | Key Features |
|-----------|------|---------|--------------|
| **Home** | Consumer/Home.jsx | Product catalog | Browse, search, filter by price/eco-score |
| **ProductDetails** | Consumer/ProductDetails.jsx | Single product view | Full specs, seller info, carbon breakdown |
| **ProductCart** | Consumer/ProductCart.jsx | Shopping cart | Add/remove items, update quantities, total calc |
| **CheckOut** | Consumer/CheckOut.jsx | Payment & delivery | Order creation, address entry, confirmation |
| **OrderHistory** | Consumer/OrderHistory.jsx | Order tracking | View orders, status, tracking numbers, cancel |
| **SellerDashboard** | Seller/SellerDashboard.jsx | Seller overview | Sales stats, product performance, revenue |
| **ProductModel** | Seller/ProductModel.jsx | Add/edit products | Form for creating/updating products |
| **SellerOrders** | Seller/SellerOrders.jsx | Received orders | View customer orders, update status |
| **AdminDashboard** | Admin/AdminDashboard.jsx | Admin overview | Platform metrics, user count, order stats |
| **UserManagement** | Admin/UserManagement.jsx | User administration | View users, deactivate, change roles |
| **CarbonInsightDashboard** | Admin/CarbonInsightDashboard.jsx | Analytics | Carbon emissions, eco-friendly products |

### UI Libraries & Styling
- **Tailwind CSS 4.1.12** - Utility-first CSS framework for responsive design
- **React Icons 5.5.0** - Icon library (FaIcon, MdIcon, FiIcon, etc.)
- **Recharts 3.2.0** - React charting library (LineChart, BarChart, PieChart)

### State Management
- **React Context API** - `GlobalContext.jsx` provides:
  - `currentUser` - Authenticated user info
  - `products` - Products catalog
  - `cartItems` - Shopping cart items
  - `orders` - User's orders
  - API methods (loginUser, addProduct, createOrder, etc.)
  
- **localStorage** - Persistent storage for:
  - `jwtToken` - JWT authentication token
  - `guestCart` - Cart items for unauthenticated users

- **Component State** - useState for form data, loading states, UI states

### API Integration Details

**Axios Configuration** (api.js):
```javascript
// Base URL
const API = axios.create({
  baseURL: "http://localhost:8080/api"
});

// JWT Token Interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**API Calls in GlobalContext**:
- `loginUser(email, password)` → `POST /api/auth/signin`
- `registerUser(userData)` → `POST /api/auth/signup`
- `fetchProducts()` → `GET /api/products`
- `addToCart(productId, quantity)` → `POST /api/cart/add`
- `createOrder(items)` → `POST /api/orders`
- `fetchOrders()` → `GET /api/orders`
- `updateOrderStatus(orderId, status)` → `PATCH /api/orders/{id}/status`

### Screenshots / Demo Section
[Placeholder for screenshots - Add the following in implementation:]
- 📱 Home Page with Product Grid
- 🛒 Cart & Checkout Flow
- 👤 Consumer Order History & Tracking
- 📊 Seller Dashboard with Sales Analytics
- 👨‍💼 Admin User Management
- 📈 Carbon Insight Analytics Dashboard
- 🔐 Login & Registration Forms
- 👥 User Profile Management

---

## 🔧 Backend Details

### Framework & Architecture
- **Spring Boot 3.5.5** - RESTful API framework with embedded Tomcat
- **Architecture Pattern** - **Layered Architecture**
  - **Controller Layer** - REST endpoints (@RestController)
  - **Service Layer** - Business logic & validations
  - **Repository Layer** - Data access via JPA
  - **Entity Layer** - JPA models with relationships
  - **Security Layer** - JWT validation filters

### Main Controllers & Endpoints

| Controller | Base Path | Role Requirement | Purpose |
|-----------|-----------|------------------|---------|
| **AuthController** | `/api/auth` | Public (some ADMIN) | User authentication, registration, profile |
| **ProductController** | `/api/products` | Public (POST/PUT/DELETE: SELLER/ADMIN) | Product CRUD, search, filter |
| **CartController** | `/api/cart` | CONSUMER | Shopping cart management |
| **OrderController** | `/api/orders` | CONSUMER/SELLER/ADMIN | Order creation, tracking, status |
| **HealthController** | `/api` | Public | System health check |

### Business Logic Explanation

#### Authentication Flow (JWT-based)
1. User submits email & password to `POST /api/auth/signin`
2. `AuthController.authenticateUser()`:
   - Uses `AuthenticationManager` to validate credentials against bcrypt-encoded password
   - Checks if user account is ACTIVE (not INACTIVE/deactivated)
   - If valid, calls `JwtUtils.generateJwtToken(email, userId, role)`
   - JWT includes claims: email (username), user ID, role
   - Token expires in 24 hours (86400000 ms)
3. Frontend receives JWT, stores in `localStorage.jwtToken`
4. Subsequent requests include: `Authorization: Bearer {token}`
5. Spring Security filter validates token on each request

#### Product Management Flow
1. **Seller Creates Product** → `POST /api/products`
   - Service extracts `sellerId` from JWT token
   - Validates eco-score (0-5), CO2 values (≥ 0)
   - Sets created date and seller ID
   - Saves to database with initial status = "active"
   
2. **Browse Products** → `GET /api/products`
   - Service returns all active products (publicly accessible)
   - Returns ProductDto objects (mapped from Product entities)
   
3. **Seller Updates Own Product** → `PUT /api/products/seller/{id}`
   - Service verifies seller ID matches JWT token
   - Updates only that seller's products
   - Throws AccessDeniedException if seller is different
   
4. **Admin Updates Any Product** → `PUT /api/products/{id}`
   - Admin can modify any product regardless of seller
   
5. **Delete Product** → `DELETE /api/products/{id}` (SELLER) or `/seller/{id}` (SELLER)
   - Deletes only if no orders reference this product

#### Order Processing Flow
1. **Customer Checkout** → `POST /api/orders`
   - Request contains order items with productId, quantity
   - Service validates:
     - Stock available for each item
     - Product exists
     - User is authenticated
   
2. **Order Creation Process**:
   - Creates Order entity with status = PROCESSING
   - Creates OrderItem entities for each product
   - Calculates total amount (sum of item prices × quantity)
   - Calculates total eco-score (average of all items)
   - Calculates total CO2 footprint (sum of all items)
   - Generates unique tracking number
   - Sets estimated delivery (order date + 7-10 days)
   - Decrements product stock quantities
   
3. **Seller Updates Status** → `PATCH /api/orders/seller/{orderId}/status`
   - Seller can change status: PROCESSING → SHIPPED → DELIVERED
   - Service verifies seller owns the product(s) in order
   - Updates order and sets shipped_date/delivered_date
   
4. **Order Visibility**:
   - `GET /api/orders` (Consumer) - User's own orders only
   - `GET /api/orders/seller` (Seller) - Orders for seller's products
   - `GET /api/orders/all` (Admin) - All orders

#### Cart Management Flow
1. **Add to Cart** → `POST /api/cart/add`
   - Service gets/creates cart for user
   - Validates product exists and has stock
   - Adds CartItem or increments quantity if exists
   
2. **View Cart** → `GET /api/cart`
   - Service retrieves cart with all items
   - Calculates total items, total amount
   
3. **Update Cart** → `PUT /api/cart/items/{cartItemId}`
   - Updates quantity with validation
   - Recalculates cart totals
   
4. **Checkout** → `POST /api/orders` (converts cart to order)
   - Service creates order from cart items
   - Clears cart after successful order creation

### Security Implementation

**JWT Token Configuration**:
- Secret key: `mySecretKey123456789012345678901234567890`
- Expiration: 24 hours = 86400000 milliseconds
- Algorithm: HS256 (HMAC with SHA-256)
- Claims: email (username), userId, role

**Password Encoding**:
- Algorithm: bcrypt (Spring Security default)
- Passwords never stored in plain text
- Compared during authentication using `PasswordEncoder.matches()`

**Role-Based Access Control (RBAC)**:
- Roles: CONSUMER, SELLER, ADMIN
- Protected with `@PreAuthorize` annotations:
  ```java
  @PreAuthorize("hasRole('ADMIN')")  // Only ADMIN can access
  @PreAuthorize("hasRole('SELLER')")  // Only SELLER can access
  @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")  // ADMIN or SELLER
  @PreAuthorize("isAuthenticated()")  // Any authenticated user
  ```

**Input Validation**:
- `@Valid` annotation on request DTOs
- Constraint annotations:
  - `@NotBlank` - Required string fields
  - `@Email` - Valid email format
  - `@DecimalMin/@DecimalMax` - Numeric ranges
  - `@Size` - String length limits
  - `@Min/@Max` - Integer ranges

**CORS Configuration**:
```java
@CrossOrigin(origins = "*", maxAge = 3600)
```
- Allows requests from any origin (front-end domain)
- CORS headers cached for 1 hour

**Exception Handling**:
- `GlobalExceptionHandler` class catches and formats errors
- Custom exceptions:
  - `ResourceNotFoundException` - 404 when entity not found
  - `AccessDeniedException` - 403 when user lacks permissions
  - `InsufficientStockException` - When product stock is low
  - Validation exceptions - 400 Bad Request

### Middlewares & Security Filters

1. **JwtTokenFilter** (Custom Spring Security Filter):
   - Extracts JWT from Authorization header
   - Validates token signature and expiration
   - Sets SecurityContext with user details
   - Allows request to proceed if valid

2. **Spring Security Filter Chain**:
   - Processes every HTTP request
   - Validates authentication and authorization
   - Handles CORS preflight requests

3. **Exception Handler** (@ControllerAdvice):
   - Catches all exceptions
   - Returns formatted error responses
   - Maps exceptions to appropriate HTTP status codes

---

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication
All endpoints except `/auth/signin`, `/auth/signup`, and `GET /products` require JWT token:
```
Authorization: Bearer {jwt_token}
```

### Response Format
All responses are JSON with standard structure:
```json
{
  "success": true/false,
  "message": "description",
  "data": { /* response data */ }
}
```

---

## 🔑 Key API Endpoints & Examples

### 1. Authentication Endpoints

#### Login
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "CONSUMER"
}
```

#### Register
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secure123",
  "role": "CONSUMER",
  "agreeToTerms": true,
  "subscribeNewsletter": true
}

Response (200 OK):
{
  "message": "User registered successfully!"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response (200 OK):
{
  "token": "",
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "CONSUMER"
}
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "email": "newemail@example.com",
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}

Response (200 OK):
{
  "token": "new_token_if_email_changed",
  "id": 1,
  "name": "John Updated",
  "email": "newemail@example.com",
  "role": "CONSUMER"
}
```

### 2. Product Endpoints

#### Get All Products
```http
GET /api/products

Response (200 OK):
[
  {
    "id": 1,
    "name": "Solar Powered Laptop",
    "type": "Electronics",
    "price": 45999.00,
    "ecoScore": 4.5,
    "footprint": 20.0,
    "materialCO2": 15.0,
    "shippingCO2": 5.0,
    "image": "https://...",
    "stockQuantity": 50,
    "sellerId": 2,
    "sellerName": "EcoTech Store",
    "description": "High-performance solar laptop...",
    "status": "active"
  }
  ...
]
```

#### Get Paginated Products
```http
GET /api/products/paginated?page=0&size=10

Response (200 OK):
{
  "content": [ /* products array */ ],
  "totalElements": 100,
  "totalPages": 10,
  "currentPage": 0
}
```

#### Search Products
```http
GET /api/products/search?q=solar

Response (200 OK):
[ /* filtered products */ ]
```

#### Filter by Price
```http
GET /api/products/price-range?minPrice=1000&maxPrice=50000

Response (200 OK):
[ /* products in price range */ ]
```

#### Filter by Eco Score
```http
GET /api/products/eco-range?minScore=4.0&maxScore=5.0

Response (200 OK):
[ /* eco-friendly products */ ]
```

#### Create Product (Seller)
```http
POST /api/products
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "name": "Bamboo Plate Set",
  "type": "Kitchen",
  "price": 1299.00,
  "ecoScore": 4.8,
  "footprint": 2.0,
  "materialCO2": 1.3,
  "shippingCO2": 0.7,
  "image": "https://...",
  "stockQuantity": 100,
  "description": "Durable bamboo dinnerware set"
}

Response (201 Created):
{
  "id": 5,
  "name": "Bamboo Plate Set",
  "sellerId": 2,
  ...
}
```

#### Update Product Stock
```http
PATCH /api/products/{id}/stock?stock=75

Response (200 OK):
{
  "id": 1,
  "stockQuantity": 75,
  ...
}
```

### 3. Cart Endpoints

#### Get Cart
```http
GET /api/cart
Authorization: Bearer {token}

Response (200 OK):
{
  "id": 1,
  "userId": 3,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Solar Laptop",
      "quantity": 1,
      "price": 45999.00,
      "totalPrice": 45999.00
    }
  ],
  "totalItems": 1,
  "totalAmount": 45999.00
}
```

#### Add to Cart
```http
POST /api/cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}

Response (200 OK):
{
  "id": 1,
  "items": [ /* updated items */ ],
  "totalItems": 2,
  "totalAmount": 91998.00
}
```

#### Update Cart Item
```http
PUT /api/cart/items/{cartItemId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}

Response (200 OK):
{
  "id": 1,
  "items": [ /* updated items */ ],
  "totalAmount": 137997.00
}
```

#### Remove Item
```http
DELETE /api/cart/items/{cartItemId}
Authorization: Bearer {token}

Response (200 OK):
{
  "id": 1,
  "items": [ /* remaining items */ ],
  "totalAmount": 91998.00
}
```

### 4. Order Endpoints

#### Create Order from Cart
```http
POST /api/orders
Authorization: Bearer {consumer_token}
Content-Type: application/json

{
  "shippingAddress": "123 Main Street, City, State 12345",
  "paymentMethod": "CREDIT_CARD"
}

Response (201 Created):
{
  "id": 1,
  "userId": 3,
  "totalAmount": 91998.00,
  "status": "PROCESSING",
  "trackingNumber": "TRK20231227123456",
  "estimatedDelivery": "2025-01-07T10:30:00",
  "orderDate": "2025-12-27T10:30:00",
  "totalEcoScore": 4.5,
  "totalCO2Footprint": 40.0,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Solar Laptop",
      "quantity": 2,
      "price": 45999.00
    }
  ]
}
```

#### Get Order History
```http
GET /api/orders
Authorization: Bearer {consumer_token}

Response (200 OK):
[
  {
    "id": 1,
    "totalAmount": 91998.00,
    "status": "SHIPPED",
    "trackingNumber": "TRK20231227123456",
    "orderDate": "2025-12-27T10:30:00",
    "items": [ /* items */ ]
  }
  ...
]
```

#### Get Order by Tracking Number
```http
GET /api/orders/tracking/TRK20231227123456
Authorization: Bearer {token}

Response (200 OK):
{
  "id": 1,
  "trackingNumber": "TRK20231227123456",
  "status": "SHIPPED",
  "shippedDate": "2025-12-28T14:20:00",
  "estimatedDelivery": "2025-01-07T10:30:00",
  ...
}
```

#### Seller Updates Order Status
```http
PATCH /api/orders/seller/{orderId}/status?status=SHIPPED
Authorization: Bearer {seller_token}

Response (200 OK):
{
  "id": 1,
  "status": "SHIPPED",
  "shippedDate": "2025-12-28T14:20:00",
  ...
}
```

#### Cancel Order
```http
PATCH /api/orders/{orderId}/cancel
Authorization: Bearer {consumer_token}

Response (200 OK):
{
  "id": 1,
  "status": "CANCELLED",
  ...
}
```

### 5. Admin Endpoints

#### Get All Users
```http
GET /api/auth/admin/users
Authorization: Bearer {admin_token}

Response (200 OK):
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CONSUMER",
    "status": "ACTIVE",
    "createdAt": "2025-12-01T10:00:00"
  }
  ...
]
```

#### Deactivate User
```http
PATCH /api/auth/admin/{userId}/status?status=INACTIVE
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "success": true,
  "message": "User status changed",
  "data": { /* updated user */ }
}
```

#### Change User Role
```http
PATCH /api/auth/admin/{userId}/role?role=SELLER
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "success": true,
  "message": "User role changed",
  "data": { /* updated user with new role */ }
}
```

### 6. Health Check
```http
GET /api/health

Response (200 OK):
{
  "status": "UP",
  "timestamp": "2025-12-27T10:30:00.123456",
  "service": "EcoMarket API",
  "version": "1.0.0"
}
```

---

## 🗄 Database

### Database Used
- **MySQL 8.0** with auto-schema generation via Hibernate
- **Dialect** - MySQL8Dialect for MySQL 8.0+ compatibility
- **Connection** - `jdbc:mysql://localhost:3306/ecobazarx`
- **DDL Auto** - `update` (creates/alters tables automatically)

### Tables & Schema

#### 1. **users** Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(120) NOT NULL,
  role ENUM('CONSUMER', 'SELLER', 'ADMIN') DEFAULT 'CONSUMER',
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  agree_to_terms BOOLEAN DEFAULT FALSE,
  subscribe_newsletter BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. **products** Table
```sql
CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  eco_score DECIMAL(3, 1),
  footprint DECIMAL(8, 2),
  material_co2 DECIMAL(8, 2),
  shipping_co2 DECIMAL(8, 2),
  image LONGTEXT,
  description LONGTEXT,
  stock_quantity INT DEFAULT 0,
  seller_id BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  rating INT DEFAULT 0,
  sales INT DEFAULT 0,
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id),
  INDEX idx_seller_id (seller_id),
  INDEX idx_type (type),
  INDEX idx_eco_score (eco_score)
);
```

#### 3. **orders** Table
```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PROCESSING',
  tracking_number VARCHAR(50) UNIQUE,
  estimated_delivery TIMESTAMP,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  shipped_date TIMESTAMP,
  delivered_date TIMESTAMP,
  total_eco_score DECIMAL(3, 1),
  total_co2_footprint DECIMAL(8, 2),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_order_date (order_date)
);
```

#### 4. **order_items** Table
```sql
CREATE TABLE order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  eco_score DECIMAL(3, 1),
  material_co2 DECIMAL(8, 2),
  shipping_co2 DECIMAL(8, 2),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
);
```

#### 5. **cart** Table
```sql
CREATE TABLE cart (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 6. **cart_items** Table
```sql
CREATE TABLE cart_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  cart_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_cart_id (cart_id),
  INDEX idx_product_id (product_id)
);
```

### Database Relationships

| Relation | Tables | Type | Cascade | Description |
|----------|--------|------|---------|-------------|
| User → Products | users ↔ products | 1:N | No | One seller has many products |
| User → Orders | users ↔ orders | 1:N | No | One user places many orders |
| User → Cart | users ↔ cart | 1:1 | Delete | One user has one cart |
| Cart → CartItems | cart ↔ cart_items | 1:N | Delete | One cart has many items |
| CartItem → Product | cart_items ↔ products | N:1 | No | Items reference products |
| Order → OrderItems | orders ↔ order_items | 1:N | Delete | One order has many items |
| OrderItem → Product | order_items ↔ products | N:1 | No | Items reference products |

### Entity Relationships Diagram
```
┌─────────┐         ┌──────────┐         ┌──────────────┐
│  users  │────────▶│ products │         │ orders       │
├─────────┤  1:N    └──────────┘     ┌──▶├──────────────┤
│ id (PK) │                          │   │ id (PK)      │
│ email   │     ┌──────────────┐     │   │ user_id (FK) │
│ name    │     │ order_items  │     │   │ total_amount │
│ role    │     ├──────────────┤     │   │ status       │
│ status  │     │ id (PK)      │     │   │ tracking_no  │
└─────────┘     │ order_id(FK)─┼─────┘   │ order_date   │
       │        │ product_id──┼──────┐   └──────────────┘
       │        │ quantity     │      │          ▲
       │        │ price        │      │          │ 1:N
       │        └──────────────┘      │          │
       │                               │   ┌──────────────┐
       │        ┌──────────────┐      └──▶│ order_items  │
       └───────▶│ cart         │          └──────────────┘
          1:1   ├──────────────┤
                │ id (PK)      │
                │ user_id (FK) │
                └──────────────┘
                        ▲
                        │ 1:N
                        │
                ┌──────────────────┐
                │ cart_items       │
                ├──────────────────┤
                │ id (PK)          │
                │ cart_id (FK)     │
                │ product_id (FK)  │
                │ quantity         │
                └──────────────────┘
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Java 17 or higher** - Required for Spring Boot 3.5.5
- **Node.js 16+** and **npm 8+** - Required for React and Vite
- **MySQL 8.0** - Database server
- **Git** - Version control
- **IDE** - VS Code, IntelliJ IDEA, or similar (optional)

### Step 1: Database Setup

1. **Install MySQL 8.0**
   ```bash
   # macOS (using Homebrew)
   brew install mysql
   brew services start mysql
   
   # Windows - Download from https://dev.mysql.com/downloads/mysql/
   # Ubuntu/Linux
   sudo apt-get install mysql-server
   ```

2. **Create Database and User**
   ```bash
   # Login to MySQL
   mysql -u root -p
   ```
   
   ```sql
   -- Create database
   CREATE DATABASE ecobazarx;
   
   -- Create user and grant privileges
   CREATE USER 'root'@'localhost' IDENTIFIED BY 'root';
   GRANT ALL PRIVILEGES ON ecobazarx.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Verify Connection**
   ```bash
   mysql -u root -p root ecobazarx
   SHOW TABLES;  # Should be empty initially (will auto-create)
   EXIT;
   ```

### Step 2: Backend Setup

1. **Clone/Download Repository**
   ```bash
   cd backend
   ```

2. **Review Configuration** (src/main/resources/application.properties)
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/ecobazarx?createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=p@th@n
   spring.jpa.hibernate.ddl-auto=update
   spring.security.jwt.expiration=86400000
   ```
   Adjust if your MySQL credentials are different.

3. **Build Project**
   ```bash
   # Using Maven Wrapper (recommended - no Maven installation needed)
   ./mvnw clean install
   
   # OR using installed Maven
   mvn clean install
   ```

4. **Run Backend Server**
   ```bash
   # Using Maven
   ./mvnw spring-boot:run
   
   # OR using Java directly
   java -jar target/ecobazar-1.0.jar
   ```
   
   **Output should show:**
   ```
   Started EcobazarApplication in X.XXX seconds
   ```
   Server runs on **http://localhost:8080**

5. **Verify Backend** - Test health endpoint:
   ```bash
   curl http://localhost:8080/api/health
   
   # Response:
   {
     "status": "UP",
     "timestamp": "...",
     "service": "EcoMarket API",
     "version": "1.0.0"
   }
   ```

### Step 3: Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd Frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment** (Optional - api.js already has correct URL)
   - File: `src/api.js`
   - Verify: `baseURL: "http://localhost:8080/api"`

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   **Output should show:**
   ```
   VITE v7.1.2 ready in XXX ms
   
   ➜ Local:   http://localhost:5173/
   ➜ press h to show help
   ```

5. **Open in Browser**
   - Visit **http://localhost:5173**
   - Should see EcoBazar login page

6. **Build for Production** (optional)
   ```bash
   npm run build
   npm run preview
   ```

### Environment Variables Configuration

#### Backend (application.properties)
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/ecobazarx?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
spring.security.jwt.secret=mySecretKey123456789012345678901234567890
spring.security.jwt.expiration=86400000

# Server Configuration
server.port=8080
spring.application.name=ecobazar
```

#### Frontend (.env) - Optional
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=EcoBazar
```

### Troubleshooting

**Issue**: MySQL connection fails
```
Solution: Ensure MySQL is running
- macOS: brew services start mysql
- Windows: Start MySQL service from Services
- Linux: sudo systemctl start mysql
```

**Issue**: Port 8080 already in use
```
Solution: Change backend port in application.properties
spring.server.port=8081
```

**Issue**: Port 5173 already in use
```
Solution: Vite will automatically use next available port
Or specify: npm run dev -- --port 5174
```

**Issue**: "No JWT token found" error
```
Solution: Ensure you're logged in and token is stored
- Check localStorage in browser DevTools
- Token should be at key: "jwtToken"
```

---

## 🎯 Usage Guide

### For Consumers

#### 1. Registration & Login
- Click **"Sign Up"** on login page
- Enter: name, email, password, select **"CONSUMER"** role
- Check: agree to terms checkbox
- Click **Submit**
- Login with your credentials

#### 2. Browse Products
- Navigate to **Home** page
- View product grid with eco-scores
- Filter options:
  - By **price range** (min-max)
  - By **eco-score range** (0-5)
  - By **product type** (category)
  - **Search** by product name

#### 3. View Product Details
- Click any **product card**
- View:
  - Full product description
  - Seller information
  - Carbon footprint breakdown (material CO2 + shipping CO2)
  - Eco-score and rating
  - Available stock quantity
  - Customer reviews (if available)

#### 4. Shopping & Checkout
- Click **"Add to Cart"** on product
- Adjust **quantity** in cart
- View **total price** and **total items**
- Click **"Proceed to Checkout"**
- Enter **shipping address** (if required)
- Review **order summary**
- Click **"Place Order"**
- Receive **order confirmation** with tracking number

#### 5. Track Orders
- Navigate to **"Order History"**
- View all past and current orders
- Click order to see:
  - Items purchased
  - Tracking number
  - Order status (PROCESSING → SHIPPED → DELIVERED)
  - Estimated delivery date
  - Carbon footprint of order
  - Eco-score of products
- Click **"Track"** to view shipment location

#### 6. Manage Profile
- Click **profile icon** → **"My Profile"**
- View and edit:
  - Name and email
  - Password (with current password verification)
  - Account preferences
- Click **"Update Profile"** to save changes

### For Sellers

#### 1. Registration & Setup
- Sign up with **"SELLER"** role
- Complete seller profile
- Setup payment method (if needed)
- Verify email address

#### 2. Add Products
- Navigate to **Seller Dashboard**
- Click **"Add New Product"**
- Fill in form:
  - **Product Name** (required)
  - **Type/Category** (e.g., "Electronics", "Kitchen")
  - **Price** (in currency units)
  - **Eco-Score** (0-5, where 5 is most eco-friendly)
  - **Material CO2** (kg, emissions from manufacturing)
  - **Shipping CO2** (kg, emissions from delivery)
  - **Description** (product details)
  - **Stock Quantity** (available units)
  - **Product Image** (upload URL or file)
- Click **"Publish"** to list product

#### 3. Manage Inventory
- Dashboard shows all your products
- For each product:
  - View **stock quantity** and **sales**
  - Click **Edit** to modify details
  - Update **stock** directly
  - View **sales performance** (trending)
  - Deactivate product (set status to inactive)
  - Delete product (if no active orders)

#### 4. Process Orders
- Navigate to **"Received Orders"**
- View incoming customer orders:
  - Customer name
  - Ordered products and quantities
  - Order date and time
  - Total amount
  - Current status
- Update status progression:
  - **PROCESSING** → Click "Ship" → Status becomes SHIPPED
  - **SHIPPED** → Click "Deliver" → Status becomes DELIVERED
  - Can **cancel** if still processing

#### 5. Analytics & Dashboard
- **Dashboard shows:**
  - Total sales (revenue)
  - Number of products
  - Orders received
  - Average eco-score of products
  - Top-selling products
- View **sales trends** over time

### For Administrators

#### 1. Access Admin Panel
- Login with **ADMIN** role account
- Navigate to **Admin Dashboard**

#### 2. User Management
- Click **"User Management"**
- View all registered users with:
  - Name, email, role
  - Account status (ACTIVE/INACTIVE)
  - Registration date
  - User type
- Actions for each user:
  - **Deactivate** user (prevents login)
  - **Reactivate** user
  - **Change role** (CONSUMER ↔ SELLER ↔ ADMIN)
  - View user activity (if available)

#### 3. Monitor Orders
- Click **"Orders"**
- View all platform orders:
  - Filter by **status**
  - Filter by **date range**
  - Sort by **amount** or **recent**
- Can intervene if disputes arise

#### 4. Carbon Insights & Analytics
- Click **"Carbon Insights"**
- View platform-wide metrics:
  - **Total CO2 Emissions** (all products)
  - **Average Eco-Score** (across marketplace)
  - **High-Emission Products** (threshold alerts)
  - **Eco-Friendly Leaders** (top-rated)
  - **Emissions by Category** (breakdown)
  - **Total Orders Processed**
- Use data to:
  - Identify sellers to promote eco-friendly products
  - Flag high-emission sellers for education
  - Track platform's environmental impact over time

#### 5. Platform Management
- Monitor system **health**
- Check **database integrity**
- Generate **reports**
- Implement **policies** based on data

### Application Flow Diagram

```
START: User Visits http://localhost:5173
    │
    ├─ NOT LOGGED IN
    │    │
    │    ├─ Click "Sign Up" → Registration Form
    │    │    └─ Submit → Save to DB → Redirect to Login
    │    │
    │    └─ Click "Login" → Login Form
    │         │
    │         ├─ Valid Credentials
    │         │    └─ Generate JWT → Store in localStorage
    │         │         │
    │         │         ├─ Role = CONSUMER → Redirect to /home
    │         │         ├─ Role = SELLER → Redirect to /seller
    │         │         └─ Role = ADMIN → Redirect to /admin
    │         │
    │         └─ Invalid Credentials → Show Error
    │
    └─ LOGGED IN (JWT in localStorage)
         │
         ├─ CONSUMER ROLE
         │    │
         │    ├─ /home → Browse Products
         │    │    ├─ View all products
         │    │    ├─ Search/Filter
         │    │    └─ Click Product → /productInfo/{id}
         │    │
         │    ├─ /cart → Shopping Cart
         │    │    ├─ Add/Remove items
         │    │    ├─ Update quantities
         │    │    └─ Proceed to checkout
         │    │
         │    ├─ Checkout
         │    │    ├─ POST /api/orders → Create Order
         │    │    ├─ Order stored in DB
         │    │    ├─ Stock decremented
         │    │    └─ Show tracking number
         │    │
         │    └─ /orders → Order History
         │         ├─ GET /api/orders → List user's orders
         │         ├─ View order details
         │         └─ Track shipment status
         │
         ├─ SELLER ROLE
         │    │
         │    ├─ /selDashboard → Seller Overview
         │    │    ├─ View stats
         │    │    ├─ Sales trends
         │    │    └─ Product performance
         │    │
         │    ├─ Add Product Modal
         │    │    ├─ Fill product form
         │    │    ├─ POST /api/products → Save product
         │    │    └─ Product listed on marketplace
         │    │
         │    ├─ Manage Products
         │    │    ├─ Edit → PUT /api/products/seller/{id}
         │    │    ├─ Delete → DELETE /api/products/seller/{id}
         │    │    └─ Update stock → PATCH /api/products/{id}/stock
         │    │
         │    └─ /selOrders → Received Orders
         │         ├─ GET /api/orders/seller → List seller's orders
         │         ├─ View customer orders
         │         └─ Update status → PATCH /api/orders/seller/{id}/status
         │
         └─ ADMIN ROLE
              │
              ├─ /admin → Admin Dashboard
              │    ├─ View platform metrics
              │    ├─ Total users, orders, revenue
              │    └─ System health
              │
              ├─ /userManagement → User Management
              │    ├─ GET /api/auth/admin/users → List all users
              │    ├─ Deactivate user
              │    ├─ Activate user
              │    └─ Change user role
              │
              └─ /carbonManagement → Carbon Analytics
                   ├─ View emissions by category
                   ├─ Identify high-emission products
                   ├─ Promote eco-friendly sellers
                   └─ Generate reports
```

---

## 🔮 Future Enhancements

- **Payment Gateway Integration** - Stripe/PayPal for real transactions
- **Email Notifications** - Order confirmations, shipping updates, alerts
- **Product Reviews & Ratings** - Customer feedback with eco-focused questions
- **Wishlist Feature** - Save favorite products for later purchase
- **Subscription Model** - Monthly eco-product boxes
- **Carbon Offset Program** - Plant trees/offset carbon with purchases
- **Mobile App** - React Native iOS/Android application
- **Recommendation Engine** - ML-based product suggestions based on history
- **Supplier Management** - Direct supplier integration and tracking
- **Inventory Forecasting** - AI-driven stock predictions
- **Live Chat Support** - Real-time customer support
- **Social Features** - Community forums and eco tips sharing
- **Multi-language Support** - Internationalization (i18n)
- **Dark Mode** - Theme customization and dark interface

---

## 📋 Quick Reference

### Common Commands

**Backend**:
```bash
./mvnw spring-boot:run           # Run development server
./mvnw clean install             # Build project
./mvnw test                       # Run tests
```

**Frontend**:
```bash
npm run dev                       # Start dev server
npm run build                     # Build for production
npm run preview                   # Preview production build
npm run lint                      # Run ESLint
```

