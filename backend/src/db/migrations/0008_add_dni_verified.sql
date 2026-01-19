-- Migración: Añadir campo is_dni_verified a students
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_dni_verified BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN students.is_dni_verified IS 'Indica si los datos del DNI fueron verificados con la API de RENIEC';
