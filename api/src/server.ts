import app from './app';
import { ENVIRONMENT, PORT } from './util/secrets';
import connectDB from './config/db';
import { connectRedis } from './util/redisClient';
import http from 'http';
import { exec } from 'child_process';
import { platform } from 'os';

/**
 * Error Handler. Provides error handing middleware
   only use in development
 */

const port = Number(PORT) || 3001;
let server: http.Server;

const killProcessOnPort = (port: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const isWindows = platform() === 'win32';
    const command = isWindows
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port}`;

    exec(command, (error, stdout) => {
      if (error) {
        // If no process found, that's fine
        if (error.code === 1) {
          resolve();
          return;
        }
        reject(error);
        return;
      }

      if (!stdout.trim()) {
        resolve();
        return;
      }

      // Parse the output to get PID
      let pid: string;
      if (isWindows) {
        // Windows output format: TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    1234
        const lines = stdout.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        pid = lastLine.split(/\s+/).pop() || '';
      } else {
        // Unix output format: node    1234 user   20u  IPv6 1234567      0t0  TCP *:3001
        const lines = stdout.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        pid = lastLine.split(/\s+/)[1] || '';
      }

      if (!pid) {
        resolve();
        return;
      }

      // Kill the process
      const killCommand = isWindows
        ? `taskkill /PID ${pid} /F`
        : `kill -9 ${pid}`;

      exec(killCommand, (killError) => {
        if (killError) {
          console.error(`Failed to kill process ${pid}:`, killError);
          reject(killError);
          return;
        }
        console.log(`Successfully killed process ${pid} on port ${port}`);
        resolve();
      });
    });
  });
};

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    // Try to kill any process using our port
    try {
      await killProcessOnPort(port);
      console.log(`Port ${port} is now available`);
    } catch (error) {
      console.error(`Failed to kill process on port ${port}:`, error);
      // Continue anyway, the server will fail to start if port is still in use
    }

    server = app.listen(port, () => {
      const host =
        ENVIRONMENT === 'production' ? 'Railway' : `http://localhost:${port}`;
      console.log(
        `App is running at ${host} in ${ENVIRONMENT || 'development'} mode`
      );
      console.log('Press CTRL-C to stop\n');
    });

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
