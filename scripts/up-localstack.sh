#!/usr/bin/env bash
set -e

export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID="123456-localstack"
export AWS_SECRET_ACCESS_KEY="123456-localstack"

docker-compose -f ./test/integration/docker-compose.yml up -d
sh ./scripts/sns.sh