import { Pool } from 'pg';
import { env } from './env';

// Declaración tipada para el singletón global en desarrollo Next.js
declare global {
  var _pgPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20, // max connection pool
    idleTimeoutMillis: 30000,
  });
} else {
  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString: env.DATABASE_URL,
    });
  }
  pool = global._pgPool;
}

export { pool };
