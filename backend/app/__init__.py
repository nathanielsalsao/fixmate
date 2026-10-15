from flask import Flask
from flask_cors import CORS

from app.routes.auth_routes import auth_bp
from app.routes.test_role_routes import role_test_bp
from app.routes.service_routes import services_bp
from app.routes.booking_routes import bookings_bp
from app.routes.admin_dashboard_routes import admin_dashboard_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(role_test_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(admin_dashboard_bp)

    return app
