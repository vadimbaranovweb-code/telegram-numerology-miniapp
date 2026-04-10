from datetime import date
import json
import sqlite3

from app.schemas.auth import (
    TelegramBootstrapProfile,
    TelegramBootstrapUser,
    TelegramEntryContext,
)
from app.schemas.profile import AppProfile
from app.services.app_state import (
    SqliteBackedAppStateStore,
    migrate_sqlite_legacy_app_state_file,
    migrate_sqlite_legacy_app_state_to_v2,
    reset_app_state_store,
    save_compatibility_preview_state,
    save_first_reading_state,
    save_onboarding_profile_state,
    set_app_state_store,
    upsert_session_app_auth_state,
    mark_session_premium_state,
)
from app.services.bootstrap import build_bootstrap_response
from app.services.compatibility import build_compatibility_preview
from app.services.numerology.service import calculate_core_numbers


def test_sqlite_app_state_store_persists_state_across_store_instances(tmp_path) -> None:
    store_path = tmp_path / "app-state.sqlite3"
    session_token = "tg_session_sqlite_store"
    store = SqliteBackedAppStateStore(str(store_path))

    store.upsert_auth_state(
        session_token=session_token,
        user=TelegramBootstrapUser(
            id="tg_user_sqlite",
            display_name="Anna",
        ),
        profile=TelegramBootstrapProfile(
            onboarding_completed=False,
            daily_opt_in=False,
        ),
        entry_context=TelegramEntryContext(source="telegram_webapp"),
    )
    store.save_profile(
        session_token=session_token,
        profile=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=True,
        ),
    )
    store.save_first_reading(
        session_token=session_token,
        profile=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=True,
        ),
        first_reading=calculate_core_numbers(
            date(1998, 6, 14),
            "Anna",
            current_date=date(2026, 4, 9),
        ),
    )
    store.save_compatibility_preview(
        session_token=session_token,
        compatibility_preview=build_compatibility_preview(
            source_birth_date=date(1998, 6, 14),
            target_birth_date=date(1997, 11, 22),
            relationship_context="romantic",
            target_display_name="Max",
        ),
    )
    store.mark_premium(session_token=session_token)

    restored_store = SqliteBackedAppStateStore(str(store_path))
    state = restored_store.get(session_token)

    assert state is not None
    assert state.user.display_name == "Anna"
    assert state.user.is_premium is True
    assert state.user.premium_status == "premium"
    assert state.app_profile is not None
    assert state.app_profile.birth_date == "1998-06-14"
    assert state.first_reading is not None
    assert state.compatibility_preview is not None
    assert "Max" in state.compatibility_preview.preview.summary

    connection = sqlite3.connect(store_path)
    identity_row = connection.execute(
        """
        SELECT display_name, onboarding_completed, daily_opt_in, is_premium, premium_status
        FROM session_identity_state
        WHERE session_token = ?
        """,
        (session_token,),
    ).fetchone()
    snapshot_row = connection.execute(
        """
        SELECT app_profile_json, first_reading_json, compatibility_preview_json
        FROM session_snapshot_state
        WHERE session_token = ?
        """,
        (session_token,),
    ).fetchone()
    connection.close()

    assert identity_row == ("Anna", 1, 1, 1, "premium")
    assert snapshot_row is not None
    assert snapshot_row[0] is not None
    assert snapshot_row[1] is not None
    assert snapshot_row[2] is not None


def test_sqlite_app_state_store_reads_legacy_payload_rows_and_backfills_columns(
    tmp_path,
) -> None:
    store_path = tmp_path / "legacy-app-state.sqlite3"
    session_token = "tg_session_sqlite_legacy"

    connection = sqlite3.connect(store_path)
    connection.execute(
        """
        CREATE TABLE session_app_state (
            session_token TEXT PRIMARY KEY,
            payload TEXT NOT NULL
        )
        """
    )
    connection.execute(
        """
        INSERT INTO session_app_state (session_token, payload)
        VALUES (?, ?)
        """,
        (
            session_token,
            json.dumps(
                {
                    "user": {
                        "id": "tg_user_legacy",
                        "display_name": "Anna",
                        "is_premium": True,
                        "premium_status": "premium",
                    },
                    "profile": {
                        "onboarding_completed": True,
                        "daily_opt_in": True,
                    },
                    "entry_context": {"source": "telegram_webapp"},
                    "app_profile": {
                        "display_name": "Anna",
                        "birth_date": "1998-06-14",
                        "daily_opt_in": True,
                        "onboarding_completed": True,
                    },
                    "first_reading": None,
                    "compatibility_preview": None,
                },
                ensure_ascii=True,
            ),
        ),
    )
    connection.commit()
    connection.close()

    store = SqliteBackedAppStateStore(str(store_path))
    state = store.get(session_token)

    assert state is not None
    assert state.user.display_name == "Anna"
    assert state.user.is_premium is True
    assert state.profile.onboarding_completed is True
    assert state.app_profile is not None
    assert state.app_profile.birth_date == "1998-06-14"

    connection = sqlite3.connect(store_path)
    row = connection.execute(
        """
        SELECT user_json, display_name, onboarding_completed, is_premium, premium_status
        FROM session_identity_state
        WHERE session_token = ?
        """,
        (session_token,),
    ).fetchone()
    snapshot_row = connection.execute(
        """
        SELECT app_profile_json
        FROM session_snapshot_state
        WHERE session_token = ?
        """,
        (session_token,),
    ).fetchone()
    connection.close()

    assert row is not None
    assert row[0] is not None
    assert row[1] == "Anna"
    assert row[2] == 1
    assert row[3] == 1
    assert row[4] == "premium"
    assert snapshot_row is not None
    assert snapshot_row[0] is not None


