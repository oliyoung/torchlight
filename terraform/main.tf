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

# Reference existing AWS secrets instead of creating new ones
# This assumes secrets are already created in AWS Secrets Manager/Parameter Store

variable "github_connection_arn" {
  description = "The ARN of the AWS App Runner GitHub connection."
  type        = string
}

# Variables for existing AWS secrets
variable "database_secret_arn" {
  description = "ARN of existing DATABASE_URL secret in AWS Secrets Manager"
  type        = string
}

variable "supabase_secrets_arn" {
  description = "ARN of existing Supabase secrets in AWS Secrets Manager"
  type        = string
}

variable "ai_secrets_arn" {
  description = "ARN of existing AI provider secrets in AWS Secrets Manager"
  type        = string
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

          # Environment variables from existing AWS secrets
          # App Runner will inject these automatically when using instance role
          runtime_environment_secrets = {
            # Database secret
            DATABASE_URL = "${var.database_secret_arn}:DATABASE_URL::"
            
            # Supabase secrets
            NEXT_PUBLIC_SUPABASE_URL = "${var.supabase_secrets_arn}:NEXT_PUBLIC_SUPABASE_URL::"
            NEXT_PUBLIC_SUPABASE_ANON_KEY = "${var.supabase_secrets_arn}:NEXT_PUBLIC_SUPABASE_ANON_KEY::"
            NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = "${var.supabase_secrets_arn}:NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY::"
            
            # AI provider secrets
            NEXT_PUBLIC_ANTHROPIC_KEY = "${var.ai_secrets_arn}:NEXT_PUBLIC_ANTHROPIC_KEY::"
            NEXT_PUBLIC_ANTHROPIC_MODEL = "${var.ai_secrets_arn}:NEXT_PUBLIC_ANTHROPIC_MODEL::"
            NEXT_PUBLIC_OPEN_AI_TOKEN = "${var.ai_secrets_arn}:NEXT_PUBLIC_OPEN_AI_TOKEN::"
            NEXT_PUBLIC_OPEN_AI_MODEL = "${var.ai_secrets_arn}:NEXT_PUBLIC_OPEN_AI_MODEL::"
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
          var.database_secret_arn,
          var.supabase_secrets_arn,
          var.ai_secrets_arn
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

output "referenced_secret_arns" {
  description = "The ARNs of the secrets being referenced"
  value = {
    database = var.database_secret_arn
    supabase = var.supabase_secrets_arn
    ai       = var.ai_secrets_arn
  }
  sensitive = true
}
