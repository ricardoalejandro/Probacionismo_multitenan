# 🔧 Manual de Configuración de Entorno

## 📋 Tabla de Contenidos

1. [Variables de Entorno](#variables-de-entorno)
2. [Configuración para Desarrollo](#configuración-para-desarrollo)
3. [Configuración para Producción](#configuración-para-producción)
4. [Resolución de Problemas Comunes](#resolución-de-problemas-comunes)
5. [Iniciar Servicios](#iniciar-servicios)

---

## 🌐 Variables de Entorno

### Variables Críticas

#### `NODE_ENV`
**Ubicación:** Variable de sistema / `.env`  
**Valores:** `development` | `production`

⚠️ **CRÍTICO:** Cuando `NODE_ENV=production`, npm **NO instala** `devDependencies`

**Efecto en instalación:**
```bash
# Con NODE_ENV=production
npm install
# ❌ No instala: drizzle-kit, tsx, typescript, @types/*

# Con NODE_ENV=development
npm install  
# ✅ Instala TODO incluyendo devDependencies
```

---

## 💻 Configuración para Desarrollo

### 1. Variables de Entorno Frontend

**Archivo:** `/escolastica/.env`

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. Variables de Entorno Backend

**Archivo:** `/escolastica/backend/.env`

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/multitenant_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:5000
```

### 3. Configuración de Red en DevContainer

**Archivo:** `/escolastica/docker-compose.yml` (línea 11)

```yaml
network_mode: service:postgres
```

**Significado:** El contenedor `app` comparte la red con `postgres`
- ✅ PostgreSQL accesible en: `localhost:5432`
- ✅ Redis accesible en: `localhost:6379`
- ❌ NO usar: `postgres:5432` ni `redis:6379`

### 4. Instalación de Dependencias

```bash
# IMPORTANTE: Verificar NODE_ENV primero
echo $NODE_ENV
# Debe mostrar: development (o estar vacío)

# Si muestra 'production', cambiarlo:
export NODE_ENV=development

# Instalar dependencias del frontend
cd /escolastica
npm install

# Instalar dependencias del backend
cd backend
npm install

# Verificar que devDependencies se instalaron
npm ls drizzle-kit tsx typescript
# Debe mostrar:
# └── drizzle-kit@0.28.1
# └── tsx@4.20.6
# └── typescript@5.9.3
```

### 5. Iniciar Servicios de Base de Datos

**Opción A: Si usas DevContainer (Recomendado)**

Los servicios PostgreSQL y Redis deberían iniciarse automáticamente con docker-compose.

**Verificar que estén corriendo:**
```bash
# Desde FUERA del DevContainer (en tu terminal local)
docker ps

# Deberías ver:
# - multitenant_postgres
# - multitenant_redis
```

**Si NO están corriendo, iniciarlos:**
```bash
# Desde tu terminal local (FUERA del DevContainer)
cd /ruta/a/escolastica
docker-compose up -d postgres redis
```

**Opción B: Si usas instalación manual**

```bash
# Iniciar PostgreSQL (depende de tu sistema)
sudo systemctl start postgresql

# Iniciar Redis
sudo systemctl start redis
```

### 6. Crear Schema de Base de Datos

```bash
cd /escolastica/backend

# Asegurarse que NODE_ENV está en development
export NODE_ENV=development

# Aplicar migraciones (crea las 14 tablas)
npm run db:push

# Insertar datos iniciales (admin user + sucursales de ejemplo)
npm run db:seed
```

**Salida esperada:**
```
✅ Created admin user: admin
✅ Created 3 sample branches
🌱 Database seeded successfully!
```

### 7. Iniciar Aplicación en Desarrollo

```bash
# Terminal 1: Backend (puerto 3000)
cd /escolastica/backend
export NODE_ENV=development
npm run dev

# Terminal 2: Frontend (puerto 5000)
cd /escolastica
npm run dev

# O iniciar ambos a la vez:
npm run dev:all
```

**Accesos:**
- Frontend: http://localhost:5000
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/docs
- Login: `admin` / `escolastica123`

---

## 🚀 Configuración para Producción

### 1. Variables de Entorno Frontend

**Archivo:** `/escolastica/.env.production`

```env
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
```

### 2. Variables de Entorno Backend

**Archivo:** `/escolastica/backend/.env.production`

```env
# Database (usar host real del servidor)
DATABASE_URL=postgresql://usuario_prod:password_segura@db-host:5432/multitenant_prod

# Redis (usar host real del servidor)
REDIS_URL=redis://redis-host:6379

# JWT (GENERAR NUEVA CLAVE SEGURA)
JWT_SECRET=clave-super-secreta-aleatoria-minimo-32-caracteres-cambiar-en-produccion

# Server
NODE_ENV=production
PORT=3000

# CORS (dominio de producción)
CORS_ORIGIN=https://tudominio.com
```

### 3. Generar JWT Secret Seguro

```bash
# Opción 1: Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: Con OpenSSL
openssl rand -hex 32

# Copiar la salida y pegarla en JWT_SECRET
```

### 4. Instalación en Producción

```bash
# Opción 1: Usar el instalador automático (Linux)
sudo bash scripts/install.sh

# Opción 2: Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Opción 3: Manual
export NODE_ENV=production

# Build frontend
cd /escolastica
npm install --production=false  # Instalar devDeps para build
npm run build
npm prune --production  # Remover devDeps después del build

# Build backend
cd backend
npm install --production=false
npm run build
npm prune --production

# Iniciar con systemd
sudo systemctl start multitenant-backend
sudo systemctl start multitenant-frontend
```

### 5. Checklist de Seguridad para Producción

- [ ] Cambiar `JWT_SECRET` por uno generado aleatoriamente
- [ ] Usar contraseñas seguras para PostgreSQL
- [ ] Configurar HTTPS con certificado SSL
- [ ] Cambiar password del usuario admin por defecto
- [ ] Configurar firewall (solo puertos 80, 443)
- [ ] Habilitar rate limiting en Fastify
- [ ] Configurar backups automáticos de PostgreSQL
- [ ] Revisar logs de seguridad regularmente
- [ ] Actualizar dependencias (`npm audit fix`)

---

## 🔧 Resolución de Problemas Comunes

### ❌ Problema: `drizzle-kit: not found` o `tsx: not found`

**Causa:** `NODE_ENV=production` durante `npm install`

**Solución:**
```bash
cd /escolastica/backend

# Verificar NODE_ENV
echo $NODE_ENV

# Si es 'production', cambiarlo
export NODE_ENV=development

# Reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar
npm ls drizzle-kit tsx
```

### ❌ Problema: `Error: connect ECONNREFUSED ::1:5432`

**Causa:** PostgreSQL no está corriendo o no está en el puerto correcto

**Solución:**
```bash
# Verificar si PostgreSQL está corriendo
# Desde tu terminal local (fuera del DevContainer):
docker ps | grep postgres

# Si NO aparece, iniciar servicios:
docker-compose up -d postgres redis

# Verificar conectividad desde DevContainer:
timeout 3 bash -c 'cat < /dev/null > /dev/tcp/localhost/5432' && echo "✅ OK" || echo "❌ FAIL"
```

### ❌ Problema: `Database schema not created`

**Causa:** No se ejecutaron las migraciones

**Solución:**
```bash
cd /escolastica/backend
export NODE_ENV=development
npm run db:push
npm run db:seed
```

### ❌ Problema: `npm install` tarda mucho o falla

**Solución:**
```bash
# Limpiar cache
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

### ❌ Problema: Error al hacer login

**Posibles causas:**

1. **Base de datos vacía**
   ```bash
   cd backend
   npm run db:seed
   ```

2. **JWT_SECRET incorrecto**
   ```bash
   # Verificar que backend/.env tenga JWT_SECRET
   cat backend/.env | grep JWT_SECRET
   ```

3. **Backend no está corriendo**
   ```bash
   cd backend
   npm run dev
   ```

---

## 📊 Resumen Rápido

### Desarrollo (Local)

```bash
# 1. Verificar NODE_ENV
export NODE_ENV=development

# 2. Instalar dependencias
npm install && cd backend && npm install && cd ..

# 3. Verificar servicios Docker
docker-compose up -d postgres redis

# 4. Crear schema
cd backend && npm run db:push && npm run db:seed

# 5. Iniciar app
npm run dev:all
```

### Producción (Servidor)

```bash
# 1. Configurar variables de entorno
cp .env.example .env.production
cp backend/.env.example backend/.env.production
# Editar archivos con valores de producción

# 2. Usar instalador automático
sudo bash scripts/install.sh

# 3. O manual:
export NODE_ENV=production
npm run build
cd backend && npm run build
# Configurar systemd/PM2
```

---

## 🎯 Diferencias Clave Desarrollo vs Producción

| Aspecto | Desarrollo | Producción |
|---------|-----------|------------|
| **NODE_ENV** | `development` | `production` |
| **devDependencies** | ✅ Instaladas | ❌ No instaladas |
| **Source maps** | ✅ Habilitados | ❌ Deshabilitados |
| **Hot reload** | ✅ Activo | ❌ Desactivado |
| **Build** | No necesario | ✅ Obligatorio |
| **Puerto Frontend** | 5000 (dev server) | 80/443 (Next.js server) |
| **Puerto Backend** | 3000 | 3000 (detrás de proxy) |
| **CORS** | `localhost:5000` | Dominio de producción |
| **JWT_SECRET** | Default (inseguro) | Aleatorio y seguro |
| **Database** | `localhost` o Docker | Host remoto |
| **Logs** | Verbose (pino-pretty) | JSON estructurado |

---

**Última actualización:** 2024-11-07  
**Versión del sistema:** 1.0.0
