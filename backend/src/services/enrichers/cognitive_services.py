"""
Enricher for Azure Cognitive Services / Azure OpenAI accounts.
"""

import asyncio
import logging
from typing import Dict, Optional
from azure.identity import DefaultAzureCredential
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient

from src.models.resource import ResourceInventory
from src.services.enrichers.base import BaseEnricher, EnricherRegistry

logger = logging.getLogger(__name__)


@EnricherRegistry.register
class CognitiveServicesEnricher(BaseEnricher):
    """Enriches Azure OpenAI accounts with deployed models, SKU tiers, and rate limits."""

    resource_type = "Microsoft.CognitiveServices/accounts"

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
            client = CognitiveServicesManagementClient(
                credential=credential,
                subscription_id=resource.subscription_id,
            )

            # 1. Fetch account properties
            account = client.accounts.get(
                resource_group_name=resource.resource_group,
                account_name=resource.name,
            )

            # 2. Fetch deployed models (deployments)
            deployments_list = client.deployments.list(
                resource_group_name=resource.resource_group,
                account_name=resource.name,
            )

            deployed_models = []
            has_ptu = False
            total_tpm = 0

            for dep in deployments_list:
                model_info = dep.properties.model if dep.properties else None
                sku_info = dep.sku if dep else None

                dep_sku_name = sku_info.name if sku_info else "Standard"
                capacity = sku_info.capacity if sku_info else 0

                if dep_sku_name and "provisioned" in dep_sku_name.lower():
                    has_ptu = True

                total_tpm += capacity

                deployed_models.append({
                    "deployment_name": dep.name,
                    "model_name": model_info.name if model_info else None,
                    "model_version": model_info.version if model_info else None,
                    "model_format": model_info.format if model_info else None,
                    "sku_name": dep_sku_name,
                    "capacity_tpm": capacity,
                    "provisioning_state": dep.properties.provisioning_state if dep.properties else None,
                })

            endpoint = account.properties.endpoint if account.properties else None
            custom_domain = (
                account.properties.custom_sub_domain_name if account.properties else None
            )

            return {
                "kind": account.kind,
                "sku_name": account.sku.name if account.sku else resource.sku_name,
                "sku_tier": account.sku.tier if account.sku else resource.sku_tier,
                "endpoint": endpoint,
                "custom_subdomain": custom_domain,
                "deployments_count": len(deployed_models),
                "deployed_models": deployed_models,
                "has_provisioned_throughput": has_ptu,
                "total_tpm_capacity": total_tpm,
                "enrichment_status": "succeeded",
            }

        except Exception as err:
            logger.warning("CognitiveServices enrichment failed for %s: %s", resource.name, err)
            return {
                "enrichment_status": "failed",
                "error": str(err),
            }
