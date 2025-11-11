# 🚀 Guía de Deployment - Probacionismo

## 📋 Flujo de Trabajo Automatizado

### Despliegue Rápido (Recomendado)

```bash
# Desde tu máquina local:
ssh root@72.61.37.46 'cd /root/proyectos/probacionismo && ./deploy.sh'

# O conectándote al VPS:
ssh root@72.61.37.46
cd /root/proyectos/probacionismo
./deploy.sh
```

El script `deploy.sh` hace TODO automáticamente:
1. ✅ Actualiza código desde git (`develop`)
2. ✅ Aplica configuración de producción (`.env.production`)
3. ✅ Detiene contenedores (preservando datos)
4. ✅ Reconstruye imágenes con código nuevo
5. ✅ Levanta servicios
6. ✅ Verifica que todo funcione

---

## 📁 Estructura de Archivos de Configuración

```
/root/proyectos/probacionismo/
├── .env                    ← Archivo activo (copia de .env.production)
├── .env.example            ← Plantilla (para git)
├── .env.development        ← Valores de desarrollo (NO usar en VPS)
├── .env.production         ← Valores de producción (USAR EN VPS)
├── deploy.sh               ← Script de despliegue automático
├── backup.sh               ← Script de backup
└── update.sh               ← Script legacy (deprecado, usar deploy.sh)
```

### ⚠️ IMPORTANTE:

- **`.env.production`** contiene los valores REALES de producción (passwords, secrets, dominio)
- **`.env`** es una copia temporal que usa Docker Compose
- **NUNCA commitear** `.env` ni `.env.production` a git
- **SÍ commitear** `.env.example` como plantilla

---

## 🎯 URLs de Producción

Tu aplicación está disponible en:

- **URL Principal:** https://naperu.cloud/
- **Login:** https://naperu.cloud/login  
- **Dashboard:** https://naperu.cloud/dashboard
- **API:** https://naperu.cloud/api/

### 🔒 Seguridad Implementada:
- ✅ HTTPS con certificado SSL (Let's Encrypt)
- ✅ Renovación automática de certificado
- ✅ Redirección HTTP → HTTPS
- ✅ Security headers configurados
- ✅ Nginx como reverse proxy

---

## 📦 Backups Automáticos

### Configuración Actual:
- **Frecuencia:** Diario a las 3:00 AM
- **Ubicación:** `/root/backupsBD/probacionismo/`
- **Formato:** `backup_YYYY-MM-DD_HH-MM-SS.sql.gz`
- **Retención:** 30 días (automático)

### Comandos de Backup:

```bash
# Crear backup manual
./backup.sh

# Ver backups disponibles
ls -lh /root/backupsBD/probacionismo/

# Restaurar backup específico
gunzip < /root/backupsBD/probacionismo/backup_2025-11-11_03-00-00.sql.gz | \
  docker exec -i multitenant_postgres psql -U postgres -d multitenant_db
```

---

## 🔧 Variables de Entorno de Producción

### Archivo: `.env.production`

```bash
# SEGURIDAD
JWT_SECRET=<secret-aleatorio-64-caracteres>
POSTGRES_PASSWORD=<password-seguro>

# URLS Y DOMINIO
NODE_ENV=production
CORS_ORIGIN=https://naperu.cloud
NEXT_PUBLIC_API_URL=https://naperu.cloud/api

# PUERTOS (NO CAMBIAR)
BACKEND_PORT=3000
FRONTEND_PORT=5000
```

### ⚠️ Cambiar Secrets:

Si necesitas cambiar secrets en producción:

```bash
# 1. Editar archivo
nano .env.production

# 2. Redesplegar
./deploy.sh
```

---

## 🛠️ Comandos Útiles

### Ver estado de servicios
```bash
docker compose ps
```

### Ver logs en tiempo real
```bash
docker compose logs -f

# Logs específicos
docker compose logs -f backend
docker compose logs -f frontend
```

### Reiniciar servicios (sin rebuild)
```bash
docker compose restart
```

### Rebuild completo (si hay problemas graves)
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Verificar Nginx
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/probacionismo_error.log
```

### Verificar espacio en disco
```bash
df -h /
docker system df
```

### Limpiar espacio de Docker
```bash
docker system prune -a --volumes -f
```

---

## 🔍 Verificar que Todo Funciona

### Desde el VPS:
```bash
# Backend health check
curl http://localhost:3000/health

# Frontend
curl -I http://localhost:5000

# HTTPS público
curl -I https://naperu.cloud
```

### Desde el navegador:
1. Abre https://naperu.cloud
2. Debería aparecer el login
3. Loguéate con: `admin` / `escolastica123`
4. Verifica que el dashboard cargue correctamente

---

## ⚠️ Troubleshooting

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps postgres

# Ver logs
docker compose logs postgres
```

### Error: "CORS policy blocked"
```bash
# Verificar CORS_ORIGIN en .env.production
grep CORS_ORIGIN .env.production

# Debe ser: CORS_ORIGIN=https://naperu.cloud
```

### Error: "504 Gateway Timeout"
```bash
# Verificar que backend esté respondiendo
docker compose logs backend --tail 50

# Reiniciar si es necesario
docker compose restart backend
```

### Frontend no carga
```bash
# Limpiar caché del navegador
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# Verificar logs
docker compose logs frontend --tail 50
```

**Para más problemas:** Consulta `TROUBLESHOOTING.md`

---

## 📊 Arquitectura Actual

```
Internet
   ↓
https://naperu.cloud (72.61.37.46)
   ↓
Nginx (:80/:443)
   ↓
┌─────────────────────────────┐
│ Docker Compose              │
│                             │
│ Frontend (:5000)            │
│ Backend (:3000)             │
│ PostgreSQL (:5432) PRIVADO  │
│ Redis (:6379) PRIVADO       │
└─────────────────────────────┘
```

---

## 💡 Tips y Mejores Prácticas

1. **Siempre hacer backup antes de cambios importantes**
   ```bash
   ./backup.sh
   ```

2. **Monitorear logs después del despliegue**
   ```bash
   docker compose logs -f --tail 50
   ```

3. **Verificar estado de servicios regularmente**
   ```bash
   docker compose ps
   ```

4. **Renovación SSL automática** (configurada con certbot)
   - El certificado se renueva solo cada 60 días
   - Verificar: `sudo certbot renew --dry-run`

5. **Mantener limpio el sistema**
   ```bash
   # Cada mes
   docker system prune -a --volumes -f
   ```

6. **Documentar cambios importantes**
   - Actualiza estos archivos si cambias algo crítico
   - Guarda logs de errores importantes

---

## 🔐 Seguridad

### Checklist de Seguridad:
- ✅ JWT_SECRET único y fuerte
- ✅ Passwords seguros en PostgreSQL
- ✅ HTTPS con certificado válido
- ✅ CORS configurado correctamente
- ✅ PostgreSQL/Redis en red privada
- ✅ Nginx con security headers
- ✅ Backups automáticos configurados
- ✅ Firewall UFW (opcional, actualmente inactivo)

### Actualizar Secrets:
```bash
# 1. Generar nuevo secret
openssl rand -base64 48

# 2. Editar .env.production
nano .env.production

# 3. Redesplegar
./deploy.sh
```

---

## 🎉 ¡Listo para Producción!

Tu aplicación está completamente configurada y lista para recibir usuarios en:

**https://naperu.cloud** 🚀
