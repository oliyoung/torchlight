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

variable "anthropic_model" {
  description = "Anthropic Model"
  type = string
  default = "claude-sonnet-4-20250514"
}

variable "anthropic_key" {
  description = "Anthropic API key"
  type        = string
  sensitive   = true
}

variable "open_ai_model" {
  description = "Open AI Model"
  default = "openai/gpt-4.1"
  type = string
  sensitive = false
}

variable "open_ai_token" {
  description = "Open AI Token"
  type = string
  sensitive = false
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase Service Role Key"
  type =  string
  sensitive = true
}

variable "supabase_url" {
  description = "Supabase URL"
  type        = string
  sensitive = false
  default = "https://ztcrnuxprcxwbvnwxdoj.supabase.co"
}

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

          # Environment variables - set directly in Terraform
          runtime_environment_variables = {
            NODE_ENV = "production"
            NEXT_TELEMETRY_DISABLED = "1"
            # Add your required environment variables here
            NEXT_PUBLIC_SUPABASE_URL = var.supabase_url
            NEXT_PUBLIC_SUPABASE_ANON_KEY = var.supabase_anon_key
            NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = var.supabase_service_role_key
            NEXT_PUBLIC_ANTHROPIC_KEY = var.anthropic_key
            NEXT_PUBLIC_ANTHROPIC_MODEL = var.anthropic_model
            # Add other vars as needed
            NEXT_PUBLIC_OPEN_AI_MODEL = var.open_ai_model
            NEXT_PUBLIC_OPEN_AI_TOKEN = var.open_ai_token
          }
        }
      }
    }
  }

  instance_configuration {
    cpu    = "1024" # 1 vCPU
    memory = "2048" # 2 GB
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


# Output the App Runner Service URL
output "apprunner_service_url" {
  description = "The URL of the deployed App Runner service"
  value       = aws_apprunner_service.app_service.service_url
}

