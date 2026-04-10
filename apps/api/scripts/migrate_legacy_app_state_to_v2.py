from app.core.settings import get_settings
from app.services.app_state import migrate_sqlite_legacy_app_state_file


def main() -> None:
    settings = get_settings()
    migrate_sqlite_legacy_app_state_file(settings.app_state_store_path)
    print(f"Migrated legacy app state to v2 tables in {settings.app_state_store_path}")


if __name__ == "__main__":
    main()
