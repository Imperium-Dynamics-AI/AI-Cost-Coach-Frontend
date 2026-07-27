"""
SKU manifest — defines which Azure Retail Price API filters map to each internal SKU key.
This is pure data/config: no I/O, no logic.
"""


def _openai_sku(sku_name: str, model: str, direction: str) -> dict:
    """Build a filter descriptor for an Azure OpenAI token-pricing SKU."""
    return {
        "filter": (
            "productName eq 'Azure OpenAI' "
            f"and skuName eq '{sku_name}' "
            "and armRegionName eq 'eastus'"
        ),
        "model": model,
        "direction": direction,
    }


# Maps every internal SKU key to its Azure Retail Prices API filter params.
SKU_MANIFEST: dict[str, dict] = {
    # --- OpenAI Models ---
    "gpt-4o-input":         _openai_sku("gpt 4o 0513 Input regional",          "GPT-4o",       "input"),
    "gpt-4o-output":        _openai_sku("gpt 4o 0513 Output regional",         "GPT-4o",       "output"),
    "gpt-4o-mini-input":    _openai_sku("gpt-4o-mini-0718-Inp-regnl",          "GPT-4o mini",  "input"),
    "gpt-4o-mini-output":   _openai_sku("gpt-4o-mini-0718-Outp-regnl",         "GPT-4o mini",  "output"),
    "gpt-4.1-input":        _openai_sku("gpt 4.1 Inp regnl",                   "GPT-4.1",      "input"),
    "gpt-4.1-output":       _openai_sku("gpt 4.1 Outp regnl",                  "GPT-4.1",      "output"),
    "gpt-4.1-mini-input":   _openai_sku("gpt 4.1 mini Inp regnl",              "GPT-4.1 mini", "input"),
    "gpt-4.1-mini-output":  _openai_sku("gpt 4.1 mini Outp regnl",             "GPT-4.1 mini", "output"),
    "gpt-4.1-nano-input":   _openai_sku("gpt 4.1 nano Inp regnl",              "GPT-4.1 nano", "input"),
    "gpt-4.1-nano-output":  _openai_sku("gpt 4.1 nano Outp regnl",             "GPT-4.1 nano", "output"),
    "gpt-4-turbo-input":    _openai_sku("gpt-4-turbo-128K Input-regional",     "GPT-4 Turbo",  "input"),
    "gpt-4-turbo-output":   _openai_sku("gpt-4-turbo-128K Output-regional",    "GPT-4 Turbo",  "output"),
    "gpt-3.5-turbo-input":  _openai_sku("gpt-35-turbo-16K-0125 Input-regional","GPT-3.5 Turbo","input"),
    "gpt-3.5-turbo-output": _openai_sku("gpt-35-turbo-16K-0125 Output-regional","GPT-3.5 Turbo","output"),
    "o1-input":             _openai_sku("o1 1217 Inp regnl",                   "o1",           "input"),
    "o1-output":            _openai_sku("o1 1217 Outp regnl",                  "o1",           "output"),
    "o1-mini-input":        _openai_sku("o1 mini input regnl",                 "o1 mini",      "input"),
    "o1-mini-output":       _openai_sku("o1 mini output regnl",                "o1 mini",      "output"),
    "o3-input":             _openai_sku("o3 0416 Inp regnl",                   "o3",           "input"),
    "o3-output":            _openai_sku("o3 0416 Outp regnl",                  "o3",           "output"),
    "o3-mini-input":        _openai_sku("o3 mini 0131 input regnl",            "o3 mini",      "input"),
    "o3-mini-output":       _openai_sku("o3 mini 0131 output regnl",           "o3 mini",      "output"),
    "o4-mini-input":        _openai_sku("o4 mini Inp regnl",                   "o4-mini",      "input"),
    "o4-mini-output":       _openai_sku("o4 mini Outp regnl",                  "o4-mini",      "output"),

    # --- Supporting Infrastructure ---
    "ai-search-basic": {
        "filter": (
            "serviceName eq 'Azure Cognitive Search' "
            "and skuName eq 'Basic' "
            "and armRegionName eq 'eastus'"
        ),
    },
    "blob-storage-gb": {
        "filter": (
            "serviceName eq 'Storage' "
            "and skuName eq 'Hot LRS' "
            "and contains(meterName, 'Data Stored') "
            "and armRegionName eq 'eastus'"
        ),
    },
    "app-service-b1": {
        "filter": (
            "serviceName eq 'Azure App Service' "
            "and meterName eq 'B1' "
            "and armRegionName eq 'eastus'"
        ),
    },
}
