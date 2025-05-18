from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse


class CorsMiddleware(MiddlewareMixin):
    """
    Middleware to handle CORS (Cross-Origin Resource Sharing) headers.
    This will allow the frontend to communicate with the Django backend.
    """
    def process_response(self, request, response):
        response["Access-Control-Allow-Origin"] = "*"  # In production, set to the specific origin
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response


class ApiResponseMiddleware(MiddlewareMixin):
    """
    Middleware to standardize API responses across the application.
    """
    def process_exception(self, request, exception):
        """Handle exceptions and return a standardized error response"""
        return JsonResponse({
            'error': str(exception),
            'status': 'error'
        }, status=500)