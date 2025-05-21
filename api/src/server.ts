import app from './app';
import { ENVIRONMENT, PORT } from './util/secrets';

import connectDB from './config/db';
import { connectRedis } from './util/redisClient';

/**
 * Error Handler. Provides error handing middleware
   only use in development
 */

const port = process.env.PORT || 5000;

// Start Express server
app.listen(port, async () => {
  await connectDB();
  await connectRedis();
  console.log(
    `App is running at http://localhost:${port} in ${
      process.env.NODE_ENV || 'development'
    } mode`
    // app.get('port'),
    // app.get('env')
  );
  console.log('Press CTRL-C to stop\n');
});
