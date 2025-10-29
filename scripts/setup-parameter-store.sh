#!/bin/bash

# AWS Parameter Store Setup Script for PantherKolab
# This script creates parameters in AWS Systems Manager Parameter Store
# Run this in AWS CloudShell or with AWS CLI configured

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  PantherKolab Parameter Store Setup${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Set the AWS region
read -p "AWS Region [default: us-east-1]: " AWS_REGION
AWS_REGION="${AWS_REGION:-us-east-1}"
echo -e "${YELLOW}Using AWS Region: ${AWS_REGION}${NC}"
echo ""

# Parameter prefix
PREFIX="/panther-kolab"
read -p "Environment (dev/staging/prod) [default: dev]: " ENVIRONMENT
ENVIRONMENT="${ENVIRONMENT:-dev}"
FULL_PREFIX="${PREFIX}/${ENVIRONMENT}"

echo -e "${YELLOW}Parameter prefix: ${FULL_PREFIX}${NC}"
echo ""
echo -e "${YELLOW}Parameters will be created as String type by default${NC}"
echo -e "${YELLOW}Mark sensitive values as SecureString when prompted${NC}"
echo ""

# Function to create parameter
create_parameter() {
    local param_name=$1
    local param_value=$2
    local param_type=$3

    echo -e "${BLUE}Creating parameter: ${param_name}${NC}"

    # Check if parameter already exists
    if aws ssm get-parameter --name "${param_name}" --region "${AWS_REGION}" > parameter-script-log.txt; then
        echo -e "${YELLOW}Parameter ${param_name} already exists. Updating...${NC}"
        aws ssm put-parameter \
            --name "${param_name}" \
            --value "${param_value}" \
            --type "${param_type}" \
            --overwrite \
            --region "${AWS_REGION}" > parameter-script-log.txt
    else
        aws ssm put-parameter \
            --name "${param_name}" \
            --value "${param_value}" \
            --type "${param_type}" \
            --region "${AWS_REGION}" > parameter-script-log.txt
    fi

    echo -e "${GREEN}✓ Created/Updated: ${param_name}${NC}"
    echo ""
}

# Main loop
echo -e "${BLUE}Enter parameters one by one. Type 'quit' or 'exit' as parameter name to finish.${NC}"
echo ""

counter=0

while true; do
    echo -e "${YELLOW}─────────────────────────────────────────${NC}"

    # Prompt for parameter name
    read -p "Parameter name (or 'quit' to exit): " param_name

    # Check if user wants to quit
    if [ "$param_name" = "quit" ] || [ "$param_name" = "exit" ] || [ -z "$param_name" ]; then
        break
    fi

    # Construct full parameter path
    full_param_name="${FULL_PREFIX}/${param_name}"

    # Prompt for parameter value
    read -p "Parameter value: " param_value

    # Check if value is empty
    if [ -z "$param_value" ]; then
        echo -e "${RED}Error: Parameter value cannot be empty. Skipping...${NC}"
        echo ""
        continue
    fi

    # Prompt for parameter type
    read -p "Is this a sensitive value? (y/N): " is_sensitive

    if [ "$is_sensitive" = "y" ] || [ "$is_sensitive" = "Y" ]; then
        param_type="SecureString"
    else
        param_type="String"
    fi

    # Create the parameter
    create_parameter "${full_param_name}" "${param_value}" "${param_type}"

    counter=$((counter + 1))
done

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✓ Setup complete!${NC}"
echo -e "${GREEN}  Total parameters created: ${counter}${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}To view all parameters:${NC}"
echo -e "  aws ssm get-parameters-by-path --path \"${FULL_PREFIX}\" --recursive --with-decryption --region ${AWS_REGION}"
echo ""
echo -e "${BLUE}To view a specific parameter:${NC}"
echo -e "  aws ssm get-parameter --name \"${FULL_PREFIX}/your-param-name\" --with-decryption --region ${AWS_REGION}"
echo ""