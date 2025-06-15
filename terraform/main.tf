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
  
  # Define default values for missing keys
  secrets_with_defaults = {
    NEXT_PUBLIC_SUPABASE_URL = try(local.app_secrets.NEXT_PUBLIC_SUPABASE_URL, "")
    NEXT_PUBLIC_SUPABASE_ANON_KEY = try(local.app_secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY, "")
    NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = try(local.app_secrets.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY, "")
    NEXT_PUBLIC_ANTHROPIC_KEY = try(local.app_secrets.NEXT_PUBLIC_ANTHROPIC_KEY, "")
    NEXT_PUBLIC_ANTHROPIC_MODEL = try(local.app_secrets.NEXT_PUBLIC_ANTHROPIC_MODEL, "claude-3-5-sonnet-20241022")
    NEXT_PUBLIC_OPEN_AI_TOKEN = try(local.app_secrets.NEXT_PUBLIC_OPEN_AI_TOKEN, "")
    NEXT_PUBLIC_OPEN_AI_MODEL = try(local.app_secrets.NEXT_PUBLIC_OPEN_AI_MODEL, "gpt-4")
  }
}

# Reference existing secrets
data "aws_secretsmanager_secret" "supabase_url" {
  name = "wisegrowth-supabase-url"
}

data "aws_secretsmanager_secret" "supabase_anon_key" {
  name = "wisegrowth-supabase-anon-key"
}

data "aws_secretsmanager_secret" "supabase_service_role_key" {
  name = "wisegrowth-supabase-service-role-key"
}

data "aws_secretsmanager_secret" "anthropic_key" {
  name = "wisegrowth-anthropic-key"
}

data "aws_secretsmanager_secret" "anthropic_model" {
  name = "wisegrowth-anthropic-model"
}

data "aws_secretsmanager_secret" "openai_token" {
  name = "wisegrowth-openai-token"
}

data "aws_secretsmanager_secret" "openai_model" {
  name = "wisegrowth-openai-model"
}

# Use existing GitHub connection
data "aws_apprunner_connection" "github" {
  connection_name = "Github"
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
      connection_arn = data.aws_apprunner_connection.github.arn
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
            NEXT_PUBLIC_SUPABASE_URL = data.aws_secretsmanager_secret.supabase_url.arn
            NEXT_PUBLIC_SUPABASE_ANON_KEY = data.aws_secretsmanager_secret.supabase_anon_key.arn
            NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = data.aws_secretsmanager_secret.supabase_service_role_key.arn
            NEXT_PUBLIC_ANTHROPIC_KEY = data.aws_secretsmanager_secret.anthropic_key.arn
            NEXT_PUBLIC_ANTHROPIC_MODEL = data.aws_secretsmanager_secret.anthropic_model.arn
            NEXT_PUBLIC_OPEN_AI_TOKEN = data.aws_secretsmanager_secret.openai_token.arn
            NEXT_PUBLIC_OPEN_AI_MODEL = data.aws_secretsmanager_secret.openai_model.arn
          }
        }
      }
    }
  }


  # Link the IAM role that allows App Runner to access secrets
  instance_configuration {
    cpu               = "1024" # 1 vCPU
    memory            = "2048" # 2 GB
    instance_role_arn = data.aws_iam_role.apprunner_instance_role.arn
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

# Reference existing IAM role for App Runner instance to access secrets
data "aws_iam_role" "apprunner_instance_role" {
  name = "wisegrowth-apprunner-instance-role"
}

# IAM policy to allow App Runner to read secrets
resource "aws_iam_role_policy" "apprunner_secrets_policy" {
  name = "wisegrowth-apprunner-secrets-policy"
  role = data.aws_iam_role.apprunner_instance_role.id

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
          data.aws_secretsmanager_secret.supabase_url.arn,
          data.aws_secretsmanager_secret.supabase_anon_key.arn,
          data.aws_secretsmanager_secret.supabase_service_role_key.arn,
          data.aws_secretsmanager_secret.anthropic_key.arn,
          data.aws_secretsmanager_secret.anthropic_model.arn,
          data.aws_secretsmanager_secret.openai_token.arn,
          data.aws_secretsmanager_secret.openai_model.arn
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
    supabase_url = data.aws_secretsmanager_secret.supabase_url.arn
    supabase_anon_key = data.aws_secretsmanager_secret.supabase_anon_key.arn
    supabase_service_role_key = data.aws_secretsmanager_secret.supabase_service_role_key.arn
    anthropic_key = data.aws_secretsmanager_secret.anthropic_key.arn
    anthropic_model = data.aws_secretsmanager_secret.anthropic_model.arn
    openai_token = data.aws_secretsmanager_secret.openai_token.arn
    openai_model = data.aws_secretsmanager_secret.openai_model.arn
  }
  sensitive = true
}
