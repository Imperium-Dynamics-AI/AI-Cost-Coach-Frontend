from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel, create_engine, Session

from config import SQLITE_URL

engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})


class AzurePriceCache(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sku_key: str = Field(index=True, unique=True)
    service_name: str
    product_name: str = ""
    sku_name: str
    meter_name: str = ""
    retail_price: float
    unit_of_measure: str
    currency_code: str = "USD"
    price_type: str = ""
    region: str
    last_updated: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
