#!/bin/sh
# DevOps Dashboard — Container Health Check Script
# Called by Docker every 30s via the HEALTHCHECK instruction.
# Exit 0 = healthy, Exit 1 = unhealthy.

HEALTH_URL="http://localhost:8080/health"
TIMEOUT=5

response=$(curl --silent \
                --max-time $TIMEOUT \
                --output /dev/null \
                --write-out "%{http_code}" \
                "$HEALTH_URL")

if [ "$response" = "200" ]; then
    echo "Health check passed — HTTP $response"
    exit 0
else
    echo "Health check failed — HTTP $response from $HEALTH_URL"
    exit 1
fi