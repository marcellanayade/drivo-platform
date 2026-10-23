#!/bin/sh

echo "Aplicando as migrations no banco..."
npx prisma migrate deploy

echo "Rodando o seed..."
node dist/prisma/seed.js

echo "Subindo a API..."
node dist/src/server.js
