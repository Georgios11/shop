import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import rateLimiter from './util/rateLimiter';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { StatusCodes } from 'http-status-codes';
import session from 'express-session';
import passport from './config/passportConfig';
import swaggerUi from 'swagger-ui-express';
import RedisStore from 'connect-redis';
import { redisClient } from './util/redisClient';
import { ENVIRONMENT, FRONTEND_URL } from './util/secrets';
//public

import path from 'path';

// import session from 'express-session'
// import passport from 'passport'

import seedRouter from './routers/seedRouter';
import responseUtils from './util/responseUtils';
import openRouter from './routers/openRouter';
import userRouter from './routers/userRouter';
import adminRouter from './routers/adminRouter';
import errorHandlerMiddleware from './middlewares/errorHandlerMiddleware';
import { authorizeAdmin, authorizeUser } from './middlewares/authMiddleware';
import swaggerDocs from './swagger/swaggerUtils';

dotenv.config({ path: '.env' });
const production = ENVIRONMENT === 'production';
const publicPath = production
  ? path.join(__dirname, '../public') // Proper public directory in production
  : path.join(__dirname, 'example.txt');

const app: Application = express();

// Express configuration
app.set('port', process.env.SERVER_PORT);

// Global middleware
app.use(
  cors({
    origin: production
      ? [
          FRONTEND_URL || 'https://gleeful-faun-812bcc.netlify.app',
          'https://gleeful-faun-812bcc.netlify.app',
        ]
      : [
          'http://localhost:3000',
          'http://172.18.160.1:5174',
          'http://localhost:5174',
          'http://192.168.178.157:5174',
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  })
);

// Production-specific middleware
if (production) {
  app.use(rateLimiter);
  // Log all requests in production
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => {
          console.log(message.trim()); // Log everything to stdout
        },
      },
    })
  );
} else {
  app.use(morgan('dev'));
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(helmet());
app.use(mongoSanitize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(publicPath));

app.use(
  session({
    store: new (RedisStore as any)({ client: redisClient }),
    secret:
      process.env.SESSION_SECRET ||
      (() => {
        if (production) {
          throw new Error('SESSION_SECRET must be set in production');
        }
        return 'your-secret-key';
      })(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: production,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: production ? 'strict' : 'lax',
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
/**
 * @openapi
 * /:
 *   get:
 *     summary: API Health Check
 *     description: Checks if the API is operational and responsive.
 *     tags:
 *       - Health
 *     operationId: checkApiHealth
 *     responses:
 *       200:
 *         description: OK - The API is running and healthy.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API health ok"
 *       400:
 *         description: Bad Request - The request was malformed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 details:
 *                   type: string
 *                   example: "Invalid parameters"
 *       404:
 *         description: Not Found - The requested resource was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 message:
 *                   type: string
 *                   example: "The requested endpoint does not exist"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred on the server"
 */

app.get('/', (req: Request, res: Response) => {
  responseUtils.successResponse(res, StatusCodes.OK, 'API health ok');
});
//routers
app.use('/api/v1/open', openRouter);
app.use('/api/v1/seed', seedRouter);
app.use('/api/v1/users', authorizeUser, userRouter);
app.use('/api/v1/admin', authorizeAdmin, adminRouter);
app.use('/api/v1/products', authorizeUser, userRouter);

//NOT FOUND ERROR
app.use('*', (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    message: '404 not found ',
    ok: false,
    status: 404,
  });
});
app.use(errorHandlerMiddleware);

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Perform cleanup
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Perform cleanup
  process.exit(1);
});

export default app;
