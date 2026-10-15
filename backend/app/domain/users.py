from abc import ABC, abstractmethod


class User(ABC):
    """Base class shared by all FixMate user roles."""

    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email.strip().lower()

    @abstractmethod
    def dashboard_summary(self) -> str:
        """Each role must provide its own dashboard summary."""
        pass


class Customer(User):
    """A customer who books home services."""

    def dashboard_summary(self) -> str:
        return "Browse services and manage your bookings."


class Provider(User):
    """A provider who handles home service requests."""

    def dashboard_summary(self) -> str:
        return "Manage assigned jobs and service availability."


class Admin(User):
    """An administrator who manages the FixMate platform."""

    def dashboard_summary(self) -> str:
        return "Manage users, services, and booking records."
