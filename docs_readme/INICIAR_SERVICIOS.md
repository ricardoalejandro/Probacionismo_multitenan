# 🚀 Cómo Iniciar los Servicios de Base de Datos

## 📋 Contexto

Este proyecto usa **Docker Compose** para ejecutar:
- PostgreSQL 17 (puerto 5432)
- Redis 7 (puerto 6379)

El contenedor de desarrollo (`app`) comparte la red con PostgreSQL mediante `network_mode: service:postgres`.

---

## ✅ Método 1: Desde VS Code DevContainer (Recomendado)

### Paso 1: Abrir una Terminal LOCAL (fuera del DevContainer)

En VS Code:
1. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
2. Escribe: "Terminal: Create New Integrated Terminal (Local)"
3. Selecciona la opción que dice **(Local)**

O simplemente abre una terminal en tu sistema operativo normal.

### Paso 2: Navegar al Proyecto

```bash
cd /ruta/a/escolastica
```

### Paso 3: Iniciar los Servicios

```bash
docker-compose up -d postgres redis
```

**Salida esperada:**
```
Creating multitenant_postgres ... done
Creating multitenant_redis    ... done
```

### Paso 4: Verificar que Están Corriendo

```bash
docker ps
```

**Deberías ver:**
```
CONTAINER ID   IMAGE              COMMAND                  STATUS         PORTS
xxxxx          postgres:17-alpine "docker-entrypoint.s…"   Up 10 seconds  0.0.0.0:5432->5432/tcp
xxxxx          redis:7-alpine     "docker-entrypoint.s…"   Up 10 seconds  0.0.0.0:6379->6379/tcp
```

### Paso 5: Verificar desde el DevContainer

Vuelve a la terminal del DevContainer y ejecuta:

```bash
cd /escolastica
bash scripts/check-env.sh
```

Ahora debería mostrar:
```
5️⃣  Servicios de Base de Datos:
   ✅ PostgreSQL respondiendo en localhost:5432
   ✅ Redis respondiendo en localhost:6379
```

---

## ✅ Método 2: Iniciar TODO con Docker Compose

Si quieres iniciar TODOS los servicios (incluido el DevContainer):

```bash
# Desde tu terminal LOCAL
cd /ruta/a/escolastica
docker-compose up -d
```

Esto inicia:
- PostgreSQL
- Redis  
- El contenedor de desarrollo (app)

Luego en VS Code:
1. `Ctrl+Shift+P`
2. "Dev Containers: Attach to Running Container"
3. Seleccionar el contenedor `escolastica-app`

---

## ✅ Método 3: Sin DevContainer (Instalación Manual)

Si instalaste PostgreSQL y Redis localmente en tu sistema:

### Linux (Ubuntu/Debian)

```bash
# PostgreSQL
sudo systemctl start postgresql
sudo systemctl status postgresql

# Redis
sudo systemctl start redis
sudo systemctl status redis
```

### macOS

```bash
# Con Homebrew
brew services start postgresql@17
brew services start redis
```

### Windows

```powershell
# PostgreSQL (si se instaló como servicio)
net start postgresql-x64-17

# Redis (con WSL o Redis for Windows)
redis-server
```

---

## 🔧 Detener los Servicios

### Con Docker Compose

```bash
# Detener pero mantener datos
docker-compose stop postgres redis

# Detener y eliminar contenedores (datos persisten en volúmenes)
docker-compose down

# Detener y ELIMINAR TODO (⚠️ CUIDADO: Borra la base de datos)
docker-compose down -v
```

### Instalación Manual

```bash
# Linux
sudo systemctl stop postgresql
sudo systemctl stop redis

# macOS
brew services stop postgresql@17
brew services stop redis
```

---

## 📊 Ver Logs de los Servicios

### Docker Compose

```bash
# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Ver logs de Redis
docker-compose logs -f redis

# Ver ambos
docker-compose logs -f postgres redis
```

