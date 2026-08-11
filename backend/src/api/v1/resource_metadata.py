"""
Resource Metadata API endpoints — describes supported resource types & enrichment capabilities.
"""

from typing import List, Dict
from fastapi import APIRouter, HTTPException
from src.services.enrichers import EnricherRegistry

router = APIRouter(tags=["Resource Metadata"])

CAPABILITIES_MAP: Dict[str, Dict] = {
    "microsoft.cognitiveservices/accounts": {
        "resource_type": "Microsoft.CognitiveServices/accounts",
        "display_name": "Azure OpenAI / Cognitive Services",
        "supports_deep_enrichment": True,
        "enrichment_fields": [
            "deployed_models (name, version, SKU, capacity TPM)",
            "has_provisioned_throughput (PTU vs PAYG)",
            "total_tpm_capacity",
            "endpoint",
            "custom_subdomain",
        ],
    },
    "microsoft.search/searchservices": {
        "resource_type": "Microsoft.Search/searchServices",
        "display_name": "Azure AI Search",
        "supports_deep_enrichment": True,
        "enrichment_fields": [
            "replica_count",
            "partition_count",
            "total_search_units",
            "hosting_mode",
            "semantic_search",
        ],
    },
    "microsoft.storage/storageaccounts": {
        "resource_type": "Microsoft.Storage/storageAccounts",
        "display_name": "Azure Blob Storage",
        "supports_deep_enrichment": True,
        "enrichment_fields": [
            "access_tier (Hot/Cool)",
            "sku_name (LRS/GRS/ZRS)",
            "is_hns_enabled (Hierarchical Namespace)",
            "enable_https_traffic_only",
            "primary_location",
        ],
    },
    "microsoft.web/sites": {
        "resource_type": "Microsoft.Web/sites",
        "display_name": "Azure App Service (Web App / Function)",
        "supports_deep_enrichment": True,
        "enrichment_fields": [
            "state (Running/Stopped)",
            "app_service_plan_id",
            "runtime_stack (Python/Node/.NET)",
            "always_on",
            "https_only",
        ],
    },
    "microsoft.web/serverfarms": {
        "resource_type": "Microsoft.Web/serverfarms",
        "display_name": "Azure App Service Plan",
        "supports_deep_enrichment": True,
        "enrichment_fields": [
            "sku_name (B1, Standard, Premium)",
            "sku_tier",
            "instance_count",
            "max_apps",
        ],
    },
    "microsoft.compute/virtualmachines": {
        "resource_type": "Microsoft.Compute/virtualMachines",
        "display_name": "Azure Virtual Machine",
        "supports_deep_enrichment": True,
        "enrichment_fields": [
            "vm_size (e.g. Standard_D4s_v5)",
            "os_type (Linux/Windows)",
            "os_disk_type (Premium SSD/Standard HDD)",
            "data_disks_count",
            "power_state (Running/Deallocated)",
        ],
    },
}


@router.get("/api/v1/resource-types")
def get_supported_resource_types():
    """List all supported Azure resource types with enrichment status."""
    supported_types = EnricherRegistry.list_supported_types()
    return {
        "total_enrichers": len(supported_types),
        "supported_types": [
            {
                "resource_type": r_type,
                "display_name": CAPABILITIES_MAP.get(r_type.lower(), {}).get("display_name", r_type),
                "supports_deep_enrichment": True,
            }
            for r_type in supported_types
        ],
    }


@router.get("/api/v1/resource-types/{resource_type:path}/capabilities")
def get_resource_type_capabilities(resource_type: str):
    """Retrieve deep enrichment capability details for a specific Azure resource type."""
    r_type_lower = resource_type.lower()
    capabilities = CAPABILITIES_MAP.get(r_type_lower)

    if not capabilities:
        is_supported = EnricherRegistry.is_supported(resource_type)
        return {
            "resource_type": resource_type,
            "supports_deep_enrichment": is_supported,
            "enrichment_fields": ["Generic ARM properties"] if is_supported else [],
        }

    return capabilities
