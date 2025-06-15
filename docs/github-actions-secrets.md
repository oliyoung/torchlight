# GitHub Actions Secrets Configuration

This document outlines all the secrets required for the GitHub Actions workflows to function properly.

## Required Secrets

### AWS Deployment (`deploy.yml`)

#### AWS Credentials
- **`AWS_ACCESS_KEY_ID`** - AWS access key ID for deployment
- **`AWS_SECRET_ACCESS_KEY`** - AWS secret access key for deployment
- **`APP_RUNNER_GITHUB_CONNECTION_ARN`** - ARN of the GitHub connection for AWS App Runner

#### Application Secrets
- **`APP_SECRETS_JSON`** - JSON string containing all application environment variables
  ```json
  {
    "DATABASE_URL": "postgresql://...",
    "NEXT_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJ...",
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY": "eyJ...",
    "NEXT_PUBLIC_ANTHROPIC_KEY": "sk-ant-...",
    "NEXT_PUBLIC_ANTHROPIC_MODEL": "claude-sonnet-4-20250514",
    "NEXT_PUBLIC_OPEN_AI_TOKEN": "sk-...",
    "NEXT_PUBLIC_OPEN_AI_MODEL": "openai/gpt-4.1"
  }
  ```

#### Build Environment Variables
- **`NEXT_PUBLIC_SUPABASE_URL`** - Supabase project URL
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Supabase anonymous key
- **`NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`** - Supabase service role key
- **`DATABASE_URL`** - Database connection string
- **`NEXT_PUBLIC_ANTHROPIC_KEY`** - Anthropic API key for AI features
- **`NEXT_PUBLIC_ANTHROPIC_MODEL`** - Anthropic model name
- **`NEXT_PUBLIC_OPEN_AI_TOKEN`** - OpenAI API token
- **`NEXT_PUBLIC_OPEN_AI_MODEL`** - OpenAI model name

### Supabase Deployments (`supabase-staging.yml`, `supabase-production.yml`)

#### Supabase CLI
- **`SUPABASE_ACCESS_TOKEN`** - Supabase CLI access token

#### Staging Environment
- **`STAGING_DB_PASSWORD`** - Database password for staging
- **`STAGING_PROJECT_ID`** - Supabase project ID for staging

#### Production Environment  
- **`PRODUCTION_DB_PASSWORD`** - Database password for production
- **`PRODUCTION_PROJECT_ID`** - Supabase project ID for production

### Playwright Tests (`playwright.yml`)

#### Test Environment (Optional - only if `ENABLE_SUPABASE_TESTS` is enabled)
- **`NEXT_PUBLIC_SUPABASE_URL`** - Supabase project URL for testing
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Supabase anonymous key for testing
- **`ANTHROPIC_API_KEY`** - Anthropic API key for AI features in tests
- **`OPENAI_API_KEY`** - OpenAI API key (optional)

## Repository Variables

### Playwright Configuration
- **`ENABLE_SUPABASE_TESTS`** - Set to `'true'` to enable real Supabase tests (default: disabled)

## Setup Instructions

### 1. AWS Setup (for `deploy.yml`)

1. **Create AWS User with App Runner permissions:**
   ```bash
   # Create IAM user for GitHub Actions
   aws iam create-user --user-name github-actions-wisegrowth
   
   # Attach policies
   aws iam attach-user-policy --user-name github-actions-wisegrowth \
     --policy-arn arn:aws:iam::aws:policy/AWSAppRunnerFullAccess
   
   # Create access keys
   aws iam create-access-key --user-name github-actions-wisegrowth
   ```

2. **Create GitHub Connection in AWS App Runner:**
   - Go to AWS App Runner console
   - Create a GitHub connection
   - Note the ARN for `APP_RUNNER_GITHUB_CONNECTION_ARN`

3. **Update Terraform variables:**
   - The repository URL is automatically set from GitHub context
   - No manual configuration needed

### 2. Supabase Setup

1. **Get Supabase CLI access token:**
   ```bash
   supabase login
   supabase projects list --experimental
   ```

2. **Get project credentials:**
   - Project ID: From Supabase dashboard URL
   - Database password: From Supabase dashboard → Settings → Database

### 3. GitHub Repository Configuration

1. **Add secrets to GitHub repository:**
   - Go to repository → Settings → Secrets and variables → Actions
   - Add all required secrets listed above

2. **Add repository variables:**
   - Go to repository → Settings → Secrets and variables → Actions → Variables tab
   - Add `ENABLE_SUPABASE_TESTS` if you want to enable real Supabase tests

## Security Notes

- ⚠️ **Never commit secrets to the repository**
- 🔒 **Use least-privilege IAM policies for AWS access**
- 🔄 **Rotate secrets regularly**
- 📝 **Document any changes to required secrets**
- 🧪 **Test deployment in staging environment first**

## Troubleshooting

### Common Issues

1. **Terraform fails with "connection_arn" error:**
   - Ensure `APP_RUNNER_GITHUB_CONNECTION_ARN` is set correctly
   - Verify GitHub connection exists in AWS App Runner console

2. **Build fails with missing environment variables:**
   - Check that all `NEXT_PUBLIC_*` variables are set
   - Verify `APP_SECRETS_JSON` contains all required keys

3. **Supabase deployment fails:**
   - Verify `SUPABASE_ACCESS_TOKEN` is valid
   - Check project IDs are correct
   - Ensure database passwords are current

4. **Playwright tests fail:**
   - Verify test user creation script works
   - Check Supabase allows user registration
   - Ensure all test environment variables are set

## Example Secret Values

```bash
# AWS (replace with your actual values)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
APP_RUNNER_GITHUB_CONNECTION_ARN=arn:aws:apprunner:us-east-1:123456789012:connection/my-connection

# Supabase
SUPABASE_ACCESS_TOKEN=sbp_1234567890abcdef
STAGING_PROJECT_ID=abcdefghijklmnopqrst
PRODUCTION_PROJECT_ID=uvwxyzabcdefghijklmn
```

For more information, see the individual workflow files in `.github/workflows/`.