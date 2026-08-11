"""
Enricher for Azure Virtual Machines.
"""

import asyncio
import logging
from typing import Dict, Optional
from azure.identity import DefaultAzureCredential
from azure.mgmt.compute import ComputeManagementClient

from src.models.resource import ResourceInventory
from src.services.enrichers.base import BaseEnricher, EnricherRegistry

logger = logging.getLogger(__name__)


@EnricherRegistry.register
class VirtualMachineEnricher(BaseEnricher):
    """Enriches Azure Virtual Machines with VM size, OS type, disk details, and power state."""

    resource_type = "Microsoft.Compute/virtualMachines"

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
            client = ComputeManagementClient(
                credential=credential,
                subscription_id=resource.subscription_id,
            )

            # Get instance view to determine power state
            vm = client.virtual_machines.get(
                resource_group_name=resource.resource_group,
                vm_name=resource.name,
                expand="instanceView",
            )

            vm_size = vm.hardware_profile.vm_size if vm.hardware_profile else None
            os_type = vm.storage_profile.os_disk.os_type if (vm.storage_profile and vm.storage_profile.os_disk) else "Linux"

            os_disk_type = None
            if vm.storage_profile and vm.storage_profile.os_disk and vm.storage_profile.os_disk.managed_disk:
                os_disk_type = str(vm.storage_profile.os_disk.managed_disk.storage_account_type)

            data_disks_count = len(vm.storage_profile.data_disks) if (vm.storage_profile and vm.storage_profile.data_disks) else 0

            # Determine power state
            power_state = "unknown"
            if vm.instance_view and vm.instance_view.statuses:
                for status in vm.instance_view.statuses:
                    if status.code and status.code.startswith("PowerState/"):
                        power_state = status.code.replace("PowerState/", "")
                        break

            return {
                "vm_size": vm_size,
                "os_type": str(os_type),
                "os_disk_type": os_disk_type,
                "data_disks_count": data_disks_count,
                "power_state": power_state,
                "provisioning_state": vm.provisioning_state,
                "enrichment_status": "succeeded",
            }

        except Exception as err:
            logger.warning("VirtualMachine enrichment failed for %s: %s", resource.name, err)
            return {
                "enrichment_status": "failed",
                "error": str(err),
            }
