#!/usr/bin/env bash
set -e

echo 'Creating topic...'
aws sns  --endpoint-url=http://localhost:4566 create-top    ic --name events