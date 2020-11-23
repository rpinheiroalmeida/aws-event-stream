
aws-event-stream is an open source library to create Event Stores that works with AWS (at the moment, DynamoDB and SQS).

## Installing

```sh
npm install --save aws-event-stream
```

## Integration Test
Steps:
- TMPDIR=/private$TMPDIR docker-compose up
- npm run test:integration:jest
- aws dynamodb  --endpoint-url=http://localhost:4566 scan --table-name events-now
- aws sns --endpoint-url=http://localhost:4566 list-topics
