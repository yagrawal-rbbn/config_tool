import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import Diagram, NetworkElement, Card, Port, Connection

def generate_ospf_config(ne: NetworkElement):
    return [
        "set chassis slot ua phylinux enable port 1 admin-state up",
        f"set interfaces eth-ua/1 unit 0 family inet address 192.168.12.08/24", # Assuming /24, will need to be dynamic
        "commit",
        f"set system management-mode dcn {ne.NE_IP}",
        "set network-element opt96xx gmpls-options gmpls-mode wson",
        "commit",
        "set routing-instances DCN-routing-instance interface eth-ua/1.0",
        "set routing-instances DCN-routing-instance protocols ospf area 1.1.1.1 interface all",
        "commit"
    ]

def generate_card_config(card: Card):
    config = []
    
    # Basic port config
    # TODO: Remove this statement for service cards
    for port in card.ports:
        config.append(f"set chassis slot {card.slot_no} {card.card_name} port {port.port_no} port-type {port.port_type}")
    
    # Service card specific config (tm1200)
    if card.service_card:
        config.append(f"set chassis slot {card.slot_no} {card.card_name} enable")
        for port in card.ports:
            if port.port_type == "otua":
                config.append(f"set chassis slot {card.slot_no} {card.card_name} port {port.port_no} port-type {port.port_type} otuc-options line-rate 100")
    
    config.append("commit")
    return config

def generate_fiber_connectivity_config(conn: Connection, diagram: Diagram):
    source_ne = next((ne for ne in diagram.network_elements if ne.id == conn.source.ne), None)
    source_card = next((card for card in source_ne.cards if card.id == conn.source.card), None) 
    source_port = next((port for port in source_card.ports if port.id == conn.source.port), None)

    dest_ne = next((ne for ne in diagram.network_elements if ne.id == conn.destination.ne), None)
    dest_card = next((card for card in dest_ne.cards if card.id == conn.destination.card), None)
    dest_port = next((port for port in dest_card.ports if port.id == conn.destination.port), None)

    config = []
    conn_type = "internal" if conn.is_internal else "external"
    direction = "bidirectional" if conn.is_bidirectional else "unidirectional"

    base_cmd = f"set chassis slot {source_card.slot_no} {source_card.card_name} port {source_port.port_no} fiber-connectivity {conn_type} {direction}"
    
    if conn_type == "internal":
        config.append(f"{base_cmd} peer-slot {dest_card.slot_no} peer-port {dest_port.port_no}")
    else:
        config.append(f"{base_cmd} peer-slot {dest_card.slot_no} peer-port {dest_port.port_no} peer-ne {dest_ne.NE_IP} fiber-length 1")
    
    config.append("commit")
    return config
def generate_data_link_config(ne: NetworkElement, diagram: Diagram):
    """Generate data link config for a network element, including all its connections"""
    config = []
    
    # Get all connections where this NE is either source or destination
    ne_connections = [
        conn for conn in diagram.connections 
        if conn.source.ne == ne.id or conn.destination.ne == ne.id
    ]

    for conn in ne_connections:
        if not is_valid_data_link(conn, diagram):
            continue

        # Determine local and remote details based on whether ne is source or destination
        if conn.source.ne == ne.id:
            local_card = next((card for card in ne.cards if card.id == conn.source.card), None)
            local_port = next((port for port in local_card.ports if port.id == conn.source.port), None)
            remote_ne = next((n for n in diagram.network_elements if n.id == conn.destination.ne), None)
        else:
            local_card = next((card for card in ne.cards if card.id == conn.destination.card), None)
            local_port = next((port for port in local_card.ports if port.id == conn.destination.port), None)
            remote_ne = next((n for n in diagram.network_elements if n.id == conn.source.ne), None)

        config.extend([
            f"set chassis slot {local_card.slot_no} {local_card.card_name} port {local_port.port_no} "
            f"admin-state up port-type {local_port.port_type} gmpls-options nni "
            f"remote-mpls-if-index {local_port.if_index} remote-node {remote_ne.NE_IP}",
            "commit"
        ])
    
    return config

def is_valid_data_link(conn: Connection, diagram: Diagram):
    source_card = next((card for ne in diagram.network_elements for card in ne.cards if card.id == conn.source.card), None)
    dest_card = next((card for ne in diagram.network_elements for card in ne.cards if card.id == conn.destination.card), None)
    return (not source_card.service_card and 
            not dest_card.service_card and
            conn.source.ne != conn.destination.ne)

def generate_mpls_path_config(ne: NetworkElement, diagram: Diagram):
    if ne.role != "head":
        return []

    config = []
    # Include paths to all destination NEs, not just direct connections
    for dest_ne in diagram.network_elements:
        if dest_ne.id != ne.id:
            # Find connecting port's interface index
            connecting_port = find_connecting_port(ne, dest_ne, diagram)
            if connecting_port:
                config.append(f"set routing-instances GMPLS-routing-instance protocols mpls path p1 lambda {dest_ne.NE_IP} interface-id {connecting_port.if_index}")
    
    config.append("commit")
    return config

def find_connecting_port(source_ne: NetworkElement, dest_ne: NetworkElement, diagram: Diagram):
    for conn in diagram.connections:
        if conn.source.ne == source_ne.id and conn.destination.ne == dest_ne.id:
            return next((p for c in source_ne.cards for p in c.ports if p.id == conn.source.port), None)
    return None

def generate_config(diagram: Diagram):
    config = ""
    for ne in diagram.network_elements:
        config += f"--- {ne.id} ({ne.role}) ---\n"
        config += "\n".join(generate_ospf_config(ne)) + "\n"
        
        for card in ne.cards:
            config += "\n".join(generate_card_config(card)) + "\n"
        config += "\n"

        for conn in diagram.connections:
            if conn.source.ne == ne.id:
                config += "\n".join(generate_fiber_connectivity_config(conn, diagram)) + "\n"
        
        # Generate data links for all connections of this NE
        config += "\n".join(generate_data_link_config(ne, diagram)) + "\n"
        config += "\n".join(generate_mpls_path_config(ne, diagram)) + "\n"
        config += "\n"

    return config
