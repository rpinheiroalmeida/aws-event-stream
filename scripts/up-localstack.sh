#!/usr/bin/env bash
set -e

docker-compose -f ./test/integration/docker-compose.yml up -d
sh ./scripts/sns.sh