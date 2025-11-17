#!/bin/bash

# PantherKolab DynamoDB Tables Deletion Script
# WARNING: This will delete all tables and their data!

set -e  # Exit on error

# Configuration
REGION="${AWS_REGION:-us-east-1}"
ENV="${ENVIRONMENT:-dev}"

echo "========================================="
echo "⚠️  WARNING: DynamoDB Table Deletion"
echo "========================================="
echo "This will DELETE the following tables:"
echo "  - PantherKolab-Users-${ENV}"
echo "  - PantherKolab-Conversations-${ENV}"
echo "  - PantherKolab-Messages-${ENV}"
echo "  - PantherKolab-Groups-${ENV}"
echo ""
echo "Region: $REGION"
echo "Environment: $ENV"
echo "========================================="
echo ""

# Ask for confirmation
read -p "Are you sure you want to delete these tables? (type 'DELETE' to confirm): " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    echo "Deletion cancelled."
    exit 0
fi

echo ""
echo "Deleting tables..."

# Function to delete table if exists
delete_table() {
    TABLE_NAME=$1
    if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" > /dev/null 2>&1; then
        echo "Deleting $TABLE_NAME..."
        aws dynamodb delete-table --table-name "$TABLE_NAME" --region "$REGION"
        echo "✅ Deleted $TABLE_NAME"
    else
        echo "⚠️  Table $TABLE_NAME does not exist, skipping..."
    fi
}

# Delete all tables
delete_table "PantherKolab-Users-${ENV}"
delete_table "PantherKolab-Conversations-${ENV}"
delete_table "PantherKolab-Messages-${ENV}"
delete_table "PantherKolab-Groups-${ENV}"

echo ""
echo "========================================="
echo "✅ All tables deletion initiated"
echo "========================================="
echo ""
echo "Note: Tables may take a few moments to fully delete."
echo "You can check status with: aws dynamodb list-tables --region $REGION"
echo ""
