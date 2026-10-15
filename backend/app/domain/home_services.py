from abc import ABC, abstractmethod
from typing import Any


class HomeService(ABC):
    """Abstract base class for services stored in FixMate."""

    def __init__(
        self,
        service_id: str,
        service_name: str,
        category: str,
        base_price: float,
        description: str = "",
    ):
        if isinstance(base_price, bool) or not isinstance(
            base_price, (int, float)
        ):
            raise ValueError("Base price must be a number")

        if base_price < 0:
            raise ValueError("Base price cannot be negative")

        self.service_id = service_id
        self.service_name = service_name
        self.category = category
        self.description = description
        self.__base_price = float(base_price)

    @property
    def base_price(self) -> float:
        """Expose the price without allowing direct assignment."""
        return self.__base_price

    @abstractmethod
    def calculate_price(self) -> float:
        """Each service type defines how its price is calculated."""
        pass

    def to_dict(self) -> dict[str, Any]:
        """Convert the service object into API-friendly data."""
        return {
            "id": self.service_id,
            "name": self.service_name,
            "category": self.category,
            "description": self.description,
            "base_price": self.base_price,
            "calculated_price": self.calculate_price(),
        }

    @staticmethod
    def from_document(document: dict[str, Any]) -> "HomeService":
        """Build the correct OOP object from a MongoDB document."""
        category = document.get("category", "").strip().lower()

        service_classes = {
            "cleaning": CleaningService,
            "plumbing": PlumbingService,
        }

        service_class = service_classes.get(category, GeneralHomeService)

        return service_class(
            service_id=str(document["_id"]),
            service_name=document["name"],
            category=document["category"],
            base_price=document["base_price"],
            description=document.get("description", ""),
        )


class CleaningService(HomeService):
    """Concrete service type for cleaning."""

    def calculate_price(self) -> float:
        return self.base_price


class PlumbingService(HomeService):
    """Concrete service type for plumbing."""

    def calculate_price(self) -> float:
        return self.base_price


class GeneralHomeService(HomeService):
    """Fallback for electrical and other service categories."""

    def calculate_price(self) -> float:
        return self.base_price
