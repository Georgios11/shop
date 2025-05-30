# Shop Application

A modern full-stack e-commerce application built with cutting-edge technologies. This application delivers a lightning-fast shopping experience through optimized performance and responsive design.

## Log in Credentials

To explore the different user roles and their permissions, you can use the following test accounts:

-   **Admin Account**

    -   Email: admin@email.com
    -   Password: 121212
    -   Full access to all features including admin dashboard

-   **Regular User Account**

    -   Email: user2@email.com
    -   Password: 121212
    -   Standard user access with shopping features

-   **Banned User Account**
    -   Email: user@email.com
    -   Password: 121212
    -   Demonstrates restricted access and error handling

Try logging in with different accounts to see how the application handles various user roles and permissions.

## Registration

You can also register as a new user using your own email address to create a new account

## Authentication & Authorization Demonstration

This application is intentionally designed to demonstrate authentication and authorization concepts in a clear, educational manner. Some UI elements and behaviors are deliberately simplified or exaggerated to make these concepts more visible:

-   The navigation bar displays both "User" and "Admin" buttons regardless of the user's role
-   When a regular user attempts to access admin routes, they are redirected to a "Forbidden" page
-   This design choice makes the authorization flow more transparent and easier to understand
-   It serves as a practical example of how role-based access control (RBAC) works in real applications

These intentional design choices are meant to:

-   Make authentication/authorization concepts more visible and understandable
-   Provide clear examples of how different user roles interact with the system
-   Demonstrate proper error handling for unauthorized access attempts
-   Show how frontend and backend work together to enforce security policies

In a production environment, these elements would be more subtle and user-specific, but for educational purposes, they are made more explicit to better illustrate the underlying concepts.

## Performance & User Experience

-   ⚡ **Lightning-Fast Performance**

    -   Backend caching with Redis for instant data retrieval
    -   Frontend caching with TanStack Query for seamless state management
    -   Optimized database queries with MongoDB indexing
    -   Efficient image loading and optimization

-   📱 **Responsive Design**

    -   Fluid layouts that adapt to any screen size
    -   Touch-friendly interfaces for all devices
    -   Consistent user experience across platforms

-   🚀 **Optimized User Experience**

    -   Instant page transitions with client-side routing
    -   Real-time updates without page refreshes
    -   Smooth animations and transitions
    -   Progressive loading for better perceived performance

-   🔄 **Smart Data Management**
    -   Intelligent caching strategies
    -   Background data synchronization
    -   Optimistic updates for instant feedback

## Frontend Technologies

-   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1150px-React-icon.svg.png" width="16" height="16" alt="React"/> **React** with TypeScript for type-safe, component-based UI development
-   <img src="https://tanstack.com/assets/splash-light-CHqMsyq8.png" width="16" height="16" alt="TanStack Query"/> **TanStack Query** (React Query) for efficient server state management and caching
-   <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/styled-components.png" width="16" height="16" alt="Styled Components"/> **Styled Components** for component-scoped styling and dynamic theming
-   <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZRO9QNCb7z_fUogt0cYUD_IcjCEjPwMIytQ&s" width="16" height="16" alt="React Testing Library"/> **React Testing Library** & **Vitest** for comprehensive testing
-   <img src="https://vitejs.dev/logo.svg" width="16" height="16" alt="Vite"/> **Vite** for lightning-fast development and optimized builds
-   <img src="https://react-hook-form.com/images/logo/react-hook-form-logo-only.svg" width="16" height="16" alt="React Hook Form"/> **React Hook Form** with **Zod** for type-safe form validation
-   <img src="https://raw.githubusercontent.com/ngxpert/hot-toast/HEAD/assets/logo.svg?raw=true" width="16" height="16" alt="React Hot Toast"/> **React Hot Toast** for elegant notifications
-   <img src="https://market-assets.strapi.io/logos/2eb4a4c12ead37a2706422500" width="16" height="16" alt="React Icons"/> **React Icons** for beautiful iconography
-   <img src="https://www.svgrepo.com/show/354262/react-router.svg" width="16" height="16" alt="React Router"/> **React Router v7** for modern routing
-   🛡️ **React Error Boundary** for graceful error handling
-   📊 **Rollup Visualizer** for bundle analysis
-   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Typescript.svg/1200px-Typescript.svg.png" width="16" height="16" alt="TypeScript"/> **TypeScript** for type safety

## Backend Technologies

