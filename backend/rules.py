import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import Diagram, NetworkElement, Card, Port, Connection

def generate_ospf_config(ne: NetworkElement):
    return [
        "set chassis slot ua phylinux enable port 1 admin-state up",
        f"set interfaces eth-ua/1 unit 0 family inet address {ne.NE_IP}/24", # Assuming /24, will need to be dynamic
        "commit",
        f"set system management-mode dcn {ne.NE_IP}",
        "set network-element opt96xx gmpls-options gmpls-mode wson",
        "commit",
        "set routing-instances DCN-routing-instance interface eth-ua/1.0",
        "set routing-instances DCN-routing-instance protocols ospf area 1.1.1.1 interface all",
        "commit"
    ]

def generate_card_config(card: Card):
    config = [f"set chassis slot {card.slot_no} {card.card_name} port {port.port_no} port-type {port.port_type}" for port in card.ports]
    if card.service_card:
        config.append(f"set chassis slot {card.slot_no} {card.card_name} enable")
        for port in card.ports:
            config.append(f"set chassis slot {card.slot_no} {card.card_name} port {port.port_no} port-type {port.port_type} otuc-options line-rate 100")
    return config

def generate_fiber_connectivity_config(conn: Connection, diagram: Diagram):
    source_ne = next((ne for ne in diagram.network_elements if ne.id == conn.source.ne), None)
    source_card = next((card for card in source_ne.cards if card.id == conn.source.card), None)
    source_port = next((port for port in source_card.ports if port.id == conn.source.port), None)

    dest_ne = next((ne for ne in diagram.network_elements if ne.id == conn.destination.ne), None)
    dest_card = next((card for card in dest_ne.cards if card.id == conn.destination.card), None)
    dest_port = next((port for port in dest_card.ports if port.id == conn.destination.port), None)

    direction = "bidirectional" if conn.is_bidirectional else "unidirectional"

    if conn.is_internal:
        return [f"set chassis slot {source_card.slot_no} {source_card.card_name} port {source_port.port_no} fiber-connectivity internal {direction} peer-slot {dest_card.slot_no} peer-port {dest_port.port_no}"]
    else:
        return [f"set chassis slot {source_card.slot_no} {source_card.card_name} port {source_port.port_no} fiber-connectivity external {direction} peer-slot {dest_card.slot_no} peer-port {dest_port.port_no} fiber-length 1 peer-ne {dest_ne.NE_IP}"]

def generate_data_link_config(conn: Connection, diagram: Diagram):
    source_ne = next((ne for ne in diagram.network_elements if ne.id == conn.source.ne), None)
    source_card = next((card for card in source_ne.cards if card.id == conn.source.card), None)
    source_port = next((port for port in source_card.ports if port.id == conn.source.port), None)

    dest_ne = next((ne for ne in diagram.network_elements if ne.id == conn.destination.ne), None)

    if not source_card.service_card:
        return [f"set chassis slot {source_card.slot_no} {source_card.card_name} port {source_port.port_no} admin-state up port-type {source_port.port_type} gmpls-options nni remote-mpls-if-index {source_port.if_index} remote-node {dest_ne.NE_IP}"]
    return []

def generate_mpls_path_config(ne: NetworkElement, diagram: Diagram):
    if ne.role != "head":
        return []

    config = []
    for conn in diagram.connections:
        if conn.source.ne == ne.id:
            dest_ne = next((n for n in diagram.network_elements if n.id == conn.destination.ne), None)
            source_port = next((p for c in ne.cards for p in c.ports if p.id == conn.source.port), None)
            if dest_ne and source_port:
                config.append(f"set routing-instances GMPLS-routing-instance protocols mpls path p1 lambda {dest_ne.NE_IP} interface-id {source_port.if_index}")
    return config

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
                config += "\n".join(generate_data_link_config(conn, diagram)) + "\n"

        config += "\n".join(generate_mpls_path_config(ne, diagram)) + "\n"
        config += "\n"

    return config
