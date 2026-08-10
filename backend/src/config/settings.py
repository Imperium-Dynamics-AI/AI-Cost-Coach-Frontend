import os
from dotenv import load_dotenv

load_dotenv()

AZURE_PRICES_BASE_URL = "https://prices.azure.com/api/retail/prices"
AZURE_API_VERSION = "2023-01-01-preview"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///azure_prices.db")
REFRESH_INTERVAL_HOURS = 24
REQUEST_TIMEOUT_SECONDS = 15.0

# Azure Tenant & Subscription settings
AZURE_TENANT_ID = os.getenv("AZURE_TENANT_ID", "")
AZURE_DEFAULT_SUBSCRIPTIONS = [
    sub.strip()
    for sub in os.getenv("AZURE_DEFAULT_SUBSCRIPTIONS", "").split(",")
    if sub.strip()
]
AZURE_DEFAULT_REGION = os.getenv("AZURE_DEFAULT_REGION", "eastus")
AZURE_DEFAULT_CURRENCY = os.getenv("AZURE_DEFAULT_CURRENCY", "USD")

