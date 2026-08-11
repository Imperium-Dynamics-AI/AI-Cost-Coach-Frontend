"""
Enricher for Azure App Services (sites & serverfarms).
"""

import asyncio
import logging
from typing import Dict, Optional
from azure.identity import DefaultAzureCredential
from azure.mgmt.web import WebSiteManagementClient

from src.models.resource import ResourceInventory
from src.services.enrichers.base import BaseEnricher, EnricherRegistry

logger = logging.getLogger(__name__)


@EnricherRegistry.register
class WebAppSiteEnricher(BaseEnricher):
    """Enriches Azure App Service Web Apps (Microsoft.Web/sites) with runtime stack & config settings."""

    resource_type = "Microsoft.Web/sites"

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
            client = WebSiteManagementClient(
                credential=credential,
                subscription_id=resource.subscription_id,
            )

            site = client.web_apps.get(
                resource_group_name=resource.resource_group,
                name=resource.name,
            )

            config = client.web_apps.get_configuration(
                resource_group_name=resource.resource_group,
                name=resource.name,
            )

            runtime_stack = config.linux_fx_version if config and config.linux_fx_version else None
            if not runtime_stack and config and config.net_framework_version:
                runtime_stack = f".NET {config.net_framework_version}"

            always_on = config.always_on if config else False

            return {
                "state": site.state,
                "app_service_plan_id": site.server_farm_id,
                "runtime_stack": runtime_stack,
                "always_on": always_on,
                "https_only": site.https_only if hasattr(site, "https_only") else True,
                "default_host_name": site.default_host_name if hasattr(site, "default_host_name") else None,
                "enrichment_status": "succeeded",
            }

        except Exception as err:
            logger.warning("WebAppSite enrichment failed for %s: %s", resource.name, err)
            return {
                "enrichment_status": "failed",
                "error": str(err),
            }


@EnricherRegistry.register
class AppServicePlanEnricher(BaseEnricher):
    """Enriches Azure App Service Plans (Microsoft.Web/serverfarms) with SKU capacity & instance count."""

    resource_type = "Microsoft.Web/serverfarms"

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
            client = WebSiteManagementClient(
                credential=credential,
                subscription_id=resource.subscription_id,
            )

            plan = client.app_service_plans.get(
                resource_group_name=resource.resource_group,
                name=resource.name,
            )

            sku_name = plan.sku.name if plan.sku else resource.sku_name
            sku_tier = plan.sku.tier if plan.sku else resource.sku_tier
            capacity = plan.sku.capacity if plan.sku and plan.sku.capacity else 1

            return {
                "sku_name": sku_name,
                "sku_tier": sku_tier,
                "instance_count": capacity,
                "max_apps": plan.maximum_number_of_workers if hasattr(plan, "maximum_number_of_workers") else None,
                "status": str(plan.status) if hasattr(plan, "status") else "Ready",
                "enrichment_status": "succeeded",
            }

        except Exception as err:
            logger.warning("AppServicePlan enrichment failed for %s: %s", resource.name, err)
            return {
                "enrichment_status": "failed",
                "error": str(err),
            }
