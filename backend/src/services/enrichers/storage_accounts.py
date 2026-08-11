"""
Enricher for Azure Blob Storage Accounts.
"""

import asyncio
import logging
from typing import Dict, Optional
from azure.identity import DefaultAzureCredential
from azure.mgmt.storage import StorageManagementClient

from src.models.resource import ResourceInventory
from src.services.enrichers.base import BaseEnricher, EnricherRegistry

logger = logging.getLogger(__name__)


@EnricherRegistry.register
class StorageAccountEnricher(BaseEnricher):
    """Enriches Azure Storage Accounts with access tier (Hot/Cool), redundancy (LRS/GRS), and blob settings."""

    resource_type = "Microsoft.Storage/storageAccounts"

    async def enrich(
        self,
        resource: ResourceInventory,
        credential: Optional[DefaultAzureCredential] = None,
    ) -> Dict:
        cred = credential or DefaultAzureCredential()
        loop = asyncio.get_running_loop()

        return await loop.run_in_executor(
            None, self._sync_enrich, resource, cred
        )

    def _sync_enrich(
        self, resource: ResourceInventory, credential: DefaultAzureCredential
    ) -> Dict:
        try:
            client = StorageManagementClient(
                credential=credential,
                subscription_id=resource.subscription_id,
            )

            account = client.storage_accounts.get_properties(
                resource_group_name=resource.resource_group,
                account_name=resource.name,
            )

            access_tier = str(account.access_tier) if account.access_tier else "Hot"
            sku_name = account.sku.name.value if hasattr(account.sku.name, "value") else str(account.sku.name)
            sku_tier = account.sku.tier.value if hasattr(account.sku.tier, "value") else str(account.sku.tier)

            supports_https = account.enable_https_traffic_only if hasattr(account, "enable_https_traffic_only") else True
            is_hns_enabled = account.is_hns_enabled if hasattr(account, "is_hns_enabled") else False

            return {
                "kind": account.kind,
                "sku_name": sku_name,
                "sku_tier": sku_tier,
                "access_tier": access_tier,
                "is_hns_enabled": is_hns_enabled,
                "enable_https_traffic_only": supports_https,
                "primary_location": account.primary_location,
                "enrichment_status": "succeeded",
            }

        except Exception as err:
            logger.warning("StorageAccount enrichment failed for %s: %s", resource.name, err)
            return {
                "enrichment_status": "failed",
                "error": str(err),
            }
