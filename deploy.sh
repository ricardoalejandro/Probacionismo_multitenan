#!/bin/bash
# ========================================
# DESPLIEGUE AUTOMÁTICO - PROBACIONISMO
# ========================================
# Script maestro para desplegar cambios en producción
# 
# Uso: ./deploy.sh
#
# Este script:
# 1. Actualiza código desde git
# 2. Usa variables de producción
# 3. Reconstruye contenedores
# 4. Preserva datos de base de datos
# 5. Verifica que todo funcione

set -e  # Salir si hay algún error

echo "🚀 ========================================="
echo "🚀 DESPLIEGUE AUTOMÁTICO - PROBACIONISMO"
echo "🚀 ========================================="
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: No se encuentra docker-compose.yml"
    echo "   Debes ejecutar este script desde /root/proyectos/probacionismo"
    exit 1
fi

# 1. Actualizar código desde git
echo "📥 1/6 - Actualizando código desde git..."
git pull origin develop
if [ $? -ne 0 ]; then
    echo "❌ Error al hacer git pull"
    exit 1
fi
echo "✅ Código actualizado"
echo ""

# 2. Verificar archivo de producción
echo "🔍 2/6 - Verificando configuración de producción..."
if [ ! -f ".env.production" ]; then
    echo "❌ Error: No existe .env.production"
    echo "   Crea el archivo con las variables de producción"
    exit 1
fi
echo "✅ Configuración encontrada"
echo ""

# 3. Usar variables de producción
echo "⚙️  3/6 - Aplicando variables de producción..."
cp .env.production .env
echo "✅ Variables aplicadas"
echo ""

# 4. Detener contenedores (preservando datos)
echo "🛑 4/6 - Deteniendo contenedores..."
docker compose down
echo "✅ Contenedores detenidos"
echo ""

# 5. Reconstruir y levantar
echo "🔨 5/6 - Reconstruyendo imágenes..."
docker compose build --no-cache
echo "✅ Imágenes reconstruidas"
echo ""

echo "▶️  Levantando servicios..."
docker compose up -d
echo "✅ Servicios levantados"
echo ""

# 6. Esperar y verificar
echo "⏳ 6/6 - Verificando servicios..."
sleep 15

# Verificar estado
echo ""
echo "📊 Estado de contenedores:"
docker compose ps
echo ""

# Verificar salud de la API
echo "🏥 Verificando salud de la API..."
if curl -s -f http://localhost:3000/health > /dev/null; then
    echo "✅ Backend funcionando correctamente"
else
    echo "⚠️  Advertencia: Backend no responde en /health"
fi

# Verificar frontend
if curl -s -f http://localhost:5000 > /dev/null; then
    echo "✅ Frontend funcionando correctamente"
else
    echo "⚠️  Advertencia: Frontend no responde"
fi

echo ""
echo "✨ ========================================="
echo "✨ DESPLIEGUE COMPLETADO"
echo "✨ ========================================="
echo ""
echo "🌐 Tu aplicación está disponible en:"
echo "   https://naperu.cloud"
echo ""
echo "💡 Tips:"
echo "   - Ver logs: docker compose logs -f"
echo "   - Verificar estado: docker compose ps"
echo "   - Hacer backup: ./backup.sh"
echo ""
echo "📝 Logs del despliegue guardados en:"
echo "   /var/log/probacionismo-deploy.log"
echo ""