def test_sqlite_store_supports_public_app_flow_helpers_and_bootstrap(tmp_path) -> None:
    store = SqliteBackedAppStateStore(str(tmp_path / "flow-app-state.sqlite3"))
    session_token = "tg_session_sqlite_flow"

    set_app_state_store(store)
    try:
        upsert_session_app_auth_state(
            session_token=session_token,
            user=TelegramBootstrapUser(
                id="tg_user_flow",
                display_name="Anna",
            ),
            profile=TelegramBootstrapProfile(
                onboarding_completed=False,
                daily_opt_in=False,
            ),
            entry_context=TelegramEntryContext(source="telegram_webapp"),
        )
        save_onboarding_profile_state(
            session_token=session_token,
            profile=AppProfile(
                display_name="Anna",
                birth_date="1998-06-14",
                daily_opt_in=True,
                onboarding_completed=True,
            ),
        )
        save_first_reading_state(
            session_token=session_token,
            profile=AppProfile(
                display_name="Anna",
                birth_date="1998-06-14",
                daily_opt_in=True,
                onboarding_completed=True,
            ),
            first_reading=calculate_core_numbers(
                date(1998, 6, 14),
                "Anna",
                current_date=date(2026, 4, 9),
            ),
        )
        save_compatibility_preview_state(
            session_token=session_token,
            compatibility_preview=build_compatibility_preview(
                source_birth_date=date(1998, 6, 14),
                target_birth_date=date(1997, 11, 22),
                relationship_context="romantic",
                target_display_name="Max",
            ),
        )
        mark_session_premium_state(session_token)

        bootstrap = build_bootstrap_response(session_token)

        assert bootstrap.user.display_name == "Anna"
        assert bootstrap.user.is_premium is True
        assert bootstrap.user.premium_status == "premium"
        assert bootstrap.app_profile is not None
        assert bootstrap.app_profile.birth_date == "1998-06-14"
        assert bootstrap.first_reading is not None
        assert bootstrap.compatibility_preview is not None
        assert bootstrap.home_state.compatibility_state == "previewed"
        assert bootstrap.home_state.section_badges["compatibility"] == "Premium active"
    finally:
        reset_app_state_store()


def test_sqlite_store_can_write_only_v2_tables(tmp_path) -> None:
    store = SqliteBackedAppStateStore(str(tmp_path / "v2-only.sqlite3"))
    store.write_legacy = False
    session_token = "tg_session_sqlite_v2_only"

    store.upsert_auth_state(
        session_token=session_token,
        user=TelegramBootstrapUser(
            id="tg_user_v2_only",
            display_name="Anna",
        ),
        profile=TelegramBootstrapProfile(
            onboarding_completed=False,
            daily_opt_in=False,
        ),
        entry_context=TelegramEntryContext(source="telegram_webapp"),
    )

    connection = sqlite3.connect(store.file_path)
    legacy_row = connection.execute(
        "SELECT payload FROM session_app_state WHERE session_token = ?",
        (session_token,),
    ).fetchone()
    identity_row = connection.execute(
        "SELECT display_name FROM session_identity_state WHERE session_token = ?",
        (session_token,),
    ).fetchone()
    connection.close()

    assert legacy_row is None
    assert identity_row == ("Anna",)


