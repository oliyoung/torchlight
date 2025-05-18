provider "aws" {
  region = "us-east-1" # Change to your desired AWS region
}

# Define a secret in AWS Secrets Manager for environment variables
resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "congenial-carnival-app-secrets"
  description = "Secrets for the Congenial Carnival App Runner service"

  recovery_window_in_days = 0 # Set to a value > 0 for production
}

# Store the actual secret value (e.g., DATABASE_URL and other variables)
resource "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id = aws_secretsmanager_secret.app_secrets.id

  # Add all your environment variables here in JSON format
  # Example: {"DATABASE_URL": "your-supabase-url", "NEXTAUTH_SECRET": "your-nextauth-secret"}
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

# Define the AWS App Runner Service
resource "aws_apprunner_service" "app_service" {
  service_name = "congenial-carnival-service"

  source_configuration {
    auto_deployments_enabled = true # Set to false if you want manual deployments

    image_repository {
      image_identifier = "public.ecr.aws/your-base-image:latest" # Placeholder - App Runner builds from source, but needs a base image idea
      image_repository_type = "ECR_PUBLIC" # Or ECR for private repo
      # No need for ECR details if building from source, remove this block and use code_repository instead
    }

    code_repository {
      repository_url    = "<YOUR_GITHUB_REPO_URL>" # REPLACE WITH YOUR GITHUB REPO URL
      source_code_version {
        type    = "BRANCH"
        value   = "main" # REPLACE WITH YOUR DESIRED BRANCH (e.g., "main")
      }
      code_configuration {
        configuration_source = "API" # Or "REPOSITORY" if you have an apprunner.yaml

        image_configuration {
          port = "3000" # Default Next.js port
          # Command and Entrypoint can be set if needed, but Dockerfile should handle
        }

        # Configure environment variables from Secrets Manager
        runtime_environment_variables = {
             # You don't list individual variables here when using secrets.
             # Instead, you configure the role App Runner uses to access secrets.
             # This part is a bit tricky with App Runner direct secrets access.
             # A common pattern is to pass the Secret ARN as an environment variable
             # and have the application fetch secrets at startup, or use App Runner's instance role.
        }

        # App Runner can automatically inject secrets if configured
        # However, the direct API config doesn't easily support linking secrets
        # by name like this. Using an instance role is the standard secure way.
      }
      # You need a GitHub connection ARN here to allow App Runner to pull code
      authentication_configuration {
        connection_arn = var.github_connection_arn
      }
    }
  }

  instance_configuration {
    cpu    = "1024" # 1 vCPU
    memory = "2048" # 2 GB
  }

  # You'll need to create an instance role that has permissions to read the Secrets Manager secret
  # and configure App Runner to use it. This is typically done via a separate IAM role resource
  # and linking it here. For simplicity, this example omits the IAM role setup,
  # but it is CRITICAL for production.
  # instance_configuration {
  #   instance_role_arn = aws_iam_role.apprunner_instance_role.arn # Link to your IAM role
  # }

  health_check_configuration {
    protocol = "TCP" # Or HTTP if you have a specific health check endpoint
    path     = "/"   # Health check path if using HTTP
    interval = 10
    timeout  = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  tags = {
    Environment = "production"
    Project     = "CongenialCarnival"
  }
}

# Output the App Runner Service URL
output "apprunner_service_url" {
  description = "The URL of the deployed App Runner service"
  value       = aws_apprunner_service.app_service.service_url
}
