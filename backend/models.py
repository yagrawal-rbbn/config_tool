from pydantic import BaseModel
from typing import List, Optional

class Port(BaseModel):
    id: str
    port_no: int
    port_type: str
    if_index: Optional[str] = None

class Card(BaseModel):
    id: str
    card_name: str
    slot_no: str
    service_card: bool = False
    ports: List[Port] = []

class NetworkElement(BaseModel):
    id: str
    NE_IP: str
    role: str # head, transit, or tail
    cards: List[Card] = []

class ConnectionSource(BaseModel):
    ne: str
    card: str
    port: str

class Connection(BaseModel):
    id: str
    source: ConnectionSource
    destination: ConnectionSource
    is_internal: bool
    is_bidirectional: bool
    is_dd: Optional[bool] = False

class Diagram(BaseModel):
    network_elements: List[NetworkElement] = []
    connections: List[Connection] = []