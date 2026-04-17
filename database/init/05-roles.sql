-- FASE 6: SEGURIDAD (Principio de Mínimo Privilegio)

-- 1. Aseguramos que el script no falle si el rol ya existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_reporter') THEN
    CREATE ROLE app_reporter WITH LOGIN PASSWORD 'Secure_Reporter_P@ss';
  END IF;
END
$$;

-- 2. BLOQUEO TOTAL AL ESQUEMA PÚBLICO
-- Removemos la falla de seguridad por defecto de Postgres 
-- donde 'public' le da permisos pasivos a todos.
REVOKE ALL ON SCHEMA public FROM public;
REVOKE ALL ON SCHEMA public FROM app_reporter;

-- Incluso si Next.js tuviera un bypass, no puede leer ninguna tabla cruda.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_reporter;

-- 3. APERTURA AISLADA SOLAMENTE AL ESQUEMA 'reports'
GRANT USAGE ON SCHEMA reports TO app_reporter;

-- 4. CONCESIÓN ESPECÍFICA (Read-only on Views)
-- Al usar views estándar en Postgres, el rol que las consulta NO NECESITA privilegios
-- sobre las tablas base subyacentes, ya que la vista ejecuta con los permisos de su creador.
-- Esto permite que Next.js consuma métricas de users/loans sin tener derecho a leer la tabla users.
GRANT SELECT ON ALL TABLES IN SCHEMA reports TO app_reporter;

-- 5. CONFIGURACIÓN FUTURA AUTOMÁTICA
ALTER DEFAULT PRIVILEGES IN SCHEMA reports GRANT SELECT ON TABLES TO app_reporter;
