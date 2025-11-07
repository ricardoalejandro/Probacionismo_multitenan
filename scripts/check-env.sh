#!/bin/bash

echo "🔍 Verificación de Entorno - Escolstica"
echo "========================================"
echo ""

# 1. NODE_ENV
echo "1️⃣  NODE_ENV:"
if [ -z "$NODE_ENV" ]; then
    echo "   ⚠️  No definido (npm usará 'development' por defecto)"
elif [ "$NODE_ENV" = "production" ]; then
    echo "   🔴 PRODUCCIÓN - devDependencies NO se instalarán"
else
    echo "   ✅ $NODE_ENV"
fi
echo ""

# 2. Dependencias frontend
echo "2️⃣  Dependencias Frontend:"
if [ -d "node_modules" ]; then
    PKG_COUNT=$(ls node_modules | wc -l)
    echo "   ✅ $PKG_COUNT paquetes instalados"
else
    echo "   ❌ No instaladas (ejecutar: npm install)"
fi
echo ""

# 3. Dependencias backend
echo "3️⃣  Dependencias Backend:"
if [ -d "backend/node_modules" ]; then
    BACKEND_PKG=$(ls backend/node_modules | wc -l)
    echo "   ✅ $BACKEND_PKG paquetes instalados"
    
    # Verificar devDependencies críticas
    if [ -d "backend/node_modules/drizzle-kit" ]; then
        echo "   ✅ drizzle-kit instalado"
    else
        echo "   ❌ drizzle-kit NO instalado (problema con NODE_ENV=production)"
    fi
    
    if [ -d "backend/node_modules/tsx" ]; then
        echo "   ✅ tsx instalado"
    else
        echo "   ❌ tsx NO instalado"
    fi
else
    echo "   ❌ No instaladas (ejecutar: cd backend && npm install)"
fi
echo ""

# 4. Archivos .env
echo "4️⃣  Archivos de configuración:"
if [ -f ".env" ]; then
    echo "   ✅ Frontend .env existe"
else
    echo "   ⚠️  Frontend .env no existe (copiar de .env.example)"
fi

if [ -f "backend/.env" ]; then
    echo "   ✅ Backend .env existe"
    BACKEND_NODE_ENV=$(grep "^NODE_ENV=" backend/.env | cut -d'=' -f2)
    if [ ! -z "$BACKEND_NODE_ENV" ]; then
        echo "      NODE_ENV en .env: $BACKEND_NODE_ENV"
    fi
else
    echo "   ⚠️  Backend .env no existe (copiar de backend/.env.example)"
fi
echo ""

# 5. Servicios de base de datos
echo "5️⃣  Servicios de Base de Datos:"
if timeout 2 bash -c 'cat < /dev/null > /dev/tcp/localhost/5432' 2>/dev/null; then
    echo "   ✅ PostgreSQL respondiendo en localhost:5432"
else
    echo "   ❌ PostgreSQL NO responde en localhost:5432"
    echo "      Ejecutar: docker-compose up -d postgres (desde fuera del DevContainer)"
fi

if timeout 2 bash -c 'cat < /dev/null > /dev/tcp/localhost/6379' 2>/dev/null; then
    echo "   ✅ Redis respondiendo en localhost:6379"
else
    echo "   ❌ Redis NO responde en localhost:6379"
    echo "      Ejecutar: docker-compose up -d redis (desde fuera del DevContainer)"
fi
echo ""

# 6. Node y npm versions
echo "6️⃣  Versiones:"
echo "   Node: $(node --version)"
echo "   NPM: $(npm --version)"
echo ""

echo "========================================"
echo "📚 Ver documentación completa en: docs_readme/CONFIGURACION_ENTORNO.md"
