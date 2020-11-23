#!/usr/bin/env bash
set -e

AWS_DEFAULT_REGION=us-east-1

docker-compose -f ./test/integration/docker-compose.yml up -d
sh ./scripts/sns.sh