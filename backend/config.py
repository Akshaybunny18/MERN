import os


def get_root_admin_config():
	return {
		"email": os.getenv("ADMIN_EMAIL", "admin@campus.dev").strip().lower(),
		"password": os.getenv("ADMIN_PASSWORD", "Admin@123"),
		"first_name": os.getenv("ADMIN_FIRST_NAME", "System"),
		"last_name": os.getenv("ADMIN_LAST_NAME", "Admin"),
	}
