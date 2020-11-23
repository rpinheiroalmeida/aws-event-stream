#!/usr/bin/env bash
set -e

aws --version
echo 'listing topics:'
aws sns --endpoint-url=http://localhost:4566 list-topics
echo 'Creating topic...'
aws sns --endpoint-url=http://localhost:4566 create-topic --name events