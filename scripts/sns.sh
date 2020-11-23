#!/usr/bin/env bash
set -e

aws sns  --endpoint-url=http://localhost:4566 create-topic --name events