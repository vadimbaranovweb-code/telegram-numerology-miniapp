import json
from pathlib import Path
import sqlite3
from typing import Optional, Protocol

from app.core.settings import get_settings
from app.schemas.auth import (
    TelegramBootstrapProfile,
    TelegramBootstrapUser,
    TelegramEntryContext,
)
from app.schemas.compatibility import CompatibilityPreviewResponse
from app.schemas.numerology import NumerologyCalculationResponse
from app.schemas.profile import AppProfile
from app.services.session_state import (
    TemporarySessionState,
    clear_session_snapshot,
    complete_onboarding_for_session,
    get_session_state,
    mark_premium_for_session,
    reset_session_state_store,
    save_app_profile_for_session,
    save_compatibility_preview_for_session,
    store_session_snapshot,
    upsert_session_auth_state,
)


class AppStateStore(Protocol):
    def upsert_auth_state(
        self,
        *,
        session_token: str,
        user: TelegramBootstrapUser,
        profile: TelegramBootstrapProfile,
        entry_context: TelegramEntryContext,
    ) -> TemporarySessionState: ...

    def get(self, session_token: str) -> Optional[TemporarySessionState]: ...

    def save_profile(
        self,
        *,
        session_token: str,
        profile: AppProfile,
    ) -> TemporarySessionState: ...

    def complete_onboarding(
        self,
        session_token: str,
    ) -> Optional[TemporarySessionState]: ...

    def save_first_reading(
        self,
        *,
        session_token: str,
        profile: AppProfile,
        first_reading: NumerologyCalculationResponse,
    ) -> TemporarySessionState: ...

    def save_compatibility_preview(
        self,
        *,
        session_token: str,
        compatibility_preview: CompatibilityPreviewResponse,
    ) -> TemporarySessionState: ...

    def mark_premium(
        self,
        *,
        session_token: str,
    ) -> Optional[TemporarySessionState]: ...

    def clear(self, session_token: str) -> None: ...

    def reset(self) -> None: ...


class InMemorySessionAppStateStore:
    def upsert_auth_state(
        self,
        *,
        session_token: str,
        user: TelegramBootstrapUser,
        profile: TelegramBootstrapProfile,
        entry_context: TelegramEntryContext,
    ) -> TemporarySessionState:
        return upsert_session_auth_state(
            session_token=session_token,
            user=user,
            profile=profile,
            entry_context=entry_context,
        )

    def get(self, session_token: str) -> Optional[TemporarySessionState]:
        return get_session_state(session_token)

    def save_profile(
        self,
        *,
        session_token: str,
        profile: AppProfile,
    ) -> TemporarySessionState:
        return save_app_profile_for_session(
            session_token=session_token,
            app_profile=profile,
        )

    def complete_onboarding(
        self,
        session_token: str,
    ) -> Optional[TemporarySessionState]:
        return complete_onboarding_for_session(session_token)

    def save_first_reading(
        self,
        *,
        session_token: str,
        profile: AppProfile,
        first_reading: NumerologyCalculationResponse,
    ) -> TemporarySessionState:
        return store_session_snapshot(
            session_token=session_token,
            app_profile=profile,
            first_reading=first_reading,
        )

    def clear(self, session_token: str) -> None:
        clear_session_snapshot(session_token)

    def reset(self) -> None:
        reset_session_state_store()

    def save_compatibility_preview(
        self,
        *,
        session_token: str,
        compatibility_preview: CompatibilityPreviewResponse,
    ) -> TemporarySessionState:
        return save_compatibility_preview_for_session(
            session_token=session_token,
            compatibility_preview=compatibility_preview,
        )

    def mark_premium(
        self,
        *,
        session_token: str,
    ) -> Optional[TemporarySessionState]:
        return mark_premium_for_session(session_token)


