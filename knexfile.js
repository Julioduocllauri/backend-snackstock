import 'dotenv/config';

export default {
  development: {
    client: 'pg',
    connection: {
      host: 'aws-1-us-east-1.pooler.supabase.com',
      port: 5432,
      user: 'postgres.scquqszwkbdqaonmuele',
      password: process.env.SUPABASE_DB_PASSWORD || '',
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: './src/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/seeds'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: 'aws-1-us-east-1.pooler.supabase.com',
      port: 5432,
      user: 'postgres.scquqszwkbdqaonmuele',
      password: process.env.SUPABASE_DB_PASSWORD || '',
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: './src/migrations',
      tableName: 'knex_migrations'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};