-   <img src="https://adware-technologies.s3.amazonaws.com/uploads/technology/thumbnail/20/express-js.png" width="16" height="16" alt="Express.js"/> **Express.js** with TypeScript for a robust, type-safe API
-   <img src="https://cdn.worldvectorlogo.com/logos/mongodb-icon-1.svg" width="16" height="16" alt="MongoDB"/> **MongoDB** with Mongoose for flexible, scalable data storage
-   <img src="https://static-00.iconduck.com/assets.00/swagger-icon-2048x2048-563qbzey.png" width="16" height="16" alt="Swagger"/> **Swagger/OpenAPI** for comprehensive API documentation and testing
-   <img src="https://static-00.iconduck.com/assets.00/redis-icon-2048x1749-do6trbyo.png" width="16" height="16" alt="Redis"/> **Redis** for session management and caching
-   <img src="https://img.icons8.com/?size=512&id=rHpveptSuwDz&format=png" width="16" height="16" alt="JWT"/> **JWT** & **Passport.js** for secure authentication
-   <img src="https://repository-images.githubusercontent.com/1272424/d1995000-0ab7-11ea-8ed3-04a082c36b0d" width="16" height="16" alt="Nodemailer"/> **Nodemailer** & **SendGrid** for email functionality
-   <img src="https://ps.w.org/cloudinary-image-management-and-manipulation-in-the-cloud-cdn/assets/icon-256x256.png?rev=2377259" width="16" height="16" alt="Cloudinary"/> **Cloudinary** for image management
-   <img src="https://avatars.githubusercontent.com/u/9682013?v=4" width="16" height="16" alt="Winston"/> **Winston** for advanced logging
-   <img src="https://user-images.githubusercontent.com/5006663/35962393-92074748-0cf4-11e8-9fc9-310671ceeeef.png" width="16" height="16" alt="Helmet"/> **Helmet** for security
-   ⚡ **Express Rate Limit** for API protection
-   🧹 **Express Mongo Sanitize** for data sanitization
-   <img src="https://miro.medium.com/v2/resize:fit:1400/1*QTZvtnHWanNxBQBynhtlIA.png" width="16" height="16" alt="Multer"/> **Multer** for file uploads

## Development Tools

-   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/ESLint_logo.svg/1200px-ESLint_logo.svg.png" width="16" height="16" alt="ESLint"/> **ESLint** & **Prettier**
-   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Typescript.svg/1200px-Typescript.svg.png" width="16" height="16" alt="TypeScript"/> **TypeScript** for code quality and type safety
-   <img src="https://www.jetbrains.com/guide/assets/jest-5ee71e9b.svg" width="16" height="16" alt="Jest"/> **Jest** & **Supertest** for API testing
-   🚫 **Husky** & **lint-staged** for pre-commit hooks
-   📊 **Morgan** for HTTP request logging

## Key Features

-   📝 Interactive API documentation with Swagger UI
-   🔄 Real-time data synchronization with React Query
-   🎨 Responsive design with Styled Components
-   📘 Type-safe development across the stack
-   ✅ Comprehensive test coverage (Vitest, Jest, React Testing Library)
-   🔒 Secure authentication and authorization
-   ⚡ Efficient caching and session management
-   🌐 RESTful API architecture
-   📧 Email notifications and password reset
-   🖼️ Image upload and management
-   🔍 Advanced error handling and logging
-   🛡️ Security best practices implementation

## Prerequisites

-   Node.js (v18 or higher)
-   npm (v9 or higher)
-   MongoDB (local or Atlas)
-   Redis (via WSL for Windows users)

## Quick Start

1.**Environment Setup**

-   Create `.env` in `api/`:
    -   Use .env.example
-   Create `.env` in `client/`:
    -   Use .env.example

2. **Install Dependencies**

    ```bash
    cd client && npm install
    cd ../api && npm install
    ```

3. **Start Redis (Required)**

    ```bash
    # Open WSL terminal and run:
    redis-server
    ```

    **Keep this terminal open while running the application.**

4. **Start the Application**

    Open two separate terminal windows:

    **Terminal 1 - API Server:**

    ```bash
    # Navigate to api directory
    cd api

    # Start the server
    npm run start:dev
    ```

    Wait until you see "App is running at http://localhost:3001"

    **Terminal 2 - Client:**

    ```bash
    # Navigate to client directory
    cd client

    # Start the client
    npm run dev
    ```

## Accessing the Application

-   Frontend: http://localhost:5174
-   Backend API: http://localhost:3001
-   API Documentation: http://localhost:3001/api-docs

## Important Notes

1. Always start Redis in WSL before running the application
2. Start the API server first, then the client
3. Keep all three terminals open:
    - WSL terminal running Redis
    - Terminal running the API server
    - Terminal running the client

## Troubleshooting

1. **Redis Connection Issues**

    - Ensure Redis is running in WSL
    - Check if Redis is accessible on port 6379

2. **API Server Issues**

    - Verify MongoDB connection
    - Check if port 3001 is available
    - Ensure all environment variables are set

3. **Client Issues**
    - Clear browser cache
    - Check if the API server is running
    - Verify environment variables

## API Documentation with Swagger

The API is fully documented using Swagger/OpenAPI, providing:

-   Interactive API documentation
-   Request/response examples
-   Authentication requirements
-   Schema definitions
-   Try-it-out functionality

### Accessing Swagger Documentation

1. Start the API server:

    ```bash
    cd api
    npm run start:dev
    ```

