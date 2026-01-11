# Import Flask (the web framework)
# Import jsonify (used to return JSON responses)
from flask import Flask, jsonify

# Import our database setup function
from models.db import init_db

from routes.ticket_routes import ticket_bp

# This function creates and returns our Flask app
# This pattern is called an "app factory"
# It helps keep the code clean and organized
def create_app():

    # Create the Flask application
    # __name__ tells Flask where this file is located
    app = Flask(__name__)

    # Create tables when the app starts
    init_db()

    # Register ticket routes
    app.register_blueprint(ticket_bp)

    # This is a route (API endpoint)
    # When someone sends a GET request to /api/health,
    # the function below will run
    @app.get("/api/health")
    def health():
        # Return a JSON response to confirm the backend is working
        return jsonify({
            "status": "ok",
            "service": "helpdesk-backend"
        })

    # Return the app so it can be used elsewhere
    return app


# This block runs ONLY if we execute this file directly
# It will NOT run if this file is imported somewhere else
if __name__ == "__main__":

    # Create the Flask app using the function above
    app = create_app()

    # Start the development server
    # debug=True helps show clear errors and auto-restarts on save
    app.run(debug=True)
