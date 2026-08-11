"""
Enrichers package initialization — registers all ARM enrichers.
"""

from src.services.enrichers.base import BaseEnricher, EnricherRegistry
from src.services.enrichers.cognitive_services import CognitiveServicesEnricher
from src.services.enrichers.search_services import SearchServiceEnricher
from src.services.enrichers.storage_accounts import StorageAccountEnricher
from src.services.enrichers.web_apps import WebAppSiteEnricher, AppServicePlanEnricher
from src.services.enrichers.virtual_machines import VirtualMachineEnricher

__all__ = [
    "BaseEnricher",
    "EnricherRegistry",
    "CognitiveServicesEnricher",
    "SearchServiceEnricher",
    "StorageAccountEnricher",
    "WebAppSiteEnricher",
    "AppServicePlanEnricher",
    "VirtualMachineEnricher",
]
