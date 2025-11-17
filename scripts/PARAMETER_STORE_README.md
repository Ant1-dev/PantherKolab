# AWS Parameter Store Setup Guide

This guide explains how to use AWS Parameter Store instead of local `.env` files for managing PantherKolab configuration.

## Why Parameter Store?

- **Security**: Store sensitive values encrypted in AWS
- **Centralized**: Single source of truth for configuration
- **Environment Management**: Easy dev/staging/prod separation
- **Access Control**: IAM-based permissions
- **Audit Trail**: Track who accessed/modified parameters

## Prerequisites

- AWS CLI installed and configured
- AWS credentials with Parameter Store permissions
- IAM permissions: `ssm:PutParameter`, `ssm:GetParameter`, `ssm:GetParametersByPath`

## Scripts

### 1. `setup-parameter-store.sh`

Creates parameters in AWS Parameter Store interactively.

**Usage:**

```bash
# In AWS CloudShell or local terminal with AWS CLI
cd scripts
chmod +x setup-parameter-store.sh
./setup-parameter-store.sh
```

**What it does:**
1. Prompts for AWS region and environment (dev/staging/prod)
2. Asks for parameter names and values one by one
3. Lets you mark sensitive values as `SecureString`
4. Creates parameters with prefix: `/panther-kolab/{environment}/`
5. Continues until you type `quit` or `exit`

**Example session:**

```
AWS Region [default: us-east-1]:
Environment (dev/staging/prod) [default: dev]: dev
Parameter prefix: /panther-kolab/dev

Parameter name (or 'quit' to exit): cognito/user-pool-id
Parameter value: us-east-1_4fWvgNvC3
Is this a sensitive value? (y/N): n
✓ Created/Updated: /panther-kolab/dev/cognito/user-pool-id

Parameter name (or 'quit' to exit): cognito/client-id
Parameter value: 2fahfmaruotenn36rnavjm51s5
Is this a sensitive value? (y/N): y
✓ Created/Updated: /panther-kolab/dev/cognito/client-id

Parameter name (or 'quit' to exit): quit
```

### 2. `fetch-parameters.sh`

Retrieves parameters from AWS Parameter Store and optionally creates `.env.local`.

**Usage:**

```bash
cd scripts
chmod +x fetch-parameters.sh
./fetch-parameters.sh
```

**What it does:**
1. Prompts for AWS region and environment
2. Fetches all parameters from `/panther-kolab/{environment}/`
3. Displays parameters (masks sensitive values)
4. Optionally creates/updates `.env.local` file

## Recommended Parameters

Here are the parameters you should create:

### AWS Configuration
- `aws-region` → AWS region (e.g., `us-east-1`)

### Cognito Parameters
- `cognito/user-pool-id` → Cognito User Pool ID
- `cognito/client-id` → Cognito App Client ID (mark as sensitive)
- `cognito/domain` → Cognito Domain URL

### DynamoDB Tables
- `dynamodb/users-table` → Users table name
- `dynamodb/conversations-table` → Conversations table name
- `dynamodb/messages-table` → Messages table name
- `dynamodb/groups-table` → Groups table name

### Application URLs
- `app-urls/redirect-sign-in` → Post-login redirect URL
- `app-urls/redirect-sign-out` → Post-logout redirect URL

### AppSync (when ready)
- `appsync/graphql-endpoint` → AppSync GraphQL endpoint
- `appsync/api-key` → AppSync API key (mark as sensitive)

## Parameter Naming Convention

Parameters follow this structure:
```
/panther-kolab/{environment}/{category}/{parameter-name}
```

Examples:
- `/panther-kolab/dev/cognito/user-pool-id`
- `/panther-kolab/prod/dynamodb/messages-table`
- `/panther-kolab/staging/appsync/graphql-endpoint`

## Environment Variable Mapping

The `fetch-parameters.sh` script converts parameters to environment variables:

| Parameter Path | Environment Variable |
|---------------|---------------------|
| `/panther-kolab/dev/cognito/user-pool-id` | `NEXT_PUBLIC_COGNITO_USER_POOL_ID` |
| `/panther-kolab/dev/cognito/client-id` | `NEXT_PUBLIC_COGNITO_CLIENT_ID` |
| `/panther-kolab/dev/dynamodb/users-table` | `NEXT_PUBLIC_DYNAMODB_USERS_TABLE` |

**Conversion rules:**
1. Remove prefix `/panther-kolab/{environment}/`
2. Replace `/` with `_`
3. Replace `-` with `_`
4. Convert to UPPERCASE
5. Add `NEXT_PUBLIC_` prefix for client-accessible values

## Security Best Practices

1. **Mark sensitive values as SecureString:**
   - API keys
   - Client IDs/secrets
   - Access tokens
   - Any credentials

2. **Use IAM roles in production:**
   - Don't use long-term access keys
   - Assign EC2/ECS task roles

3. **Separate environments:**
   - Use different prefixes: `/panther-kolab/dev`, `/panther-kolab/prod`
   - Never share parameters between environments

4. **Restrict access:**
   - Use IAM policies to limit who can read/write parameters
   - Only allow production access to specific users

5. **Never commit `.env.local`:**
   - Already in `.gitignore`
   - Use Parameter Store as the source of truth

## Viewing Parameters in AWS Console

1. Go to AWS Console → Systems Manager → Parameter Store
2. Filter by prefix: `/panther-kolab/`
3. View/edit individual parameters

## AWS CLI Commands

**List all parameters:**
```bash
aws ssm get-parameters-by-path \
  --path "/panther-kolab/dev" \
  --recursive \
  --with-decryption \
  --region us-east-1
```

**Get single parameter:**
```bash
aws ssm get-parameter \
  --name "/panther-kolab/dev/cognito/user-pool-id" \
  --with-decryption \
  --region us-east-1
```

**Delete parameter:**
```bash
aws ssm delete-parameter \
  --name "/panther-kolab/dev/cognito/client-id" \
  --region us-east-1
```

## Integrating with Next.js

After running `fetch-parameters.sh`, your `.env.local` file will be populated with all parameters as environment variables that Next.js can use.

**Alternative: Direct Parameter Store access in Next.js** (future enhancement)

You could create a utility to fetch parameters at build time:

```typescript
// src/lib/aws/parameterStore.ts
import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';

export async function loadParameters(environment: string) {
  const client = new SSMClient({ region: process.env.AWS_REGION });
  const command = new GetParametersByPathCommand({
    Path: `/panther-kolab/${environment}`,
    Recursive: true,
    WithDecryption: true,
  });

  const response = await client.send(command);
  return response.Parameters;
}
```

## Troubleshooting

**Error: Access Denied**
- Check IAM permissions
- Ensure you have `ssm:GetParameter` and `ssm:PutParameter` permissions

**Error: Parameter not found**
- Verify the parameter path is correct
- Check you're using the right region and environment

**Parameters not showing in .env.local**
- Run `fetch-parameters.sh` to regenerate
- Check AWS CLI is configured correctly

## Migration from .env.local

If you have existing `.env.local` values:

1. Run `setup-parameter-store.sh`
2. Enter each parameter name and value from your `.env.local`
3. Delete or backup your `.env.local`
4. Run `fetch-parameters.sh` to verify

## Cost

AWS Parameter Store pricing (as of 2024):
- **Standard parameters**: Free (up to 10,000 parameters)
- **Advanced parameters**: $0.05 per parameter per month
- **API calls**: $0.05 per 10,000 API calls

For PantherKolab's ~10-15 parameters, the cost is **FREE** using standard parameters.

---

**Questions?** Check the [AWS Parameter Store documentation](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
