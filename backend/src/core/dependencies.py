"""
FastAPI dependency injection providers.
"""

from typing import Generator
from sqlmodel import Session
from src.core.database import engine


def get_session() -> Generator[Session, None, None]:
    """Provide a transactional database session per HTTP request."""
    with Session(engine) as session:
        yield session
