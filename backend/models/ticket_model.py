"""
ticket_model.py
This file contains database functions related to tickets.
"Model" = code that talks to the database (SQLite).
"""

from datetime import datetime
from models.db import get_connection


def create_ticket(title, description, category, priority):
    """
    Insert a new ticket into the tickets table.
    Returns the new ticket id.
    """

    # We create a timestamp so we know when the ticket was made
    created_at = datetime.now().isoformat(timespec="seconds")

    conn = get_connection()
    cursor = conn.cursor()

    # Insert the ticket into the database
    cursor.execute("""
        INSERT INTO tickets (title, description, category, priority, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (title, description, category, priority, "Open", created_at))

    # Save changes
    conn.commit()

    # Get the id of the new ticket we just inserted
    new_id = cursor.lastrowid

    # Close the connection
    conn.close()

    return new_id

def get_all_tickets():
    """
    Fetch all tickets from the database.
    Returns a list of tickets.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title, description, category, priority, status, created_at
        FROM tickets
        ORDER BY created_at DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    # Convert rows to normal Python dictionaries
    tickets = []
    for row in rows:
        tickets.append({
            "id": row["id"],
            "title": row["title"],
            "description": row["description"],
            "category": row["category"],
            "priority": row["priority"],
            "status": row["status"],
            "created_at": row["created_at"]
        })

    return tickets

def update_ticket_status(ticket_id, new_status):
    """
    Update the status of a ticket.
    Returns True if a ticket was updated, otherwise False.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE tickets
        SET status = ?
        WHERE id = ?
    """, (new_status, ticket_id))

    conn.commit()

    # rowcount tells us how many rows were affected
    updated = cursor.rowcount > 0

    conn.close()
    return updated

