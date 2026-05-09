#!/bin/bash
# Script para verificar el estado del proyecto localmente antes de subir cambios (Simulando CI)

echo "🚀 Iniciando verificación local..."

# 1. Instalar dependencias y sincronizar lockfile
echo "📦 Instalando dependencias..."
npm install --silent

# 2. Verificar formato
echo "🎨 Verificando formato..."
npx prettier --check "src/**/*.{ts,html,css}"
if [ $? -ne 0 ]; then
  echo "❌ Error de formato. Ejecuta 'npx prettier --write .' para corregirlo."
  exit 1
fi

# 3. Ejecutar tests
echo "🧪 Ejecutando tests..."
npm test -- --watch=false
if [ $? -ne 0 ]; then
  echo "❌ Los tests han fallado."
  exit 1
fi

# 4. Verificar compilación
echo "🏗️ Verificando compilación..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ La compilación ha fallado."
  exit 1
fi

echo "✅ ¡Todo listo! El código está listo para ser subido."