class FileBackedAppStateStore:
    def __init__(self, file_path: str) -> None:
        self.file_path = Path(file_path)

    def upsert_auth_state(
        self,
        *,
        session_token: str,
        user: TelegramBootstrapUser,
        profile: TelegramBootstrapProfile,
        entry_context: TelegramEntryContext,
    ) -> TemporarySessionState:
        states = self._read_all()
        existing_state = states.get(session_token)

        if existing_state is None:
            existing_state = TemporarySessionState(
                user=user,
                profile=profile,
                entry_context=entry_context,
            )
        else:
            existing_state.user = user.model_copy(
                update={
                    "display_name": existing_state.app_profile.display_name
                    if existing_state.app_profile
                    and existing_state.app_profile.display_name
                    else user.display_name,
                    # Preserve premium across re-auth from different devices
                    "is_premium": existing_state.user.is_premium,
                    "premium_status": existing_state.user.premium_status,
                },
            )
            existing_state.profile = existing_state.profile.model_copy(
                update={
                    "onboarding_completed": (
                        existing_state.app_profile.onboarding_completed
                        if existing_state.app_profile
                        else profile.onboarding_completed
                    ),
                    "daily_opt_in": (
                        existing_state.app_profile.daily_opt_in
                        if existing_state.app_profile
                        else profile.daily_opt_in
                    ),
                },
            )
            existing_state.entry_context = entry_context

        states[session_token] = existing_state
        self._write_all(states)
        return existing_state

    def get(self, session_token: str) -> Optional[TemporarySessionState]:
        return self._read_all().get(session_token)

    def save_profile(
        self,
        *,
        session_token: str,
        profile: AppProfile,
    ) -> TemporarySessionState:
        states = self._read_all()
        existing_state = self._get_or_create_state(states, session_token)
        existing_state.app_profile = profile
        existing_state.user = existing_state.user.model_copy(
            update={
                "display_name": profile.display_name or existing_state.user.display_name,
            },
        )
        existing_state.profile = existing_state.profile.model_copy(
            update={
                "onboarding_completed": profile.onboarding_completed,
                "daily_opt_in": profile.daily_opt_in,
            },
        )
        states[session_token] = existing_state
        self._write_all(states)
        return existing_state

    def complete_onboarding(
        self,
        session_token: str,
    ) -> Optional[TemporarySessionState]:
        states = self._read_all()
        existing_state = states.get(session_token)

        if existing_state is None:
            return None

        if existing_state.app_profile is not None:
            existing_state.app_profile = existing_state.app_profile.model_copy(
                update={"onboarding_completed": True},
            )

        existing_state.profile = existing_state.profile.model_copy(
            update={"onboarding_completed": True},
        )
        states[session_token] = existing_state
        self._write_all(states)
        return existing_state

    def save_first_reading(
        self,
        *,
        session_token: str,
        profile: AppProfile,
        first_reading: NumerologyCalculationResponse,
    ) -> TemporarySessionState:
        states = self._read_all()
        existing_state = self._get_or_create_state(states, session_token)
        existing_state.app_profile = profile
        existing_state.first_reading = first_reading
        existing_state.user = existing_state.user.model_copy(
            update={
                "display_name": profile.display_name or existing_state.user.display_name,
            },
        )
        existing_state.profile = existing_state.profile.model_copy(
            update={
                "onboarding_completed": profile.onboarding_completed,
                "daily_opt_in": profile.daily_opt_in,
            },
        )
        states[session_token] = existing_state
        self._write_all(states)
        return existing_state

    def save_compatibility_preview(
        self,
        *,
        session_token: str,
        compatibility_preview: CompatibilityPreviewResponse,
    ) -> TemporarySessionState:
        states = self._read_all()
        existing_state = self._get_or_create_state(states, session_token)
        existing_state.compatibility_preview = compatibility_preview
        states[session_token] = existing_state
        self._write_all(states)
        return existing_state

    def clear(self, session_token: str) -> None:
        states = self._read_all()
        existing_state = states.get(session_token)

        if existing_state is None:
            return

        existing_state.app_profile = None
        existing_state.first_reading = None
        existing_state.compatibility_preview = None
        existing_state.profile = existing_state.profile.model_copy(
            update={
                "onboarding_completed": False,
                "daily_opt_in": False,
            },
        )
        states[session_token] = existing_state
        self._write_all(states)

    def mark_premium(
        self,
        *,
        session_token: str,
    ) -> Optional[TemporarySessionState]:
        states = self._read_all()
        existing_state = states.get(session_token)

        if existing_state is None:
            return None

        existing_state.user = existing_state.user.model_copy(
            update={
                "is_premium": True,
                "premium_status": "premium",
            },
        )
        states[session_token] = existing_state
        self._write_all(states)
        return existing_state

    def reset(self) -> None:
        if self.file_path.exists():
            self.file_path.unlink()

    def _get_or_create_state(
        self,
        states: dict[str, TemporarySessionState],
        session_token: str,
    ) -> TemporarySessionState:
        existing_state = states.get(session_token)

        if existing_state is not None:
            return existing_state

        new_state = TemporarySessionState(
            user=TelegramBootstrapUser(id="tg_user_unknown"),
            profile=TelegramBootstrapProfile(),
            entry_context=TelegramEntryContext(),
        )
        states[session_token] = new_state
        return new_state

    def _read_all(self) -> dict[str, TemporarySessionState]:
        if not self.file_path.exists():
            return {}

        raw = json.loads(self.file_path.read_text(encoding="utf-8"))
        return {
            session_token: TemporarySessionState(
                user=TelegramBootstrapUser.model_validate(payload["user"]),
                profile=TelegramBootstrapProfile.model_validate(payload["profile"]),
                entry_context=TelegramEntryContext.model_validate(payload["entry_context"]),
                app_profile=(
                    AppProfile.model_validate(payload.get("app_profile") or payload.get("profile_snapshot"))
                    if (payload.get("app_profile") or payload.get("profile_snapshot"))
                    is not None
                    else None
                ),
                first_reading=(
                    NumerologyCalculationResponse.model_validate(payload["first_reading"])
                    if payload.get("first_reading") is not None
                    else None
                ),
                compatibility_preview=(
                    CompatibilityPreviewResponse.model_validate(
                        payload["compatibility_preview"]
                    )
                    if payload.get("compatibility_preview") is not None
                    else None
                ),
            )
            for session_token, payload in raw.items()
        }

    def _write_all(self, states: dict[str, TemporarySessionState]) -> None:
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        raw = {
            session_token: {
                "user": state.user.model_dump(mode="json"),
                "profile": state.profile.model_dump(mode="json"),
                "entry_context": state.entry_context.model_dump(mode="json"),
                "app_profile": (
                    state.app_profile.model_dump(mode="json")
                    if state.app_profile is not None
                    else None
                ),
                "first_reading": (
                    state.first_reading.model_dump(mode="json")
                    if state.first_reading is not None
                    else None
                ),
                "compatibility_preview": (
                    state.compatibility_preview.model_dump(mode="json")
                    if state.compatibility_preview is not None
                    else None
                ),
            }
            for session_token, state in states.items()
        }
        self.file_path.write_text(
            json.dumps(raw, ensure_ascii=True, indent=2),
            encoding="utf-8",
        )


