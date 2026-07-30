"""
Application configuration settings for Azure API and database connections.
"""

AZURE_PRICES_BASE_URL = "https://prices.azure.com/api/retail/prices"
AZURE_API_VERSION = "2023-01-01-preview"
DATABASE_URL = "sqlite:///azure_prices.db"
REFRESH_INTERVAL_HOURS = 24
REQUEST_TIMEOUT_SECONDS = 10.0
