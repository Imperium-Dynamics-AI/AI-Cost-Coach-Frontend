"""
Custom HTTP and Pydantic exception handlers matching the API contract.
"""

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Convert Pydantic validation errors into the stable API contract error format."""
    field_errors = {}
    for error in exc.errors():
        field_path = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        field_errors[field_path] = error["msg"]

    return JSONResponse(
        status_code=422,
        content={
            "code": "INVALID_ESTIMATE_INPUT",
            "message": "One or more assumptions are invalid.",
            "fieldErrors": field_errors,
        },
    )