class SqliteBackedAppStateStore:
    def __init__(self, file_path: str, *, auto_migrate: Optional[bool] = None) -> None:
        self.file_path = Path(file_path)
        settings = get_settings()
        self.write_legacy = settings.app_state_store_sqlite_write_legacy
        self.auto_migrate = (
            settings.app_state_store_sqlite_auto_migrate
            if auto_migrate is None
            else auto_migrate
        )
        self._ensure_db()

    def upsert_auth_state(
        self,
        *,
        session_token: str,
        user: TelegramBootstrapUser,
        profile: TelegramBootstrapProfile,
        entry_context: TelegramEntryContext,
    ) -> TemporarySessionState:
        existing_state = self.get(session_token)

        if existing_state is None:
            existing_state = TemporarySessionState(
                user=user,
                profile=profile,
                entry_context=entry_context,
            )
        else:
            existing_state.user = user.model_copy(
                update={
                    "display_name": existing_state.app_profile.display_name
                    if existing_state.app_profile
                    and existing_state.app_profile.display_name
                    else user.display_name,
                    # Preserve premium across re-auth from different devices
                    "is_premium": existing_state.user.is_premium,
                    "premium_status": existing_state.user.premium_status,
                },
            )
            existing_state.profile = existing_state.profile.model_copy(
                update={
                    "onboarding_completed": (
                        existing_state.app_profile.onboarding_completed
                        if existing_state.app_profile
                        else profile.onboarding_completed
                    ),
                    "daily_opt_in": (
                        existing_state.app_profile.daily_opt_in
                        if existing_state.app_profile
                        else profile.daily_opt_in
                    ),
                },
            )
            existing_state.entry_context = entry_context

        self._save(session_token, existing_state)
        return existing_state

    def get(self, session_token: str) -> Optional[TemporarySessionState]:
        return self._read_v2_state(session_token)

    def save_profile(
        self,
        *,
        session_token: str,
        profile: AppProfile,
    ) -> TemporarySessionState:
        existing_state = self._get_or_create_state(session_token)
        existing_state.app_profile = profile
        existing_state.user = existing_state.user.model_copy(
            update={
                "display_name": profile.display_name or existing_state.user.display_name,
            },
        )
        existing_state.profile = existing_state.profile.model_copy(
            update={
                "onboarding_completed": profile.onboarding_completed,
                "daily_opt_in": profile.daily_opt_in,
            },
        )
        self._save(session_token, existing_state)
        return existing_state

    def complete_onboarding(
        self,
        session_token: str,
    ) -> Optional[TemporarySessionState]:
        existing_state = self.get(session_token)

        if existing_state is None:
            return None

        if existing_state.app_profile is not None:
            existing_state.app_profile = existing_state.app_profile.model_copy(
                update={"onboarding_completed": True},
            )

        existing_state.profile = existing_state.profile.model_copy(
            update={"onboarding_completed": True},
        )
        self._save(session_token, existing_state)
        return existing_state

    def save_first_reading(
        self,
        *,
        session_token: str,
        profile: AppProfile,
        first_reading: NumerologyCalculationResponse,
    ) -> TemporarySessionState:
        existing_state = self._get_or_create_state(session_token)
        existing_state.app_profile = profile
        existing_state.first_reading = first_reading
        existing_state.user = existing_state.user.model_copy(
            update={
                "display_name": profile.display_name or existing_state.user.display_name,
            },
        )
        existing_state.profile = existing_state.profile.model_copy(
            update={
                "onboarding_completed": profile.onboarding_completed,
                "daily_opt_in": profile.daily_opt_in,
            },
        )
        self._save(session_token, existing_state)
        return existing_state

    def save_compatibility_preview(
        self,
        *,
        session_token: str,
        compatibility_preview: CompatibilityPreviewResponse,
    ) -> TemporarySessionState:
        existing_state = self._get_or_create_state(session_token)
        existing_state.compatibility_preview = compatibility_preview
        self._save(session_token, existing_state)
        return existing_state

    def mark_premium(
        self,
        *,
        session_token: str,
    ) -> Optional[TemporarySessionState]:
        existing_state = self.get(session_token)

        if existing_state is None:
            return None

        existing_state.user = existing_state.user.model_copy(
            update={
                "is_premium": True,
                "premium_status": "premium",
            },
        )
        self._save(session_token, existing_state)
        return existing_state

    def clear(self, session_token: str) -> None:
        existing_state = self.get(session_token)

        if existing_state is None:
            return

        existing_state.app_profile = None
        existing_state.first_reading = None
        existing_state.compatibility_preview = None
        existing_state.profile = existing_state.profile.model_copy(
            update={
                "onboarding_completed": False,
                "daily_opt_in": False,
            },
        )
        self._save(session_token, existing_state)

    def reset(self) -> None:
        if self.file_path.exists():
            self.file_path.unlink()
        self._ensure_db()

    def _ensure_db(self) -> None:
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS session_app_state (
                    session_token TEXT PRIMARY KEY,
                    user_json TEXT,
                    profile_json TEXT,
                    entry_context_json TEXT,
                    app_profile_json TEXT,
                    first_reading_json TEXT,
                    compatibility_preview_json TEXT,
                    display_name TEXT,
                    onboarding_completed INTEGER,
                    daily_opt_in INTEGER,
                    is_premium INTEGER,
                    premium_status TEXT,
                    payload TEXT
                )
                """
            )
            self._ensure_columns(connection)
            self._ensure_v2_tables(connection)
            if self.auto_migrate:
                migrate_sqlite_legacy_app_state_to_v2(connection)
            connection.commit()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.file_path)

    def _get_or_create_state(self, session_token: str) -> TemporarySessionState:
        existing_state = self.get(session_token)

        if existing_state is not None:
            return existing_state

        return TemporarySessionState(
            user=TelegramBootstrapUser(id="tg_user_unknown"),
            profile=TelegramBootstrapProfile(),
            entry_context=TelegramEntryContext(),
        )

    def _save(self, session_token: str, state: TemporarySessionState) -> None:
        serialized_state = self._serialize_state(state)
        payload = json.dumps(serialized_state, ensure_ascii=True)
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO session_identity_state (
                    session_token,
                    user_json,
                    profile_json,
                    entry_context_json,
                    display_name,
                    onboarding_completed,
                    daily_opt_in,
                    is_premium,
                    premium_status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(session_token) DO UPDATE SET
                    user_json = excluded.user_json,
                    profile_json = excluded.profile_json,
                    entry_context_json = excluded.entry_context_json,
                    display_name = excluded.display_name,
                    onboarding_completed = excluded.onboarding_completed,
                    daily_opt_in = excluded.daily_opt_in,
                    is_premium = excluded.is_premium,
                    premium_status = excluded.premium_status
                """,
                (
                    session_token,
                    json.dumps(serialized_state["user"], ensure_ascii=True),
                    json.dumps(serialized_state["profile"], ensure_ascii=True),
                    json.dumps(serialized_state["entry_context"], ensure_ascii=True),
                    state.user.display_name,
                    int(state.profile.onboarding_completed),
                    int(state.profile.daily_opt_in),
                    int(state.user.is_premium),
                    state.user.premium_status,
                ),
            )
            connection.execute(
                """
                INSERT INTO session_snapshot_state (
                    session_token,
                    app_profile_json,
                    first_reading_json,
                    compatibility_preview_json
                )
                VALUES (?, ?, ?, ?)
                ON CONFLICT(session_token) DO UPDATE SET
                    app_profile_json = excluded.app_profile_json,
                    first_reading_json = excluded.first_reading_json,
                    compatibility_preview_json = excluded.compatibility_preview_json
                """,
                (
                    session_token,
                    (
                        json.dumps(serialized_state["app_profile"], ensure_ascii=True)
                        if serialized_state["app_profile"] is not None
                        else None
                    ),
                    (
                        json.dumps(serialized_state["first_reading"], ensure_ascii=True)
                        if serialized_state["first_reading"] is not None
                        else None
                    ),
                    (
                        json.dumps(
                            serialized_state["compatibility_preview"],
                            ensure_ascii=True,
                        )
                        if serialized_state["compatibility_preview"] is not None
                        else None
                    ),
                ),
            )
            if self.write_legacy:
                connection.execute(
                    """
                    INSERT INTO session_app_state (
                        session_token,
                        user_json,
                        profile_json,
                        entry_context_json,
                        app_profile_json,
                        first_reading_json,
                        compatibility_preview_json,
                        display_name,
                        onboarding_completed,
                        daily_opt_in,
                        is_premium,
                        premium_status,
                        payload
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(session_token) DO UPDATE SET payload = excluded.payload
                    , user_json = excluded.user_json
                    , profile_json = excluded.profile_json
                    , entry_context_json = excluded.entry_context_json
                    , app_profile_json = excluded.app_profile_json
                    , first_reading_json = excluded.first_reading_json
                    , compatibility_preview_json = excluded.compatibility_preview_json
                    , display_name = excluded.display_name
                    , onboarding_completed = excluded.onboarding_completed
                    , daily_opt_in = excluded.daily_opt_in
                    , is_premium = excluded.is_premium
                    , premium_status = excluded.premium_status
                    """,
                    (
                        session_token,
                        json.dumps(serialized_state["user"], ensure_ascii=True),
                        json.dumps(serialized_state["profile"], ensure_ascii=True),
                        json.dumps(serialized_state["entry_context"], ensure_ascii=True),
                        (
                            json.dumps(serialized_state["app_profile"], ensure_ascii=True)
                            if serialized_state["app_profile"] is not None
                            else None
                        ),
                        (
                            json.dumps(serialized_state["first_reading"], ensure_ascii=True)
                            if serialized_state["first_reading"] is not None
                            else None
                        ),
                        (
                            json.dumps(
                                serialized_state["compatibility_preview"],
                                ensure_ascii=True,
                            )
                            if serialized_state["compatibility_preview"] is not None
                            else None
                        ),
                        state.user.display_name,
                        int(state.profile.onboarding_completed),
                        int(state.profile.daily_opt_in),
                        int(state.user.is_premium),
                        state.user.premium_status,
                        payload,
                    ),
                )
            connection.commit()

    def _serialize_state(self, state: TemporarySessionState) -> dict[str, object]:
        return {
            "user": state.user.model_dump(mode="json"),
            "profile": state.profile.model_dump(mode="json"),
            "entry_context": state.entry_context.model_dump(mode="json"),
            "app_profile": (
                state.app_profile.model_dump(mode="json")
                if state.app_profile is not None
                else None
            ),
            "first_reading": (
                state.first_reading.model_dump(mode="json")
                if state.first_reading is not None
                else None
            ),
            "compatibility_preview": (
                state.compatibility_preview.model_dump(mode="json")
                if state.compatibility_preview is not None
                else None
            ),
        }

    def _deserialize_state(self, payload: dict[str, object]) -> TemporarySessionState:
        return TemporarySessionState(
            user=TelegramBootstrapUser.model_validate(payload["user"]),
            profile=TelegramBootstrapProfile.model_validate(payload["profile"]),
            entry_context=TelegramEntryContext.model_validate(payload["entry_context"]),
            app_profile=(
                AppProfile.model_validate(payload.get("app_profile"))
                if payload.get("app_profile") is not None
                else None
            ),
            first_reading=(
                NumerologyCalculationResponse.model_validate(payload["first_reading"])
                if payload.get("first_reading") is not None
                else None
            ),
            compatibility_preview=(
                CompatibilityPreviewResponse.model_validate(
                    payload["compatibility_preview"]
                )
                if payload.get("compatibility_preview") is not None
                else None
            ),
        )

    def _ensure_columns(self, connection: sqlite3.Connection) -> None:
        _ensure_sqlite_legacy_columns(connection)

    def _backfill_structured_columns(self, connection: sqlite3.Connection) -> None:
        rows = connection.execute(
            """
            SELECT
                session_token,
                payload,
                user_json,
                profile_json,
                entry_context_json,
                app_profile_json,
                first_reading_json,
                compatibility_preview_json,
                display_name,
                onboarding_completed,
                daily_opt_in,
                is_premium,
                premium_status
            FROM session_app_state
            """
        ).fetchall()

        for row in rows:
            (
                session_token,
                payload,
                user_json,
                profile_json,
                entry_context_json,
                app_profile_json,
                first_reading_json,
                compatibility_preview_json,
                display_name,
                onboarding_completed,
                daily_opt_in,
                is_premium,
                premium_status,
            ) = row

            if payload is None or all(
                value is not None
                for value in (
                    user_json,
                    profile_json,
                    entry_context_json,
                    display_name,
                    onboarding_completed,
                    daily_opt_in,
                    is_premium,
                    premium_status,
                )
            ):
                continue

            parsed_payload = json.loads(payload)
            parsed_user = parsed_payload["user"]
            parsed_profile = parsed_payload["profile"]
            parsed_entry_context = parsed_payload["entry_context"]
            parsed_app_profile = parsed_payload.get("app_profile")
            parsed_first_reading = parsed_payload.get("first_reading")
            parsed_compatibility_preview = parsed_payload.get("compatibility_preview")

            connection.execute(
                """
                UPDATE session_app_state
                SET
                    user_json = ?,
                    profile_json = ?,
                    entry_context_json = ?,
                    app_profile_json = ?,
                    first_reading_json = ?,
                    compatibility_preview_json = ?,
                    display_name = ?,
                    onboarding_completed = ?,
                    daily_opt_in = ?,
                    is_premium = ?,
                    premium_status = ?
                WHERE session_token = ?
                """,
                (
                    json.dumps(parsed_user, ensure_ascii=True),
                    json.dumps(parsed_profile, ensure_ascii=True),
                    json.dumps(parsed_entry_context, ensure_ascii=True),
                    (
                        json.dumps(parsed_app_profile, ensure_ascii=True)
                        if parsed_app_profile is not None
                        else None
                    ),
                    (
                        json.dumps(parsed_first_reading, ensure_ascii=True)
                        if parsed_first_reading is not None
                        else None
                    ),
                    (
                        json.dumps(parsed_compatibility_preview, ensure_ascii=True)
                        if parsed_compatibility_preview is not None
                        else None
                    ),
                    parsed_user.get("display_name"),
                    int(parsed_profile.get("onboarding_completed", False)),
                    int(parsed_profile.get("daily_opt_in", False)),
                    int(parsed_user.get("is_premium", False)),
                    parsed_user.get("premium_status", "free"),
                    session_token,
                ),
            )

    def _build_payload_from_row(self, row: tuple[object, ...]) -> dict[str, object]:
        (
            user_json,
            profile_json,
            entry_context_json,
            app_profile_json,
            first_reading_json,
            compatibility_preview_json,
            display_name,
            onboarding_completed,
            daily_opt_in,
            is_premium,
            premium_status,
            payload,
        ) = row

        if user_json and profile_json and entry_context_json:
            user_payload = json.loads(user_json)
            profile_payload = json.loads(profile_json)
            entry_context_payload = json.loads(entry_context_json)

            user_payload["display_name"] = display_name
            user_payload["is_premium"] = bool(is_premium)
            user_payload["premium_status"] = premium_status or "free"
            profile_payload["onboarding_completed"] = bool(onboarding_completed)
            profile_payload["daily_opt_in"] = bool(daily_opt_in)

            return {
                "user": user_payload,
                "profile": profile_payload,
                "entry_context": entry_context_payload,
                "app_profile": (
                    json.loads(app_profile_json) if app_profile_json is not None else None
                ),
                "first_reading": (
                    json.loads(first_reading_json)
                    if first_reading_json is not None
                    else None
                ),
                "compatibility_preview": (
                    json.loads(compatibility_preview_json)
                    if compatibility_preview_json is not None
                    else None
                ),
            }

        return json.loads(payload or "{}")

    def _ensure_v2_tables(self, connection: sqlite3.Connection) -> None:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS session_identity_state (
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
            CREATE TABLE IF NOT EXISTS session_snapshot_state (
                session_token TEXT PRIMARY KEY,
                app_profile_json TEXT,
                first_reading_json TEXT,
                compatibility_preview_json TEXT
            )
            """
        )

    def _read_v2_state(self, session_token: str) -> Optional[TemporarySessionState]:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT
                    i.user_json,
                    i.profile_json,
                    i.entry_context_json,
                    s.app_profile_json,
                    s.first_reading_json,
                    s.compatibility_preview_json,
                    i.display_name,
                    i.onboarding_completed,
                    i.daily_opt_in,
                    i.is_premium,
                    i.premium_status
                FROM session_identity_state i
                LEFT JOIN session_snapshot_state s
                    ON s.session_token = i.session_token
                WHERE i.session_token = ?
                """,
                (session_token,),
            ).fetchone()

        if row is None:
            return None

        (
            user_json,
            profile_json,
            entry_context_json,
            app_profile_json,
            first_reading_json,
            compatibility_preview_json,
            display_name,
            onboarding_completed,
            daily_opt_in,
            is_premium,
            premium_status,
        ) = row

        payload = {
            "user": json.loads(user_json),
            "profile": json.loads(profile_json),
            "entry_context": json.loads(entry_context_json),
            "app_profile": json.loads(app_profile_json) if app_profile_json else None,
            "first_reading": json.loads(first_reading_json) if first_reading_json else None,
            "compatibility_preview": (
                json.loads(compatibility_preview_json)
                if compatibility_preview_json
                else None
            ),
        }
        payload["user"]["display_name"] = display_name
        payload["user"]["is_premium"] = bool(is_premium)
        payload["user"]["premium_status"] = premium_status or "free"
        payload["profile"]["onboarding_completed"] = bool(onboarding_completed)
        payload["profile"]["daily_opt_in"] = bool(daily_opt_in)
        return self._deserialize_state(payload)