def test_sqlite_v2_only_mode_supports_bootstrap_flow_without_legacy_writes(tmp_path) -> None:
    store = SqliteBackedAppStateStore(str(tmp_path / "v2-only-bootstrap.sqlite3"))
    store.write_legacy = False
    session_token = "tg_session_sqlite_v2_bootstrap"

    set_app_state_store(store)
    try:
        upsert_session_app_auth_state(
            session_token=session_token,
            user=TelegramBootstrapUser(
                id="tg_user_v2_bootstrap",
                display_name="Anna",
            ),
            profile=TelegramBootstrapProfile(
                onboarding_completed=False,
                daily_opt_in=False,
            ),
            entry_context=TelegramEntryContext(source="telegram_webapp"),
        )
        save_onboarding_profile_state(
            session_token=session_token,
            profile=AppProfile(
                display_name="Anna",
                birth_date="1998-06-14",
                daily_opt_in=True,
                onboarding_completed=True,
            ),
        )
        save_first_reading_state(
            session_token=session_token,
            profile=AppProfile(
                display_name="Anna",
                birth_date="1998-06-14",
                daily_opt_in=True,
                onboarding_completed=True,
            ),
            first_reading=calculate_core_numbers(
                date(1998, 6, 14),
                "Anna",
                current_date=date(2026, 4, 9),
            ),
        )
        save_compatibility_preview_state(
            session_token=session_token,
            compatibility_preview=build_compatibility_preview(
                source_birth_date=date(1998, 6, 14),
                target_birth_date=date(1997, 11, 22),
                relationship_context="romantic",
                target_display_name="Max",
            ),
        )
        mark_session_premium_state(session_token)

        bootstrap = build_bootstrap_response(session_token)

        connection = sqlite3.connect(store.file_path)
        legacy_row = connection.execute(
            "SELECT payload FROM session_app_state WHERE session_token = ?",
            (session_token,),
        ).fetchone()
        identity_row = connection.execute(
            "SELECT premium_status FROM session_identity_state WHERE session_token = ?",
            (session_token,),
        ).fetchone()
        snapshot_row = connection.execute(
            """
            SELECT app_profile_json, first_reading_json, compatibility_preview_json
            FROM session_snapshot_state
            WHERE session_token = ?
            """,
            (session_token,),
        ).fetchone()
        connection.close()

        assert bootstrap.user.is_premium is True
        assert bootstrap.user.premium_status == "premium"
        assert bootstrap.home_state.compatibility_state == "previewed"
        assert bootstrap.compatibility_preview is not None
        assert legacy_row is None
        assert identity_row == ("premium",)
        assert snapshot_row is not None
        assert snapshot_row[0] is not None
        assert snapshot_row[1] is not None
        assert snapshot_row[2] is not None
    finally:
        reset_app_state_store()


def test_sqlite_v2_only_state_survives_cold_start_without_legacy_reads(tmp_path) -> None:
    store_path = tmp_path / "v2-cold-start.sqlite3"
    session_token = "tg_session_v2_cold_start"
    store = SqliteBackedAppStateStore(str(store_path))
    store.write_legacy = False

    store.upsert_auth_state(
        session_token=session_token,
        user=TelegramBootstrapUser(
            id="tg_user_cold_start",
            display_name="Anna",
        ),
        profile=TelegramBootstrapProfile(
            onboarding_completed=False,
            daily_opt_in=False,
        ),
        entry_context=TelegramEntryContext(source="telegram_webapp"),
    )
    store.save_profile(
        session_token=session_token,
        profile=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=True,
        ),
    )
    store.mark_premium(session_token=session_token)

    restored_store = SqliteBackedAppStateStore(str(store_path))
    restored_store.write_legacy = False
    state = restored_store.get(session_token)

    connection = sqlite3.connect(store_path)
    legacy_row = connection.execute(
        "SELECT payload FROM session_app_state WHERE session_token = ?",
        (session_token,),
    ).fetchone()
    identity_row = connection.execute(
        """
        SELECT display_name, onboarding_completed, daily_opt_in, is_premium, premium_status
        FROM session_identity_state
        WHERE session_token = ?
        """,
        (session_token,),
    ).fetchone()
    connection.close()

    assert state is not None
    assert state.user.display_name == "Anna"
    assert state.user.is_premium is True
    assert state.profile.onboarding_completed is True
    assert legacy_row is None
    assert identity_row == ("Anna", 1, 1, 1, "premium")


