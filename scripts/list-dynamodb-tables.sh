#!/bin/bash

# PantherKolab DynamoDB Tables List Script
# Shows all PantherKolab tables and their status

set -e  # Exit on error

# Configuration
REGION="${AWS_REGION:-us-east-1}"
ENV="${ENVIRONMENT:-dev}"

echo "========================================="
echo "PantherKolab DynamoDB Tables"
echo "========================================="
echo "Region: $REGION"
echo "Environment: $ENV"
echo "========================================="
echo ""

# Function to get table info
get_table_info() {
    TABLE_NAME=$1
    if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" > /dev/null 2>&1; then
        STATUS=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query 'Table.TableStatus' --output text)
        ITEM_COUNT=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query 'Table.ItemCount' --output text)
        SIZE=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query 'Table.TableSizeBytes' --output text)
        SIZE_MB=$((SIZE / 1024 / 1024))

        echo "✅ $TABLE_NAME"
        echo "   Status: $STATUS"
        echo "   Items: $ITEM_COUNT"
        echo "   Size: ${SIZE_MB}MB"
        echo ""
    else
        echo "❌ $TABLE_NAME - NOT FOUND"
        echo ""
    fi
}

# Check all tables
get_table_info "PantherKolab-Users-${ENV}"
get_table_info "PantherKolab-Conversations-${ENV}"
get_table_info "PantherKolab-Messages-${ENV}"
get_table_info "PantherKolab-Groups-${ENV}"

echo "========================================="
echo ""
