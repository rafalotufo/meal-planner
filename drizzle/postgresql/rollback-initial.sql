-- Destructive proof for disposable test databases only. Never run on development
-- or hosted data. Production rollback preserves data and requires a reviewed plan.
DROP TABLE family_invitations;
DROP TABLE app_users;
DROP TABLE families;
DROP TABLE __drizzle_migrations;
