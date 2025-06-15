terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure for production use
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "wisegrowth/terraform.tfstate"
  #   region = "us-east-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt = true
  # }
}

provider "aws" {
  region = var.aws_region
}

# Define a secret in AWS Secrets Manager for environment variables
resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "wisegrowth-app-secrets"
  description = "Secrets for the wisegrowth App Runner service"

  recovery_window_in_days = 0 # Set to a value > 0 for production
}

# Store the actual secret value (e.g., DATABASE_URL and other variables)
resource "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id = aws_secretsmanager_secret.app_secrets.id

  # Add all your environment variables here in JSON format
  secret_string = var.app_secrets_json
}

variable "github_connection_arn" {
  description = "The ARN of the AWS App Runner GitHub connection."
  type        = string
}

variable "app_secrets_json" {
  description = "JSON string containing application secrets (e.g., DATABASE_URL)."
  type        = string
  sensitive   = true # Mark as sensitive so it's not shown in logs/state
}

variable "github_repository_url" {
  description = "The GitHub repository URL for the source code."
  type        = string
  default     = "https://github.com/oliyoung/congenial-carnival"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
  default     = "production"
}

# Define the AWS App Runner Service
resource "aws_apprunner_service" "app_service" {
  service_name = "wisegrowth-service"

  source_configuration {
    auto_deployments_enabled = true # Set to false if you want manual deployments

    code_repository {
      repository_url = var.github_repository_url
      source_code_version {
        type  = "BRANCH"
        value = "main"
      }
      code_configuration {
        configuration_source = "REPOSITORY" # Use apprunner.yaml from repository

        code_configuration_values {
          runtime = "NODEJS_18"

          # Environment variables from Secrets Manager
          # App Runner will inject these automatically when using instance role
          runtime_environment_secrets = {
            DATABASE_URL = "${aws_secretsmanager_secret.app_secrets.arn}:DATABASE_URL::"
            NEXT_PUBLIC_SUPABASE_URL = "${aws_secretsmanager_secret.app_secrets.arn}:NEXT_PUBLIC_SUPABASE_URL::"
            NEXT_PUBLIC_SUPABASE_ANON_KEY = "${aws_secretsmanager_secret.app_secrets.arn}:NEXT_PUBLIC_SUPABASE_ANON_KEY::"
            NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = "${aws_secretsmanager_secret.app_secrets.arn}:NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY::"
            NEXT_PUBLIC_ANTHROPIC_KEY = "${aws_secretsmanager_secret.app_secrets.arn}:NEXT_PUBLIC_ANTHROPIC_KEY::"
            NEXT_PUBLIC_ANTHROPIC_MODEL = "${aws_secretsmanager_secret.app_secrets.arn}:NEXT_PUBLIC_ANTHROPIC_MODEL::"
            NEXT_PUBLIC_OPEN_AI_TOKEN = "${aws_secretsmanager_secret.app_secrets.arn}:NEXT_PUBLIC_OPEN_AI_TOKEN::"
            NEXT_PUBLIC_OPEN_AI_MODEL = "${aws_secretsmanager_secret.app_secrets.arn}:NEXT_PUBLIC_OPEN_AI_MODEL::"
          }
        }
      }
      # You need a GitHub connection ARN here to allow App Runner to pull code
      authentication_configuration {
        connection_arn = var.github_connection_arn
      }
    }
  }


  # Link the IAM role that allows App Runner to access secrets
  instance_configuration {
    cpu               = "1024" # 1 vCPU
    memory            = "2048" # 2 GB
    instance_role_arn = aws_iam_role.apprunner_instance_role.arn
  }

  health_check_configuration {
    protocol = "TCP" # Or HTTP if you have a specific health check endpoint
    path     = "/"   # Health check path if using HTTP
    interval = 10
    timeout  = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  tags = {
    Environment = var.environment
    Project     = "wisegrowth"
    ManagedBy   = "terraform"
  }
}

# IAM role for App Runner instance to access secrets
resource "aws_iam_role" "apprunner_instance_role" {
  name = "wisegrowth-apprunner-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Project     = "wisegrowth"
    ManagedBy   = "terraform"
  }
}

# IAM policy to allow App Runner to read secrets
resource "aws_iam_role_policy" "apprunner_secrets_policy" {
  name = "wisegrowth-apprunner-secrets-policy"
  role = aws_iam_role.apprunner_instance_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.app_secrets.arn
        ]
      }
    ]
  })
}

# Output the App Runner Service URL
output "apprunner_service_url" {
  description = "The URL of the deployed App Runner service"
  value       = aws_apprunner_service.app_service.service_url
}

output "secrets_manager_secret_arn" {
  description = "The ARN of the secrets manager secret"
  value       = aws_secretsmanager_secret.app_secrets.arn
  sensitive   = true
}
