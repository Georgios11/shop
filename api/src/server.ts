import app from './app';
import { ENVIRONMENT, PORT } from './util/secrets';

import connectDB from './config/db';
import { connectRedis } from './util/redisClient';

/**
 * Error Handler. Provides error handing middleware
   only use in development
 */

// Start Express server
app.listen(PORT, async () => {
  await connectDB();
  await connectRedis();
  console.log(
    `App is running at http://localhost:${PORT} in ${ENVIRONMENT} mode`
    // app.get('port'),
    // app.get('env')
  );
  console.log('Press CTRL-C to stop\n');
});
