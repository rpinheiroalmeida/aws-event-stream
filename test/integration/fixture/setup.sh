#!/usr/bin/env bash
set -e

blu=$'\e[1;34m'
grn=$'\e[1;32m'
yel=$'\e[1;33m'
end=$'\e[0m'

echo "${blu}Inicializando configuração e criação do ambiente para os testes integrados${end}"

# echo "${yel}Avaliando dependências não usadas no projeto${end}"
# npm run test:dependencies
echo "${yel}Instalando dependências do Serverless Framework para o ambiente dos testes integrados${end}"
# npm run sls:install
echo "${yel}Subindo container do Localstack e container para subir a lambda para os testes...${end}"
docker-compose -f test/integration/fixture/docker-compose.yml --project-directory . up -d

echo "${yel}Inicializando a criação dos recursos necessários da AWS no Localstack${end}"
test/integration/fixture/create-resource.sh

echo "${grn}Recursos do ambiente de testes integrados criados com sucesso${end}"