"""
db.py
This file handles:
1) Connecting to the SQLite database file
2) Creating tables if they do not exist (setup step)
"""

import sqlite3


# This is the name of our database file.
# SQLite stores everything inside this one file.
DB_NAME = "helpdesk.db"


def get_connection():
    """
    Returns a connection to the SQLite database.

    We use this whenever we want to read/write data.
    """
    conn = sqlite3.connect(DB_NAME)

    # This allows us to access columns by name, like row["title"]
    conn.row_factory = sqlite3.Row

    return conn


def init_db():
    """
    Creates the tables we need (only if they do not already exist).
    This runs once when the app starts.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Create a tickets table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()
