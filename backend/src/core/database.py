"""
Database engine initialization and table creation helpers.
"""

from sqlmodel import SQLModel, create_engine
from src.config.settings import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


def init_db() -> None:
    """Create database tables if they do not exist."""
    SQLModel.metadata.create_all(engine)
