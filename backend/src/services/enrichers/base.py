"""
BaseEnricher interface and EnricherRegistry for ARM resource enrichment.
"""

import logging
from typing import Dict, Optional, Type
from azure.identity import DefaultAzureCredential
from src.models.resource import ResourceInventory

logger = logging.getLogger(__name__)


class BaseEnricher:
    """Base interface for all resource-specific ARM enrichers."""

    resource_type: str = ""

    async def enrich(
        self,
        resource: ResourceInventory,
        credential: Optional[DefaultAzureCredential] = None,
    ) -> Dict:
        """
        Execute targeted ARM API calls to fetch deep configuration details
        for the given resource. Returns a dictionary to be stored in enrichment_data.
        """
        raise NotImplementedError("Subclasses must implement enrich()")


class EnricherRegistry:
    """Registry mapping Azure resource types to their designated enricher classes."""

    _enrichers: Dict[str, Type[BaseEnricher]] = {}

    @classmethod
    def register(cls, enricher_cls: Type[BaseEnricher]) -> Type[BaseEnricher]:
        """Decorator to register an enricher class for its target resource_type."""
        if enricher_cls.resource_type:
            # Register case-insensitively for robust matching
            cls._enrichers[enricher_cls.resource_type.lower()] = enricher_cls
        return enricher_cls

    @classmethod
    def get_enricher(cls, resource_type: str) -> Optional[BaseEnricher]:
        """Lookup and instantiate an enricher for a given Azure resource type."""
        r_type_lower = resource_type.lower()
        enricher_cls = cls._enrichers.get(r_type_lower)
        if enricher_cls:
            return enricher_cls()
        return None

    @classmethod
    def is_supported(cls, resource_type: str) -> bool:
        """Check if deep enrichment is supported for a given Azure resource type."""
        return resource_type.lower() in cls._enrichers

    @classmethod
    def list_supported_types(cls) -> list[str]:
        """List all Azure resource types that have an active enricher registered."""
        return [cls._enrichers[k].resource_type for k in cls._enrichers]
