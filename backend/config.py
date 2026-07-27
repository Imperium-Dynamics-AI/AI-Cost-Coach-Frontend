"""
Centralized configuration for the Azure Pricing API.
All tunable settings live here to avoid scattering magic strings across modules.
"""

# Azure Retail Prices API
AZURE_PRICES_BASE_URL = "https://prices.azure.com/api/retail/prices"
AZURE_API_VERSION = "2023-01-01-preview"

# Default region for all pricing queries
DEFAULT_REGION = "eastus"

# Cache refresh interval (in hours)
REFRESH_INTERVAL_HOURS = 24

# HTTP client settings
REQUEST_TIMEOUT_SECONDS = 15.0

# Database
SQLITE_FILE_NAME = "azure_prices.db"
SQLITE_URL = f"sqlite:///{SQLITE_FILE_NAME}"
