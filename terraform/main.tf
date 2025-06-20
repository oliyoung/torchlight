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
  service_name = "torchlight-service"

  source_configuration {
    auto_deployments_enabled = true

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
        configuration_source = "DOCKERFILE"
      }
    }
  }

  instance_configuration {
    cpu    = "1024"
    memory = "2048"
  }

  health_check_configuration {
    protocol = "TCP"
    path     = "/"
    interval = 10
    timeout  = 5
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

