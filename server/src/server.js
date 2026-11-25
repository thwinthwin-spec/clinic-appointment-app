/** Server entry point. Binds 0.0.0.0 so the API works over the LAN. */
const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');

/** Close the HTTP server and the database when the process gets a signal. */
function listenForShutdown(server) {
  async function shutdown(signal) {
    console.log(`${signal} received. Shutting down gracefully...`);

    server.close(async function afterClose() {
      try {
        await db.disconnectDB();
        process.exit(0);
      } catch (error) {
        process.exit(1);
      }
    });
  }

  process.on('SIGINT', function onInterrupt() {
    shutdown('SIGINT');
  });

  process.on('SIGTERM', function onTerminate() {
    shutdown('SIGTERM');
  });
}

async function startServer() {
  try {
    await db.connectDB();

    const server = app.listen(env.port, '0.0.0.0', function onListening() {
      console.log(`Clinic API listening on http://0.0.0.0:${env.port}`);
    });

    listenForShutdown(server);
    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = startServer;
