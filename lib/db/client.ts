import { Pool, PoolConfig } from 'pg';
import { parse } from 'pg-connection-string';

// Typisierte Konfiguration für die Datenbankverbindung
interface DatabaseConfig extends PoolConfig {
  ssl?: boolean | { rejectUnauthorized: boolean };
}

// Parse DATABASE_URL und konvertiere in PoolConfig
const connectionConfig = parse(process.env.DATABASE_URL!);

// Explizite Typisierung der Konfiguration
const poolConfig: DatabaseConfig = {
  host: connectionConfig.host || 'localhost',
  port: connectionConfig.port ? parseInt(connectionConfig.port) : 5432,
  user: connectionConfig.user || 'postgres',
  password: connectionConfig.password || undefined,
  database: connectionConfig.database || 'typewriter', // Fallback auf 'typewriter'
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
};

// Erstelle den Pool mit der typisierten Konfiguration
const pool = new Pool(poolConfig);

// Exportiere die query-Funktion
export const query = (text: string, params?: any[]) => pool.query(text, params);
