import { Pool, type PoolConfig } from 'pg';

const poolConfig: PoolConfig = {
  host: 'aws-0-eu-west-3.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.bqqkuxehwaaxkgqqsrnq',
  password: 'Dspro1814@2027',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const globalForPool = globalThis as unknown as { pgPool: Pool | undefined };

export const pool = globalForPool.pgPool ?? new Pool(poolConfig);
if (process.env.NODE_ENV !== 'production') globalForPool.pgPool = pool;

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 200) {
    console.log(`Slow query (${duration}ms): ${text.substring(0, 100)}...`);
  }
  return res.rows as T[];
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const res = await pool.query(text, params);
  return (res.rows[0] || null) as T | null;
}

// Helper to convert snake_case DB rows to camelCase for frontend
export function toCamelCase(row: Record<string, any>): Record<string, any> {
  const camel: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    camel[camelKey] = value;
  }
  return camel;
}

export function rowsToCamelCase<T = any>(rows: Record<string, any>[]): T[] {
  return rows.map(toCamelCase) as T[];
}