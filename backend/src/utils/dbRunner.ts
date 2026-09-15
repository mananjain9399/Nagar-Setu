import net from 'net';
import path from 'path';
import fs from 'fs';
import { Client } from 'pg';

export async function isPortOpen(port: number, host: string = 'localhost'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

let pgInstance: any = null;

export async function ensurePostgresRunning(): Promise<void> {
  const port = parseInt(process.env.EMBEDDED_PG_PORT || '5432', 10);
  const isOpen = await isPortOpen(port, '127.0.0.1');

  if (isOpen) {
    console.log(`[Database] PostgreSQL is actively running on port ${port}.`);
    await ensureTargetDatabaseExists(port);
    return;
  }

  console.log(`[Database] No PostgreSQL detected on port ${port}. Starting embedded PostgreSQL instance...`);
  try {
    // @ts-ignore
    const { default: EmbeddedPostgres } = await import('embedded-postgres');
    const dataDir = path.resolve(__dirname, '../../pgdata');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    pgInstance = new EmbeddedPostgres({
      port,
      databaseDir: dataDir,
      user: 'postgres',
      password: 'password',
      persistent: true,
    });

    try {
      await pgInstance.initialise();
    } catch (e: any) {
      // If already initialized, ignore
    }

    await pgInstance.start();
    console.log(`[Database] Embedded PostgreSQL started successfully on port ${port}.`);

    await ensureTargetDatabaseExists(port);

    process.on('SIGINT', async () => {
      if (pgInstance) {
        console.log('[Database] Stopping embedded PostgreSQL...');
        await pgInstance.stop();
        process.exit(0);
      }
    });

    process.on('SIGTERM', async () => {
      if (pgInstance) {
        await pgInstance.stop();
        process.exit(0);
      }
    });
  } catch (err: any) {
    console.error(`[Database Error] Failed to start embedded PostgreSQL:`, err.message);
    throw err;
  }
}

async function ensureTargetDatabaseExists(port: number): Promise<void> {
  const targetDb = 'bhopal_civic_engine';
  const defaultClient = new Client({
    host: '127.0.0.1',
    port,
    user: 'postgres',
    password: 'password',
    database: 'postgres',
  });

  try {
    await defaultClient.connect();
    const res = await defaultClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (res.rowCount === 0) {
      console.log(`[Database] Creating target database '${targetDb}'...`);
      await defaultClient.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`[Database] Database '${targetDb}' created successfully.`);
    }
  } catch (err: any) {
    // If connection failed due to different credentials, warn and let Prisma try
    console.log(`[Database Note] Note verifying '${targetDb}': ${err.message}`);
  } finally {
    try {
      await defaultClient.end();
    } catch (e) {}
  }
}

if (require.main === module) {
  ensurePostgresRunning()
    .then(() => {
      console.log('[Database] PostgreSQL check completed.');
    })
    .catch((err) => {
      console.error('[Database Fatal]', err);
      process.exit(1);
    });
}
