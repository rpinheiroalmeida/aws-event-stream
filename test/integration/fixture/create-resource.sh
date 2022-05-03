#!/usr/bin/env bash
set -e

grn=$'\e[1;32m'
yel=$'\e[1;33m'
blu=$'\e[1;34m'
end=$'\e[0m'

CURRENT_DIR=$(basename $PWD)

# Executa terraform num container -> docker container run -it -v c:\linuxtips\terraform\dia02:/app -w /app --entrypoint "" hashicorp/terraform:light sh
# Lista DynamoDb Tables -> aws dynamodb --endpoint-url http://localhost:4569 --no-verify-ssl list-tables
# Aplica plano sem aprovação -> terraform apply -lock=false -auto-approve
# Destrói o que estiver provisionado sem aprovação -> terraform destroy -lock=false -auto-approve
# Busca um registro específico no DynamoDB aws dynamodb --endpoint-url http://localhost:4569 get-item --table-name financial-services-payment-link-storage-local --key '{ "identifier": {"S": "2f4c1880-ead3-4fde-a602-611b2bfbcada"} }'
# aws dynamodb --endpoint-url http://localhost:4569 query --table-name financial-services-payment-context-storage-local --key-condition-expression "orderId = :v1" --expression-attribute-values '{ ":v1": {"S": "12345"} }' --index-name orderId_idx
sleep 10 # Tempo para aguardar subir os serviços da AWS no Localstack

echo "${blu}HealthCheck dos serviços da AWS no Localstack${end}"
curl http://localhost:4566/health | jq || true

echo "${yel}Analisando a sintaxe e código dos scripts terraform (Linter)${end}"
docker container run --rm -i -v $PWD/test/integration/fixture/terraform:/app -w /app --entrypoint "" wata727/tflint:0.23.1 tflint

echo "${yel}Inicializando Terreaform para criação de recursos e inclusão de dados necessários pela aplicação no Localstack${end}"
docker container run --rm -i -v $PWD/test/integration/fixture/terraform:/app -w /app --entrypoint "" --link localstack_main --env TF_VAR_HOST=localstack_main --network "$CURRENT_DIR"_integration_test_network hashicorp/terraform:light terraform init
docker container run --rm -i -v $PWD/test/integration/fixture/terraform:/app -w /app --entrypoint "" --link localstack_main --env TF_VAR_HOST=localstack_main --network "$CURRENT_DIR"_integration_test_network hashicorp/terraform:light terraform plan
docker container run --rm -i -v $PWD/test/integration/fixture/terraform:/app -w /app --entrypoint "" --link localstack_main --env TF_VAR_HOST=localstack_main --network "$CURRENT_DIR"_integration_test_network hashicorp/terraform:light terraform apply -lock=false -auto-approve
echo "${yel}Recursos criados no Localstack com Sucesso${end}"

echo "${grn}QUEUES${end}"
aws sqs --endpoint-url=http://localhost:4566 list-queues

echo "${grn}SNSs${end}"
aws sns --endpoint-url=http://localhost:4566 list-subscriptions