2. Open Swagger UI in your browser:
    ```
    http://localhost:3001/api-docs
    ```

### Using Swagger UI

The API documentation is powered by Swagger UI, providing an interactive interface to explore and test all available endpoints. Here's how to make the most of it:

1. **Accessing the Documentation**

    - Start the API server: `cd api && npm run start:dev`
    - Open your browser and navigate to: `http://localhost:3001/api-docs`

2. **Getting Started**

    - The documentation is organized by tags (e.g., Auth, Products, Orders)
    - Each endpoint shows:
        - HTTP method (GET, POST, PUT, DELETE)
        - Required parameters and request body
        - Response schemas
        - Authentication requirements
        - Example requests and responses

3. **Authentication**

    - Authentication is handled through the login endpoints
    - Use the Auth endpoints to:
        - Login with your credentials
        - The server will return a JWT token in the response
    - Include the JWT token in the Authorization header for protected endpoints

4. **Testing Endpoints**

    - Click on any endpoint to expand its details
    - Use the "Try it out" button to:
        - Fill in required parameters
        - Modify request body
        - Execute the request
        - View the response

5. **Available Test Credentials**

    - **Admin Access:**
        - Email: admin@email.com
        - Password: 121212
    - **User Access:**
        - Email: user2@email.com
        - Password: 121212
    - **Banned User (for testing):**
        - Email: user@email.com
        - Password: 121212

6. **Important Notes**

    - Always seed the database first using the Seed endpoint
    - Some endpoints may require specific roles (admin, user, guest)
    - Check the response schemas for expected data structures
    - Use the "Model" section to understand data types

7. **Common Operations**
    - **Authentication:**
        - Register new user
        - Login to get JWT token
        - Refresh token
    - **Products:**
        - Browse products
        - Filter and search
        - Add to cart
    - **Orders:**
        - Create orders
        - View order history
        - Track order status

For detailed information about each endpoint, refer to the specific documentation in Swagger UI. The interface provides real-time validation and helps you understand the API's capabilities.

## Testing Strategy

The application implements a robust testing strategy using modern testing tools and best practices:

### Testing Tools

-   **Vitest**: Fast, modern test runner with native TypeScript support
-   **React Testing Library**: User-centric testing utilities
-   **User Event**: Simulates real user interactions

### Component Testing

Components are thoroughly tested with a focus on user interactions and accessibility. For example, the `CreateProductForm` component tests demonstrate our testing approach:

-   **Form Validation Testing**

    -   Validates required fields
    -   Tests error message display
    -   Ensures proper form submission behavior

-   **User Interaction Testing**

    -   Simulates user input
    -   Tests file upload functionality
    -   Verifies loading states
    -   Validates form submission

-   **Integration Testing**
    -   Tests component integration with hooks
    -   Verifies data fetching behavior
    -   Ensures proper state management

### Test Coverage

Tests are written to cover:

-   Component rendering
-   User interactions
-   Form validation
-   Error handling
-   Loading states
-   File uploads
-   Integration with custom hooks

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Legal Disclaimer

### Project Purpose

This is a skill demonstration project created for educational and portfolio purposes. It is not intended for production use or commercial deployment. The project showcases technical skills and implementation of modern web development practices, but should not be used as-is in a production environment without proper security audits, performance testing, and necessary modifications.

### Terms of Use

This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. This is a demonstration project and should be treated as such. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.

### Intellectual Property

All content, code, and materials in this project are protected by copyright and other intellectual property rights. While this is a demonstration project, unauthorized use, reproduction, or distribution of this software or its contents is strictly prohibited. The project may be used as a reference for learning purposes, but direct copying or commercial use is not permitted.

### Third-Party Components

This project includes third-party components, libraries, and dependencies for demonstration purposes. Each third-party component is subject to its own license terms. Users are responsible for reviewing and complying with the license terms of all third-party components used in this project. Some components may have restrictions on commercial use.

### Data Privacy

This application is a demonstration project and includes simulated user data handling. While it implements data privacy practices for educational purposes, it should not be used to process real user data without proper modifications and compliance checks. By using this application, users acknowledge that it is a demonstration project and should not be used to process sensitive or real user data.

### Security

This is a demonstration project and while it implements security measures for educational purposes, it should not be considered production-ready. The security implementations shown are for learning purposes only. Users should not rely on this project's security measures for protecting real user data. No method of transmission over the Internet or electronic storage is 100% secure, and users acknowledge that they use this application at their own risk.

### Modifications

The authors reserve the right to modify, suspend, or discontinue any aspect of this software at any time without prior notice. As this is a demonstration project, it may be updated or changed to reflect new learning objectives or technical improvements.

### Governing Law

This disclaimer shall be governed by and construed in accordance with the laws of the jurisdiction in which the software is used, without regard to its conflict of law provisions. However, as this is a demonstration project, the primary purpose is educational and should be treated as such.
