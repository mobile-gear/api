# MobileGear Backend

## Overview

MobileGear Backend is a RESTful API service built with Node.js, Express, and TypeScript. The backend provides endpoints for product management, user authentication, order processing, and payment integration.

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **TypeScript**: Typed JavaScript
- **Sequelize**: ORM for PostgreSQL
- **PostgreSQL**: Relational database
- **JWT**: Authentication mechanism
- **Stripe**: Payment processing integrations
- **Jest**: Testing framework

## Project Structure

```
src/
├── __tests__/           # Test files
├── controllers/         # Request handlers
├── db/                  # Database configuration
├── functions/           # Helper functions
├── interfaces/          # TypeScript interfaces
├── middleware/          # Express middleware
├── models/              # Sequelize models
├── repositories/        # Data access layer
├── routes/              # API routes
├── scripts/             # Utility scripts
├── services/            # Business logic
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── server.ts            # Application entry point
```

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Authenticate a user
- `GET /api/auth/profile`: Get authenticated user profile

### Products

- `GET /api/products`: Get all products with optional filtering
- `GET /api/products/:id`: Get a specific product by ID
- `POST /api/products`: Create a new product (admin only)
- `PUT /api/products/:id`: Update a product (admin only)
- `DELETE /api/products/:id`: Delete a product (admin only)

### Orders

- `POST /api/orders`: Create a new order
- `GET /api/orders`: Get all orders (admin only)
- `GET /api/orders/my-orders`: Get all orders for the authenticated user
- `GET /api/orders/:id`: Get a specific order by ID
- `PATCH /api/orders/:id/status`: Update an order status (admin only)

### Checkout

- `POST /api/checkout/create-payment-intent`: Create a payment intent for Stripe

## Features

- **User Authentication**: Secure JWT-based authentication
- **Role-Based Access Control**: Admin and regular user roles
- **Product Management**: CRUD operations for products
- **Order Processing**: Order creation and management
- **Payment Integration**: Stripe and PayPal payment gateways
- **Data Validation**: Input validation for all API endpoints
- **Error Handling**: Comprehensive error handling and reporting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Stripe and PayPal developer accounts (for payment processing)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/mobile-gear.git
   cd mobile-gear/mobile_gear_back
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on `.env.dist` and configure your environment variables:

   ```
   PORT=8000
   DB_URL=postgres://username:password@localhost:5432/mobilegear
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   ```

4. Run database migrations:

   ```
   npm run build
   ```

5. Generate sample data (optional):
   ```
   npm run generate:data
   ```

### Running the Application

#### Development Mode

```
npm run dev
```

#### Production Mode

```
npm run build
npm start
```

### Testing

```
npm test
```

## Database Schema

The application uses the following main models:

- **User**: User accounts with authentication details
- **Product**: Mobile devices and accessories inventory
- **Order**: Customer orders
- **OrderItem**: Individual items within an order
- **Payment**: Payment transaction records

## Security Considerations

- JWT authentication for API endpoints
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration for frontend access

## Deployment

The application is configured for deployment on various platforms:

- **Netlify**: Using the netlify.toml configuration
- **Traditional Hosting**: Using the production script
- **Docker**: Can be containerized (Dockerfile not included)

## License

This project is licensed under the ISC License.