def test_sqlite_legacy_migration_helper_backfills_v2_tables_once(tmp_path) -> None:
    store_path = tmp_path / "legacy-migrate-once.sqlite3"
    session_token = "tg_session_legacy_migrate_once"

    connection = sqlite3.connect(store_path)
    connection.execute(
        """
        CREATE TABLE session_app_state (
            session_token TEXT PRIMARY KEY,
            payload TEXT NOT NULL
        )
        """
    )
    connection.execute(
        """
        CREATE TABLE session_identity_state (
            session_token TEXT PRIMARY KEY,
            user_json TEXT NOT NULL,
            profile_json TEXT NOT NULL,
            entry_context_json TEXT NOT NULL,
            display_name TEXT,
            onboarding_completed INTEGER NOT NULL,
            daily_opt_in INTEGER NOT NULL,
            is_premium INTEGER NOT NULL,
            premium_status TEXT NOT NULL
        )
        """
    )
    connection.execute(
        """
        CREATE TABLE session_snapshot_state (
            session_token TEXT PRIMARY KEY,
            app_profile_json TEXT,
            first_reading_json TEXT,
            compatibility_preview_json TEXT
        )
        """
    )
    connection.execute(
        """
        INSERT INTO session_app_state (session_token, payload)
        VALUES (?, ?)
        """,
        (
            session_token,
            json.dumps(
                {
                    "user": {
                        "id": "tg_user_legacy_once",
                        "display_name": "Anna",
                        "is_premium": True,
                        "premium_status": "premium",
                    },
                    "profile": {
                        "onboarding_completed": True,
                        "daily_opt_in": True,
                    },
                    "entry_context": {"source": "telegram_webapp"},
                    "app_profile": {
                        "display_name": "Anna",
                        "birth_date": "1998-06-14",
                        "daily_opt_in": True,
                        "onboarding_completed": True,
                    },
                    "first_reading": None,
                    "compatibility_preview": None,
                },
                ensure_ascii=True,
            ),
        ),
    )

    migrate_sqlite_legacy_app_state_to_v2(connection)
    first_identity_count = connection.execute(
        "SELECT COUNT(*) FROM session_identity_state WHERE session_token = ?",
        (session_token,),
    ).fetchone()
    first_snapshot_count = connection.execute(
        "SELECT COUNT(*) FROM session_snapshot_state WHERE session_token = ?",
        (session_token,),
    ).fetchone()

    migrate_sqlite_legacy_app_state_to_v2(connection)
    second_identity_count = connection.execute(
        "SELECT COUNT(*) FROM session_identity_state WHERE session_token = ?",
        (session_token,),
    ).fetchone()
    second_snapshot_count = connection.execute(
        "SELECT COUNT(*) FROM session_snapshot_state WHERE session_token = ?",
        (session_token,),
    ).fetchone()
    connection.close()

    assert first_identity_count == (1,)
    assert first_snapshot_count == (1,)
    assert second_identity_count == (1,)
    assert second_snapshot_count == (1,)


def test_sqlite_legacy_file_migration_helper_creates_v2_rows(tmp_path) -> None:
    store_path = tmp_path / "legacy-file-migrate.sqlite3"
    session_token = "tg_session_legacy_file_migrate"

    connection = sqlite3.connect(store_path)
    connection.execute(
        """
        CREATE TABLE session_app_state (
            session_token TEXT PRIMARY KEY,
            payload TEXT NOT NULL
        )
        """
    )
    connection.execute(
        """
        INSERT INTO session_app_state (session_token, payload)
        VALUES (?, ?)
        """,
        (
            session_token,
            json.dumps(
                {
                    "user": {
                        "id": "tg_user_legacy_file",
                        "display_name": "Anna",
                        "is_premium": False,
                        "premium_status": "free",
                    },
                    "profile": {
                        "onboarding_completed": True,
                        "daily_opt_in": True,
                    },
                    "entry_context": {"source": "telegram_webapp"},
                    "app_profile": {
                        "display_name": "Anna",
                        "birth_date": "1998-06-14",
                        "daily_opt_in": True,
                        "onboarding_completed": True,
                    },
                    "first_reading": None,
                    "compatibility_preview": None,
                },
                ensure_ascii=True,
            ),
        ),
    )
    connection.commit()
    connection.close()

    migrate_sqlite_legacy_app_state_file(str(store_path))

    connection = sqlite3.connect(store_path)
    identity_row = connection.execute(
        "SELECT display_name FROM session_identity_state WHERE session_token = ?",
        (session_token,),
    ).fetchone()
    snapshot_row = connection.execute(
        "SELECT app_profile_json FROM session_snapshot_state WHERE session_token = ?",
        (session_token,),
    ).fetchone()
    connection.close()

    assert identity_row == ("Anna",)
    assert snapshot_row is not None
    assert snapshot_row[0] is not None


