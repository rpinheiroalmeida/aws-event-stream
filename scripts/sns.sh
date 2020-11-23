#!/usr/bin/env bash
set -e

echo 'listing topics:'
aws sns list-topics
echo 'Creating topic...'
aws sns --endpoint-url=http://localhost:4566 create-topic --name events