def migrate_sqlite_legacy_app_state_to_v2(connection: sqlite3.Connection) -> None:
    _ensure_sqlite_legacy_columns(connection)
    _backfill_sqlite_legacy_structured_columns(connection)
    rows = connection.execute(
        """
        SELECT
            session_token,
            user_json,
            profile_json,
            entry_context_json,
            app_profile_json,
            first_reading_json,
            compatibility_preview_json,
            display_name,
            onboarding_completed,
            daily_opt_in,
            is_premium,
            premium_status,
            payload
        FROM session_app_state
        """
    ).fetchall()

    for row in rows:
        (
            session_token,
            user_json,
            profile_json,
            entry_context_json,
            app_profile_json,
            first_reading_json,
            compatibility_preview_json,
            display_name,
            onboarding_completed,
            daily_opt_in,
            is_premium,
            premium_status,
            payload,
        ) = row

        identity_exists = connection.execute(
            "SELECT 1 FROM session_identity_state WHERE session_token = ?",
            (session_token,),
        ).fetchone()
        snapshot_exists = connection.execute(
            "SELECT 1 FROM session_snapshot_state WHERE session_token = ?",
            (session_token,),
        ).fetchone()

        if identity_exists and snapshot_exists:
            continue

        parsed_payload = _build_payload_from_sqlite_row(
            (
                user_json,
                profile_json,
                entry_context_json,
                app_profile_json,
                first_reading_json,
                compatibility_preview_json,
                display_name,
                onboarding_completed,
                daily_opt_in,
                is_premium,
                premium_status,
                payload,
            )
        )

        connection.execute(
            """
            INSERT OR REPLACE INTO session_identity_state (
                session_token,
                user_json,
                profile_json,
                entry_context_json,
                display_name,
                onboarding_completed,
                daily_opt_in,
                is_premium,
                premium_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session_token,
                json.dumps(parsed_payload["user"], ensure_ascii=True),
                json.dumps(parsed_payload["profile"], ensure_ascii=True),
                json.dumps(parsed_payload["entry_context"], ensure_ascii=True),
                parsed_payload["user"].get("display_name"),
                int(parsed_payload["profile"].get("onboarding_completed", False)),
                int(parsed_payload["profile"].get("daily_opt_in", False)),
                int(parsed_payload["user"].get("is_premium", False)),
                parsed_payload["user"].get("premium_status", "free"),
            ),
        )
        connection.execute(
            """
            INSERT OR REPLACE INTO session_snapshot_state (
                session_token,
                app_profile_json,
                first_reading_json,
                compatibility_preview_json
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                session_token,
                (
                    json.dumps(parsed_payload["app_profile"], ensure_ascii=True)
                    if parsed_payload.get("app_profile") is not None
                    else None
                ),
                (
                    json.dumps(parsed_payload["first_reading"], ensure_ascii=True)
                    if parsed_payload.get("first_reading") is not None
                    else None
                ),
                (
                    json.dumps(
                        parsed_payload["compatibility_preview"],
                        ensure_ascii=True,
                    )
                    if parsed_payload.get("compatibility_preview") is not None
                    else None
                ),
            ),
        )


