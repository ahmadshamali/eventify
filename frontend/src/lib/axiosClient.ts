// # The single axios instance used by ALL api files
// │                                 # Sets baseURL to VITE_API_URL from .env
// │                                 # Automatically attaches JWT token to every request header
// │                                 # Handles 401 responses globally (redirect to login)
// │                                 # Every *Api.ts file imports this instead of raw axios