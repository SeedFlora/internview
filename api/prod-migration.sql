-- ============================================================================
-- InternView production DB migration
-- Run ONCE against the production database, together with deploying the
-- fix/backend-hardening commit. These fix DATA that the code deploy cannot.
-- Safe to re-run (idempotent).
-- ============================================================================

-- 1. ADMIN privilege_level must be a scope keyword, not a number.
--    UserRepository.getUserByUserPrivilege() switches on 'all'|'cross_dept'|
--    'dept'|'major'. A numeric value falls through to "deny everyone", so the
--    admin User Management list (GET /user) returns EMPTY for every admin.
UPDATE roles SET privilege_level = 'all'   WHERE role_name = 'ADMIN';
UPDATE roles SET privilege_level = 'major' WHERE role_name = 'USER';

-- 2. Back-fill the default USER role for accounts registered before the
--    register() fix (they have no user_roles row -> empty "roles" JWT claim).
--    Does not touch accounts that already have any role (e.g. admins).
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r ON r.role_name = 'USER'
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur WHERE ur.user_id = u.user_id
);

-- 3. Repair any existing company whose slug is empty/NULL (created via the old
--    approve-request path). Regenerates a slug from the name. If two rows would
--    collide, the second keeps a numeric suffix. Review the SELECT first.
--    SELECT company_id, company_name, company_slug FROM companies
--    WHERE company_slug IS NULL OR company_slug = '';
UPDATE companies
SET company_slug = lower(regexp_replace(trim(company_name), '\s+', '-', 'g'))
WHERE company_slug IS NULL OR company_slug = '';

-- 4. Index the refresh-token jti. findValidRefreshToken filters on jti on every
--    /auth/refresh (every ~15 min per active user); without an index that is a
--    sequential scan over an ever-growing table.
CREATE INDEX IF NOT EXISTS idx_user_tokens_jti ON user_tokens (jti);

-- 5. Prevent duplicate likes / saves from a check-then-act race (double-click).
--    De-duplicate any existing dupes first, then add the unique constraints so
--    the DB rejects a second concurrent insert instead of silently double-
--    counting. Keeps the lowest-id row of each (user, target) pair.
DELETE FROM review_likes a USING review_likes b
WHERE a.review_like_id > b.review_like_id
  AND a.user_id = b.user_id
  AND a.internship_header_id = b.internship_header_id;
ALTER TABLE review_likes
  DROP CONSTRAINT IF EXISTS uq_review_likes_user_header,
  ADD  CONSTRAINT uq_review_likes_user_header UNIQUE (user_id, internship_header_id);

DELETE FROM company_saves a USING company_saves b
WHERE a.company_save_id > b.company_save_id
  AND a.user_id = b.user_id
  AND a.company_id = b.company_id;
ALTER TABLE company_saves
  DROP CONSTRAINT IF EXISTS uq_company_saves_user_company,
  ADD  CONSTRAINT uq_company_saves_user_company UNIQUE (user_id, company_id);

-- 6. Password-reset tokens (forgot-password feature). REQUIRED: the app runs
--    ddl-auto=validate, so this table must exist BEFORE the new code is deployed
--    or startup fails. Only a SHA-256 hash of each token is stored.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    reset_token_id BIGSERIAL PRIMARY KEY,
    user_id        BIGINT      NOT NULL REFERENCES users (user_id),
    token_hash     VARCHAR(64) NOT NULL UNIQUE,
    expires_at     TIMESTAMPTZ NOT NULL,
    used           BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens (user_id);