def migrate_sqlite_legacy_app_state_file(file_path: str) -> None:
    connection = sqlite3.connect(file_path)

    try:
        _ensure_sqlite_legacy_columns(connection)
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS session_identity_state (
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
            CREATE TABLE IF NOT EXISTS session_snapshot_state (
                session_token TEXT PRIMARY KEY,
                app_profile_json TEXT,
                first_reading_json TEXT,
                compatibility_preview_json TEXT
            )
            """
        )
        migrate_sqlite_legacy_app_state_to_v2(connection)
        connection.commit()
    finally:
        connection.close()


def _backfill_sqlite_legacy_structured_columns(connection: sqlite3.Connection) -> None:
    rows = connection.execute(
        """
        SELECT
            session_token,
            payload,
            user_json,
            profile_json,
            entry_context_json,
            app_profile_json,
            first_reading_json,
            compatibility_preview_json,
            display_name,
            onboarding_completed,
            daily_opt_in,
            is_premium,
            premium_status
        FROM session_app_state
        """
    ).fetchall()

    for row in rows:
        (
            session_token,
            payload,
            user_json,
            profile_json,
            entry_context_json,
            app_profile_json,
            first_reading_json,
            compatibility_preview_json,
            display_name,
            onboarding_completed,
            daily_opt_in,
            is_premium,
            premium_status,
        ) = row

        if payload is None or all(
            value is not None
            for value in (
                user_json,
                profile_json,
                entry_context_json,
                display_name,
                onboarding_completed,
                daily_opt_in,
                is_premium,
                premium_status,
            )
        ):
            continue

        parsed_payload = json.loads(payload)
        parsed_user = parsed_payload["user"]
        parsed_profile = parsed_payload["profile"]
        parsed_entry_context = parsed_payload["entry_context"]
        parsed_app_profile = parsed_payload.get("app_profile")
        parsed_first_reading = parsed_payload.get("first_reading")
        parsed_compatibility_preview = parsed_payload.get("compatibility_preview")

        connection.execute(
            """
            UPDATE session_app_state
            SET
                user_json = ?,
                profile_json = ?,
                entry_context_json = ?,
                app_profile_json = ?,
                first_reading_json = ?,
                compatibility_preview_json = ?,
                display_name = ?,
                onboarding_completed = ?,
                daily_opt_in = ?,
                is_premium = ?,
                premium_status = ?
            WHERE session_token = ?
            """,
            (
                json.dumps(parsed_user, ensure_ascii=True),
                json.dumps(parsed_profile, ensure_ascii=True),
                json.dumps(parsed_entry_context, ensure_ascii=True),
                (
                    json.dumps(parsed_app_profile, ensure_ascii=True)
                    if parsed_app_profile is not None
                    else None
                ),
                (
                    json.dumps(parsed_first_reading, ensure_ascii=True)
                    if parsed_first_reading is not None
                    else None
                ),
                (
                    json.dumps(parsed_compatibility_preview, ensure_ascii=True)
                    if parsed_compatibility_preview is not None
                    else None
                ),
                parsed_user.get("display_name"),
                int(parsed_profile.get("onboarding_completed", False)),
                int(parsed_profile.get("daily_opt_in", False)),
                int(parsed_user.get("is_premium", False)),
                parsed_user.get("premium_status", "free"),
                session_token,
            ),
        )


def _build_payload_from_sqlite_row(row: tuple[object, ...]) -> dict[str, object]:
    (
        user_json,
        profile_json,
        entry_context_json,
        app_profile_json,
        first_reading_json,
        compatibility_preview_json,
        display_name,
        onboarding_completed,
        daily_opt_in,
        is_premium,
        premium_status,
        payload,
    ) = row

    if user_json and profile_json and entry_context_json:
        user_payload = json.loads(user_json)
        profile_payload = json.loads(profile_json)
        entry_context_payload = json.loads(entry_context_json)

        user_payload["display_name"] = display_name
        user_payload["is_premium"] = bool(is_premium)
        user_payload["premium_status"] = premium_status or "free"
        profile_payload["onboarding_completed"] = bool(onboarding_completed)
        profile_payload["daily_opt_in"] = bool(daily_opt_in)

        return {
            "user": user_payload,
            "profile": profile_payload,
            "entry_context": entry_context_payload,
            "app_profile": (
                json.loads(app_profile_json) if app_profile_json is not None else None
            ),
            "first_reading": (
                json.loads(first_reading_json) if first_reading_json is not None else None
            ),
            "compatibility_preview": (
                json.loads(compatibility_preview_json)
                if compatibility_preview_json is not None
                else None
            ),
        }

    return json.loads(payload or "{}")


def _ensure_sqlite_legacy_columns(connection: sqlite3.Connection) -> None:
    existing_columns = {
        row[1]
        for row in connection.execute("PRAGMA table_info(session_app_state)").fetchall()
    }
    desired_columns = {
        "user_json": "TEXT",
        "profile_json": "TEXT",
        "entry_context_json": "TEXT",
        "app_profile_json": "TEXT",
        "first_reading_json": "TEXT",
        "compatibility_preview_json": "TEXT",
        "display_name": "TEXT",
        "onboarding_completed": "INTEGER",
        "daily_opt_in": "INTEGER",
        "is_premium": "INTEGER",
        "premium_status": "TEXT",
        "payload": "TEXT",
    }

    for column_name, column_type in desired_columns.items():
        if column_name in existing_columns:
            continue

        connection.execute(
            f"ALTER TABLE session_app_state ADD COLUMN {column_name} {column_type}"
        )


def _build_default_app_state_store() -> AppStateStore:
    settings = get_settings()

    if settings.app_state_store_mode == "memory":
        return InMemorySessionAppStateStore()

    if settings.app_state_store_mode == "sqlite":
        return SqliteBackedAppStateStore(settings.app_state_store_path)

    return FileBackedAppStateStore(settings.app_state_store_path)


_APP_STATE_STORE: AppStateStore = _build_default_app_state_store()


def get_app_state_store() -> AppStateStore:
    return _APP_STATE_STORE


def set_app_state_store(store: AppStateStore) -> None:
    global _APP_STATE_STORE
    _APP_STATE_STORE = store


def get_session_app_state(session_token: str) -> Optional[TemporarySessionState]:
    return get_app_state_store().get(session_token)


def upsert_session_app_auth_state(
    *,
    session_token: str,
    user: TelegramBootstrapUser,
    profile: TelegramBootstrapProfile,
    entry_context: TelegramEntryContext,
) -> TemporarySessionState:
    return get_app_state_store().upsert_auth_state(
        session_token=session_token,
        user=user,
        profile=profile,
        entry_context=entry_context,
    )


def save_onboarding_profile_state(
    *,
    session_token: str,
    profile: AppProfile,
) -> TemporarySessionState:
    return get_app_state_store().save_profile(
        session_token=session_token,
        profile=profile,
    )


def mark_onboarding_completed(session_token: str) -> Optional[TemporarySessionState]:
    return get_app_state_store().complete_onboarding(session_token)


def save_first_reading_state(
    *,
    session_token: str,
    profile: AppProfile,
    first_reading: NumerologyCalculationResponse,
) -> TemporarySessionState:
    return get_app_state_store().save_first_reading(
        session_token=session_token,
        profile=profile,
        first_reading=first_reading,
    )


def save_compatibility_preview_state(
    *,
    session_token: str,
    compatibility_preview: CompatibilityPreviewResponse,
) -> TemporarySessionState:
    return get_app_state_store().save_compatibility_preview(
        session_token=session_token,
        compatibility_preview=compatibility_preview,
    )


def clear_session_app_state(session_token: str) -> None:
    get_app_state_store().clear(session_token)


def reset_app_state_store() -> None:
    get_app_state_store().reset()


def mark_session_premium_state(
    session_token: str,
) -> Optional[TemporarySessionState]:
    return get_app_state_store().mark_premium(
        session_token=session_token,
    )


def resolve_unfinished_flow(
    session_state: Optional[TemporarySessionState],
) -> Optional[str]:
    if session_state is None or session_state.app_profile is None:
        return "onboarding"

    if session_state.first_reading is None:
        return "first_reading"

    return None
