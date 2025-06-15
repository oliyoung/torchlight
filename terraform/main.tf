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

# Individual secrets for each environment variable
locals {
  app_secrets = jsondecode(var.app_secrets_json)
}

# Create individual secrets for each environment variable
resource "aws_secretsmanager_secret" "database_url" {
  name        = "wisegrowth-database-url"
  description = "Database URL for WiseGrowth"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = local.app_secrets.DATABASE_URL
}

resource "aws_secretsmanager_secret" "supabase_url" {
  name        = "wisegrowth-supabase-url"
  description = "Supabase URL for WiseGrowth"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "supabase_url" {
  secret_id     = aws_secretsmanager_secret.supabase_url.id
  secret_string = local.app_secrets.NEXT_PUBLIC_SUPABASE_URL
}

resource "aws_secretsmanager_secret" "supabase_anon_key" {
  name        = "wisegrowth-supabase-anon-key"
  description = "Supabase Anonymous Key for WiseGrowth"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "supabase_anon_key" {
  secret_id     = aws_secretsmanager_secret.supabase_anon_key.id
  secret_string = local.app_secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

resource "aws_secretsmanager_secret" "supabase_service_role_key" {
  name        = "wisegrowth-supabase-service-role-key"
  description = "Supabase Service Role Key for WiseGrowth"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "supabase_service_role_key" {
  secret_id     = aws_secretsmanager_secret.supabase_service_role_key.id
  secret_string = local.app_secrets.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
}

resource "aws_secretsmanager_secret" "anthropic_key" {
  name        = "wisegrowth-anthropic-key"
  description = "Anthropic API Key for WiseGrowth"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "anthropic_key" {
  secret_id     = aws_secretsmanager_secret.anthropic_key.id
  secret_string = local.app_secrets.NEXT_PUBLIC_ANTHROPIC_KEY
}

resource "aws_secretsmanager_secret" "anthropic_model" {
  name        = "wisegrowth-anthropic-model"
  description = "Anthropic Model for WiseGrowth"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "anthropic_model" {
  secret_id     = aws_secretsmanager_secret.anthropic_model.id
  secret_string = local.app_secrets.NEXT_PUBLIC_ANTHROPIC_MODEL
}

resource "aws_secretsmanager_secret" "openai_token" {
  name        = "wisegrowth-openai-token"
  description = "OpenAI Token for WiseGrowth"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "openai_token" {
  secret_id     = aws_secretsmanager_secret.openai_token.id
  secret_string = local.app_secrets.NEXT_PUBLIC_OPEN_AI_TOKEN
}

resource "aws_secretsmanager_secret" "openai_model" {
  name        = "wisegrowth-openai-model"
  description = "OpenAI Model for WiseGrowth"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "openai_model" {
  secret_id     = aws_secretsmanager_secret.openai_model.id
  secret_string = local.app_secrets.NEXT_PUBLIC_OPEN_AI_MODEL
}

variable "github_connection_arn" {
  description = "The ARN of the AWS App Runner GitHub connection."
  type        = string
}

variable "app_secrets_json" {
  description = "JSON string with all environment variables"
  type        = string
  sensitive   = true
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

    # You need a GitHub connection ARN here to allow App Runner to pull code
    authentication_configuration {
      connection_arn = var.github_connection_arn
    }

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

          # Environment variables from individual secrets
          runtime_environment_secrets = {
            DATABASE_URL = aws_secretsmanager_secret.database_url.arn
            NEXT_PUBLIC_SUPABASE_URL = aws_secretsmanager_secret.supabase_url.arn
            NEXT_PUBLIC_SUPABASE_ANON_KEY = aws_secretsmanager_secret.supabase_anon_key.arn
            NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = aws_secretsmanager_secret.supabase_service_role_key.arn
            NEXT_PUBLIC_ANTHROPIC_KEY = aws_secretsmanager_secret.anthropic_key.arn
            NEXT_PUBLIC_ANTHROPIC_MODEL = aws_secretsmanager_secret.anthropic_model.arn
            NEXT_PUBLIC_OPEN_AI_TOKEN = aws_secretsmanager_secret.openai_token.arn
            NEXT_PUBLIC_OPEN_AI_MODEL = aws_secretsmanager_secret.openai_model.arn
          }
        }
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
          aws_secretsmanager_secret.database_url.arn,
          aws_secretsmanager_secret.supabase_url.arn,
          aws_secretsmanager_secret.supabase_anon_key.arn,
          aws_secretsmanager_secret.supabase_service_role_key.arn,
          aws_secretsmanager_secret.anthropic_key.arn,
          aws_secretsmanager_secret.anthropic_model.arn,
          aws_secretsmanager_secret.openai_token.arn,
          aws_secretsmanager_secret.openai_model.arn
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

output "app_secrets_arns" {
  description = "ARNs of the created secrets manager secrets"
  value = {
    database_url = aws_secretsmanager_secret.database_url.arn
    supabase_url = aws_secretsmanager_secret.supabase_url.arn
    supabase_anon_key = aws_secretsmanager_secret.supabase_anon_key.arn
    supabase_service_role_key = aws_secretsmanager_secret.supabase_service_role_key.arn
    anthropic_key = aws_secretsmanager_secret.anthropic_key.arn
    anthropic_model = aws_secretsmanager_secret.anthropic_model.arn
    openai_token = aws_secretsmanager_secret.openai_token.arn
    openai_model = aws_secretsmanager_secret.openai_model.arn
  }
  sensitive = true
}
