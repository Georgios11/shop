import app from './app';
import { ENVIRONMENT, PORT } from './util/secrets';

import connectDB from './config/db';
import { connectRedis } from './util/redisClient';

/**
 * Error Handler. Provides error handing middleware
   only use in development
 */

const port = PORT || 3001;

// Start Express server
app.listen(port, async () => {
  await connectDB();
  await connectRedis();
  const host =
    ENVIRONMENT === 'production' ? 'Railway' : `http://localhost:${port}`;
  console.log(
    `App is running at ${host} in ${ENVIRONMENT || 'development'} mode`
    // app.get('port'),
    // app.get('env')
  );
  console.log('Press CTRL-C to stop\n');
});
