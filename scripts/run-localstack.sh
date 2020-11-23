#!/usr/bin/env bash
set -e

export AWS_ACCESS_KEY_ID="awseventstream"
export AWS_SECRET_ACCESS_KEY="awseventstream"
echo 'AWS_ACCESS_KEY_ID: '
echo ${AWS_ACCESS_KEY_ID}
echo 'AWS_SECRET_ACCESS_KEY: '
echo ${AWS_SECRET_ACCESS_KEY}
docker-compose -f ./test/integration/docker-compose.yml up -d