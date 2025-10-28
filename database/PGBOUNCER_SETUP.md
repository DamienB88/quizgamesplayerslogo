# PgBouncer Setup Guide

PgBouncer is a lightweight connection pooler for PostgreSQL that helps manage database connections efficiently.

## Why PgBouncer?

- **Connection Pooling**: Reduces connection overhead
- **Resource Management**: Limits max connections to prevent database overload
- **Performance**: Reuses existing connections instead of creating new ones
- **Scalability**: Essential for serverless functions and high-traffic applications

## Supabase Built-in Connection Pooling

Supabase provides built-in connection pooling via Supavisor (a modern alternative to PgBouncer). You can use it by modifying your connection string:

### Direct Connection (No Pooling)
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Pooled Connection (Transaction Mode)
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:6543/postgres
```

### Pooled Connection (Session Mode)
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true
```

## Connection Modes

### 1. Transaction Mode (Default for Supavisor Port 6543)
- Best for: Serverless functions, API requests
- Behavior: Connection released after each transaction
- Limitations: Cannot use prepared statements, advisory locks, or LISTEN/NOTIFY
- Use when: You need maximum connection efficiency

### 2. Session Mode (Port 5432 with pgbouncer=true)
- Best for: Long-running processes, migrations
- Behavior: Connection held for entire session
- Limitations: Fewer concurrent connections
- Use when: You need full PostgreSQL features

## Configuration in Your App

### For Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js';

// Use transaction mode pooling (recommended for most cases)
const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key',
  {
    db: {
      schema: 'public',
    },
    global: {
      headers: { 'x-connection-mode': 'transaction' },
    },
  }
);
```

### For Direct PostgreSQL Connections

```typescript
import { Pool } from 'pg';

// Transaction mode (port 6543)
const pool = new Pool({
  connectionString: 'postgresql://postgres:[password]@db.[project-ref].supabase.co:6543/postgres',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Environment Variables

Add to your `.env`:

```env
# Direct connection (for migrations, admin tasks)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Pooled connection (for application queries)
DATABASE_URL_POOLED=postgresql://postgres:[password]@db.[project-ref].supabase.co:6543/postgres
```

## Best Practices

### 1. Use Pooled Connections for API Requests

```typescript
// Good: Uses pooled connection
const { data, error } = await supabase
  .from('users')
  .select('*');
```

### 2. Use Direct Connection for Migrations

```bash
# Run migrations with direct connection
SUPABASE_DB_URL=$DATABASE_URL npm run db:migrate
```

### 3. Handle Connection Errors

```typescript
try {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.error('Database connection failed');
    // Implement retry logic or fallback
  }
}
```

### 4. Configure Timeouts

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLED,
  max: 20,
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout if connection takes > 2 seconds
});
```

## Monitoring

### Check Pool Status

```sql
-- View active connections
SELECT
  count(*),
  state,
  wait_event_type
FROM pg_stat_activity
WHERE datname = 'postgres'
GROUP BY state, wait_event_type;
```

### Monitor Connection Limits

```sql
-- Check max connections limit
SHOW max_connections;

-- Count current connections
SELECT count(*) FROM pg_stat_activity;
```

## Troubleshooting

### "Too many connections" Error

1. **Check current connections:**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Use pooled connection string** instead of direct connection

3. **Reduce pool size** in your application:
   ```typescript
   const pool = new Pool({ max: 10 }); // Reduce from default 20
   ```

4. **Implement connection retry logic**

### Slow Queries with Pooling

Transaction mode pooling may cause issues with:
- Prepared statements
- Temporary tables
- Advisory locks

**Solution:** Use session mode for these operations:
```typescript
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL, // Port 5432
});
```

## Self-Hosted PgBouncer (Optional)

If you need more control, you can run PgBouncer yourself:

### Docker Compose Setup

```yaml
pgbouncer:
  image: edoburu/pgbouncer:latest
  environment:
    - DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
    - POOL_MODE=transaction
    - MAX_CLIENT_CONN=100
    - DEFAULT_POOL_SIZE=20
  ports:
    - "6432:6432"
```

### Configuration File (`pgbouncer.ini`)

```ini
[databases]
privacy_social = host=db.[project-ref].supabase.co port=5432 dbname=postgres

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 50
```

## Resources

- [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [PostgreSQL Connection Pooling Guide](https://www.postgresql.org/docs/current/runtime-config-connection.html)
