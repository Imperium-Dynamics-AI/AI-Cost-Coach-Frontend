"""
Database engine initialization and table creation helpers.
"""

from sqlmodel import SQLModel, create_engine
from src.config.settings import DATABASE_URL

# Import all models to register SQLModel metadata
import src.models.price_cache  # noqa: F401
import src.models.resource     # noqa: F401
import src.models.scan         # noqa: F401
import src.models.pricing      # noqa: F401

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


def init_db() -> None:
    """Create database tables if they do not exist."""
    SQLModel.metadata.create_all(engine)

