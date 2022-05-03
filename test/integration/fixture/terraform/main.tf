variable "HOST" {
  default = "localhost"
}

terraform {
  backend "local" {}
}

provider "aws" {
  access_key                  = "mock_access_key"
  secret_key                  = "mock_secret_key"
  region                      = "us-east-1"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    dynamodb       = "http://${var.HOST}:4566"
    sns            = "http://${var.HOST}:4566"
    sqs            = "http://${var.HOST}:4566"
  }
}

resource "aws_sns_topic" "order-events" {
  name = "order-events"
}

resource "aws_sqs_queue" "order-events-placed" {
    name = "order-events-placed"
}

resource "aws_dynamodb_table" "order-events" {
  name           = "order-events"
  hash_key       = "aggregation_streamid"
  range_key      = "commitTimestamp"
  read_capacity  = 1
  write_capacity = 1

  attribute {
    name = "aggregation_streamid"
    type = "S"
  }

  attribute {
    name = "commitTimestamp"
    type = "N"
  }
}

resource "aws_sns_topic_subscription" "order-placed" {
  topic_arn = aws_sns_topic.order-events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.order-events-placed.arn
}