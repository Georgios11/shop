import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'My-fake-shop API documentation',
      version: '1.0.0',
      description:
        'Documentation for My-fake-shop API v1.0.0. \n\n' +
        '**Note: Please seed the data before making API requests to ensure the database is populated with sample data.**\n\n' +
        '**Seeding Guide:**\n' +
        'Make a seed request under **Seed tag**.\n\n' +
        'After seeding, you can register as an admin or user using your email, or log in with the provided credentials. You can also use the app as guest\n\n' +
        '**Log in credentials:**\n\n' +
        '**Admin:**\n' +
        '**email:** admin@email.com **password:** 121212\n\n' +
        '**User:**\n' +
        '**email:** user2@email.com **password:** 121212\n\n' +
        '**To see the behavior of the app with a banned user, you can log in with the following credentials:**\n\n' +
        '**Banned User:**\n' +
        '**email:** user@email.com **password:** 121212\n\n',
    },
    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],
    components: {
      'x-roles': {
        description: 'Roles required for access to various endpoints',
        roles: {
          admin: 'Administrator with full access',
          user: 'Standard user with limited access',
          guest: 'Guest with minimal access',
        },
      },
    },
  },
  apis: [
    './src/app.ts',
    './src/controllers/**/*.ts',
    './src/swagger/schemas/*.ts',
  ],
};

// Generate swagger documentation
const swaggerDocs = swaggerJsdoc(swaggerOptions);

export default swaggerDocs;