def test_sqlite_store_can_disable_auto_migration_for_legacy_only_file(tmp_path) -> None:
    store_path = tmp_path / "legacy-no-auto-migrate.sqlite3"
    session_token = "tg_session_legacy_no_auto"

    connection = sqlite3.connect(store_path)
    connection.execute(
        """
        CREATE TABLE session_app_state (
            session_token TEXT PRIMARY KEY,
            payload TEXT NOT NULL
        )
        """
    )
    connection.execute(
        """
        INSERT INTO session_app_state (session_token, payload)
        VALUES (?, ?)
        """,
        (
            session_token,
            json.dumps(
                {
                    "user": {
                        "id": "tg_user_legacy_no_auto",
                        "display_name": "Anna",
                        "is_premium": False,
                        "premium_status": "free",
                    },
                    "profile": {
                        "onboarding_completed": True,
                        "daily_opt_in": True,
                    },
                    "entry_context": {"source": "telegram_webapp"},
                    "app_profile": {
                        "display_name": "Anna",
                        "birth_date": "1998-06-14",
                        "daily_opt_in": True,
                        "onboarding_completed": True,
                    },
                    "first_reading": None,
                    "compatibility_preview": None,
                },
                ensure_ascii=True,
            ),
        ),
    )
    connection.commit()
    connection.close()

    store = SqliteBackedAppStateStore(str(store_path), auto_migrate=False)
    state = store.get(session_token)

    connection = sqlite3.connect(store_path)
    identity_row = connection.execute(
        "SELECT 1 FROM session_identity_state WHERE session_token = ?",
        (session_token,),
    ).fetchone()
    connection.close()

    assert state is None
    assert identity_row is None


def test_sqlite_production_like_mode_works_after_manual_migration(tmp_path) -> None:
    store_path = tmp_path / "prod-like.sqlite3"
    session_token = "tg_session_prod_like"

    connection = sqlite3.connect(store_path)
    connection.execute(
        """
        CREATE TABLE session_app_state (
            session_token TEXT PRIMARY KEY,
            payload TEXT NOT NULL
        )
        """
    )
    connection.execute(
        """
        INSERT INTO session_app_state (session_token, payload)
        VALUES (?, ?)
        """,
        (
            session_token,
            json.dumps(
                {
                    "user": {
                        "id": "tg_user_prod_like",
                        "display_name": "Anna",
                        "is_premium": True,
                        "premium_status": "premium",
                    },
                    "profile": {
                        "onboarding_completed": True,
                        "daily_opt_in": True,
                    },
                    "entry_context": {"source": "telegram_webapp"},
                    "app_profile": {
                        "display_name": "Anna",
                        "birth_date": "1998-06-14",
                        "daily_opt_in": True,
                        "onboarding_completed": True,
                    },
                    "first_reading": {
                        **calculate_core_numbers(
                            date(1998, 6, 14),
                            "Anna",
                            current_date=date(2026, 4, 9),
                        ).model_dump(mode="json")
                    },
                    "compatibility_preview": build_compatibility_preview(
                        source_birth_date=date(1998, 6, 14),
                        target_birth_date=date(1997, 11, 22),
                        relationship_context="romantic",
                        target_display_name="Max",
                    ).model_dump(mode="json"),
                },
                ensure_ascii=True,
            ),
        ),
    )
    connection.commit()
    connection.close()

    migrate_sqlite_legacy_app_state_file(str(store_path))

    store = SqliteBackedAppStateStore(
        str(store_path),
        auto_migrate=False,
    )
    store.write_legacy = False
    state = store.get(session_token)

    connection = sqlite3.connect(store_path)
    legacy_row = connection.execute(
        "SELECT payload FROM session_app_state WHERE session_token = ?",
        (session_token,),
    ).fetchone()
    identity_row = connection.execute(
        """
        SELECT display_name, onboarding_completed, daily_opt_in, is_premium, premium_status
        FROM session_identity_state
        WHERE session_token = ?
        """,
        (session_token,),
    ).fetchone()
    snapshot_row = connection.execute(
        """
        SELECT app_profile_json, first_reading_json, compatibility_preview_json
        FROM session_snapshot_state
        WHERE session_token = ?
        """,
        (session_token,),
    ).fetchone()
    connection.close()

    assert state is not None
    assert state.user.display_name == "Anna"
    assert state.user.is_premium is True
    assert state.first_reading is not None
    assert state.compatibility_preview is not None
    assert legacy_row is not None
    assert identity_row == ("Anna", 1, 1, 1, "premium")
    assert snapshot_row is not None
    assert snapshot_row[0] is not None
    assert snapshot_row[1] is not None
    assert snapshot_row[2] is not None
