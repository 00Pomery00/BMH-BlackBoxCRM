"""Integration connector base classes."""
from typing import Any, Dict


class ConnectorError(Exception):
    pass


class BaseConnector:
    """
    Base class for integration connectors.
    Subclasses must implement auth and request methods.
    """

    name: str = "base"

    def __init__(self, config: Dict[str, Any]):
        self.config = config

    def test(self) -> bool:
        """Test connection. Override in connectors."""
        raise NotImplementedError()

    def fetch(self, path: str, params: Dict[str, Any] | None = None) -> Dict[str, Any]:
        raise NotImplementedError()

    def push(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError()
