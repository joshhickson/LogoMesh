{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x  # Using Node.js 18
    pkgs.sqlite       # System library for sqlite3 Node.js module
    # Add other system dependencies if needed by plugins or server
  ];
  env = {
    # Replit will typically set PORT, but you can override or add others
    # PORT = "8080"; # Example if Replit's $PORT wasn't picked up by run
    # For DB_PATH, Replit provides persistent storage typically via /mnt/data
    # This ensures data persistence across Replit restarts.
    DB_PATH = "/mnt/data/logomesh.sqlite3";
    # API_BASE_PATH, PLUGIN_DIR etc. can be set here if not sourced from .env
    # or if you want Replit to manage them.
    # If using .env files, ensure your server startup script loads them.
    # For Replit, it's often better to use Replit's "Secrets" management
    # for sensitive data and `env` in replit.nix for non-sensitive config.
    # ULS_DIMENSION = "768"; # Example
    # LOG_LEVEL = "info"; # Example
  };
}
