#!/usr/bin/env bash
set -e

grn=$'\e[1;32m'
yel=$'\e[1;33m'
blu=$'\e[1;34m'
end=$'\e[0m'

CURRENT_DIR=$(basename $PWD)

echo "${yel}Inicializando Terraform para destruição de recursos utilizados pela aplicação no Localstack${end}"
docker container run --rm -it -v $PWD/test/integration/fixture/terraform:/app -w /app --entrypoint '' --link localstack_main --env TF_VAR_HOST=localstack_main --network "$CURRENT_DIR"_integration_test_network hashicorp/terraform:light terraform destroy -lock=false -auto-approve

echo "${yel}Inicializando destruição dos containers do Localstack e da aplicação${end}"
docker-compose -f test/integration/fixture/docker-compose.yml --project-directory . down

echo "${yel}Remoção dos arquivos gerados pelos recursos e ambiente para os testes integrados${end}"
rm -rf test/integration/fixture/terraform/.terraform test/integration/fixture/terraform/terraform.tfstate* test/integration/fixture/.localstack test/integration/.localstack

echo "${grn}Recursos destruídos com Sucesso${end}"