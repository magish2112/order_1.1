import { buildApp } from './app';
import env from './config/env';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`🚀 Server is running on http://${env.HOST}:${env.PORT}`);
    console.log(`📚 API docs available at http://${env.HOST}:${env.PORT}/api/docs`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();

