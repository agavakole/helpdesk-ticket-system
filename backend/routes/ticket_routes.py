"""
ticket_routes.py

This file defines API routes related to tickets.
Routes = Controller layer in MVC.

Its job is to:
- Receive HTTP requests (GET, POST, PATCH)
- Validate input data
- Call model functions (database logic)
- Return JSON responses to the client
"""

from flask import Blueprint, request, jsonify
from models.ticket_model import create_ticket, get_all_tickets, update_ticket_status


# Create a Blueprint to group all ticket-related routes together
# This keeps app.py clean and organized
ticket_bp = Blueprint("ticket_bp", __name__)


# =========================
# CREATE TICKET (POST)
# =========================
# This route handles creating a new ticket
# It runs when a client sends:
# POST /api/tickets
@ticket_bp.post("/api/tickets")
def api_create_ticket():
    """
    Create a new ticket.

    Expects JSON input like:
    {
      "title": "...",
      "description": "...",
      "category": "...",
      "priority": "..."
    }

    Returns:
    - 201 Created if successful
    - 400 Bad Request if input is invalid
    """

    # Read JSON data sent by the client
    data = request.get_json()

    # If no JSON was sent, return an error
    if data is None:
        return jsonify({"error": "Missing JSON body"}), 400

    # Extract values from JSON
    title = data.get("title")
    description = data.get("description")
    category = data.get("category")
    priority = data.get("priority")

    # Ensure all required fields are present
    if (title is None) or (description is None) or (category is None) or (priority is None):
        return jsonify({
            "error": "title, description, category, and priority are required"
        }), 400

    # Call the model function to save the ticket in the database
    new_id = create_ticket(title, description, category, priority)

    # Return success response with the new ticket ID
    return jsonify({
        "message": "Ticket created",
        "ticket_id": new_id
    }), 201


# =========================
# LIST ALL TICKETS (GET)
# =========================
# This route returns all tickets stored in the database
# It runs when a client sends:
# GET /api/tickets
@ticket_bp.get("/api/tickets")
def api_get_tickets():
    """
    Fetch all tickets.

    Returns:
    - 200 OK with a list of tickets
    """

    # Call the model function to fetch tickets from the database
    tickets = get_all_tickets()

    # Return tickets as JSON
    return jsonify(tickets), 200


# =========================
# UPDATE TICKET STATUS (PATCH)
# =========================
# This route updates the status of a specific ticket
# It runs when a client sends:
# PATCH /api/tickets/<ticket_id>/status
@ticket_bp.patch("/api/tickets/<int:ticket_id>/status")
def api_update_status(ticket_id):
    """
    Update a ticket's status.

    URL parameter:
    - ticket_id (integer)

    Expects JSON input like:
    {
      "status": "In Progress"
    }

    Returns:
    - 200 OK if updated
    - 400 Bad Request if input is invalid
    - 404 Not Found if ticket does not exist
    """

    # Read JSON data from request
    data = request.get_json()

    # If no JSON was sent, return an error
    if data is None:
        return jsonify({"error": "Missing JSON body"}), 400

    # Extract new status from JSON
    new_status = data.get("status")

    # Only allow valid status values
    allowed = ["Open", "In Progress", "Resolved"]
    if new_status not in allowed:
        return jsonify({
            "error": f"Status must be one of: {allowed}"
        }), 400

    # Call the model function to update the status
    updated = update_ticket_status(ticket_id, new_status)

    # If no ticket was updated, it means the ticket ID does not exist
    if not updated:
        return jsonify({"error": "Ticket not found"}), 404

    # Return success response
    return jsonify({
        "message": "Status updated",
        "ticket_id": ticket_id,
        "status": new_status
    }), 200
