resource "aws_ecr_repository" "torchlight" {
  name = "torchlight"
}

resource "aws_iam_role" "apprunner_ecr_access" {
  name = "apprunner-ecr-access-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "apprunner_ecr_access_policy" {
  name = "apprunner-ecr-access-policy"
  role = aws_iam_role.apprunner_ecr_access.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "github_connection_arn" {
  description = "The ARN of the AWS App Runner GitHub connection."
  type        = string
  default     = "arn:aws:apprunner:us-east-1:390403881775:connection/Github/d7dae44c4f644e24909565ce85c3b640"
}

variable "github_repository_url" {
  description = "The GitHub repository URL for the source code."
  type        = string
  default     = "https://github.com/oliyoung/torchlight"
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

variable "anthropic_model" {
  description = "Anthropic Model"
  type        = string
  default     = "claude-sonnet-4-20250514"
}

variable "anthropic_key" {
  description = "Anthropic API key"
  type        = string
  sensitive   = true
}

variable "open_ai_model" {
  description = "Open AI Model"
  default     = "openai/gpt-4.1"
  type        = string
  sensitive   = false
}

variable "open_ai_token" {
  description = "Open AI Token"
  type        = string
  sensitive   = false
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase Service Role Key"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase URL"
  type        = string
  sensitive   = false
  default     = "https://ztcrnuxprcxwbvnwxdoj.supabase.co"
}

variable "aws_account_id" {
  description = "Your AWS account ID (should match the AWS_ACCOUNT_ID GitHub secret)"
  type        = string
  default     = "390403881775"
}

resource "aws_apprunner_service" "app_service" {
  service_name = "torchlight-service"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr_access.arn
    }
    auto_deployments_enabled = true

    image_repository {
      # Uses the ECR image built and pushed by GitHub Actions. Ensure AWS_ACCOUNT_ID is set as a GitHub secret.
      image_identifier      = "${var.aws_account_id}.dkr.ecr.us-east-1.amazonaws.com/torchlight:latest"
      image_repository_type = "ECR"
      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          NODE_ENV                              = "production"
          NEXT_TELEMETRY_DISABLED               = "1"
          NEXT_PUBLIC_SUPABASE_URL              = var.supabase_url
          NEXT_PUBLIC_SUPABASE_ANON_KEY         = var.supabase_anon_key
          NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = var.supabase_service_role_key
          NEXT_PUBLIC_ANTHROPIC_KEY             = var.anthropic_key
          NEXT_PUBLIC_ANTHROPIC_MODEL           = var.anthropic_model
          NEXT_PUBLIC_OPEN_AI_MODEL             = var.open_ai_model
          NEXT_PUBLIC_OPEN_AI_TOKEN             = var.open_ai_token
        }
      }
    }
  }

  instance_configuration {
    cpu    = "1024"
    memory = "2048"
  }

  health_check_configuration {
    protocol            = "TCP"
    path                = "/"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  tags = {
    Environment = var.environment
    Project     = "torchlight"
    ManagedBy   = "terraform"
  }
}


# Output the App Runner Service URL
output "apprunner_service_url" {
  description = "The URL of the deployed App Runner service"
  value       = aws_apprunner_service.app_service.service_url
}