### Instalación Manual

```bash
# Linux - PostgreSQL
sudo journalctl -u postgresql -f

# Linux - Redis
sudo journalctl -u redis -f

# macOS - PostgreSQL
tail -f /usr/local/var/log/postgresql@17.log
```

---

## 🔍 Verificar Estado de los Servicios

### Desde DevContainer o Terminal Local

```bash
# Verificar PostgreSQL
docker exec multitenant_postgres pg_isready -U postgres

# Verificar Redis
docker exec multitenant_redis redis-cli ping
```

**Salidas esperadas:**
```
# PostgreSQL
/var/run/postgresql:5432 - accepting connections

# Redis
PONG
```

---

## 🗄️ Acceder a la Base de Datos Directamente

### PostgreSQL

```bash
# Desde el contenedor
docker exec -it multitenant_postgres psql -U postgres -d multitenant_db

# Desde DevContainer (si los servicios están corriendo)
# Necesitarás instalar psql primero:
apt-get update && apt-get install -y postgresql-client
psql -h localhost -U postgres -d multitenant_db
```

**Password:** `postgres`

**Comandos útiles dentro de psql:**
```sql
-- Listar tablas
\dt

-- Ver estructura de una tabla
\d students

-- Contar registros
SELECT COUNT(*) FROM users;

-- Salir
\q
```

### Redis

```bash
# Desde el contenedor
docker exec -it multitenant_redis redis-cli

# Comandos útiles dentro de redis-cli:
PING          # Verificar conexión
KEYS *        # Ver todas las keys
GET key_name  # Obtener valor
FLUSHALL      # ⚠️ Borrar todo el cache
exit          # Salir
```

---

## 🆘 Solución de Problemas

### ❌ Error: "Cannot connect to the Docker daemon"

**Causa:** Docker no está corriendo

**Solución:**
```bash
# Linux
sudo systemctl start docker

# macOS/Windows
# Abrir Docker Desktop
```

### ❌ Error: "port is already allocated"

**Causa:** El puerto 5432 o 6379 ya está en uso

**Solución:**
```bash
# Ver qué está usando el puerto
sudo lsof -i :5432
sudo lsof -i :6379

# Detener el proceso conflictivo o cambiar el puerto en docker-compose.yml
```

### ❌ Error: "driver failed programming external connectivity"

**Causa:** Conflicto de red en Docker

**Solución:**
```bash
# Reiniciar Docker
sudo systemctl restart docker

# O en macOS/Windows, reiniciar Docker Desktop
```

### ❌ PostgreSQL se detiene inmediatamente

**Causa:** Error en configuración o volumen corrupto

**Solución:**
```bash
# Ver logs
docker-compose logs postgres

# Si es necesario, resetear datos (⚠️ Borra todo):
docker-compose down -v
docker volume rm escolastica_postgres_data
docker-compose up -d postgres
```

---

## 📝 Comandos Útiles de Referencia Rápida

```bash
# Verificar entorno completo
bash scripts/check-env.sh

# Iniciar servicios
docker-compose up -d postgres redis

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose stop

# Reiniciar servicios
docker-compose restart postgres redis

# Eliminar TODO (⚠️ cuidado)
docker-compose down -v
```

---

## 🎯 Checklist de Inicio

Para empezar a desarrollar:

- [ ] Iniciar Docker Desktop (si usas macOS/Windows)
- [ ] Ejecutar `docker-compose up -d postgres redis`
- [ ] Verificar con `docker ps` que estén corriendo
- [ ] En DevContainer: `bash scripts/check-env.sh`
- [ ] Aplicar migraciones: `cd backend && npm run db:push`
- [ ] Insertar datos: `npm run db:seed`
- [ ] Iniciar backend: `npm run dev`
- [ ] Iniciar frontend: `cd .. && npm run dev`

---

**Siguiente paso:** [Configurar variables de entorno](CONFIGURACION_ENTORNO.md)
