import 'dotenv/config';
import fastify from 'fastify';
import fastifySocketIO from 'fastify-socket.io';

import { connectDB } from './src/config/connect.js';
import { PORT } from './src/config/config.js';
import { registerRoutes } from './src/routes/index.js';
import { admin, buildAdminRouter } from './src/config/setup.js';

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB(process.env.MONGO_URI);

    // Create Fastify instance with logging in production
    const app = fastify({
      logger: process.env.NODE_ENV === 'production',
    });

    // Register Socket.IO
    await app.register(fastifySocketIO, {
      cors: {
        origin: (origin, cb) => {
          if (!origin) return cb(null, true); // allow requests without origin (native apps)
          const allowedOrigins = [
            'https://your-frontend.com', // replace with your domain(s)
            'https://admin.yourapp.com',
          ];
          if (allowedOrigins.includes(origin)) {
            cb(null, true);
          } else {
            cb(new Error("Not allowed by CORS"), false);
          }
        },
        credentials: true,
        pingInterval: 10000,
        pingTimeout: 5000,
        transports: ['websocket'],
      },
    });

    // Register routes
    await registerRoutes(app);

    // Register AdminJS router
    await buildAdminRouter(app);

    // Start Fastify server
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(
      `✅ Grocery App running at http://localhost:${PORT}${admin.options.rootPath}`
    );

    // Socket.IO logic
    app.ready().then(() => {
      app.io.on('connection', (socket) => {
        console.log('🔌 A user connected');

        socket.on('joinRoom', (orderId) => {
          socket.join(orderId);
          console.log(`🟢 User joined room ${orderId}`);
        });

        socket.on('disconnect', () => {
          console.log('❌ User disconnected');
        });
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1); // Force exit on failure
  }
};

start();
