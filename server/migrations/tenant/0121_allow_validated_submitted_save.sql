-- Frappe `allow_on_submit` permits a bounded edit to submitted metadata documents.
-- The API cannot set this bit: DocumentKernel derives it from the registered
-- controller after permission and lifecycle validation.
ALTER TABLE mutation_guard
  ADD COLUMN allow_submitted_save INTEGER NOT NULL DEFAULT 0
  CHECK (allow_submitted_save IN (0,1));

DROP TRIGGER IF EXISTS mutation_guard_existing;
CREATE TRIGGER mutation_guard_existing
BEFORE INSERT ON mutation_guard
WHEN NEW.expected_version IS NOT NULL
BEGIN
  SELECT CASE
    WHEN (SELECT version FROM documents WHERE tenant_id=NEW.tenant_id AND doc_key=NEW.doc_key) IS NULL
      THEN RAISE(ABORT, 'DOCUMENT_NOT_FOUND')
    WHEN (SELECT version FROM documents WHERE tenant_id=NEW.tenant_id AND doc_key=NEW.doc_key) != NEW.expected_version
      THEN RAISE(ABORT, 'VERSION_CONFLICT')
    WHEN NEW.action='submit' AND (SELECT docstatus FROM documents WHERE tenant_id=NEW.tenant_id AND doc_key=NEW.doc_key) != 0
      THEN RAISE(ABORT, 'INVALID_LIFECYCLE_TRANSITION')
    WHEN NEW.action='save'
      AND (SELECT docstatus FROM documents WHERE tenant_id=NEW.tenant_id AND doc_key=NEW.doc_key) != 0
      AND NOT (
        NEW.allow_submitted_save=1
        AND (SELECT docstatus FROM documents WHERE tenant_id=NEW.tenant_id AND doc_key=NEW.doc_key)=1
      )
      THEN RAISE(ABORT, 'INVALID_LIFECYCLE_TRANSITION')
    WHEN NEW.action='cancel' AND (SELECT docstatus FROM documents WHERE tenant_id=NEW.tenant_id AND doc_key=NEW.doc_key) != 1
      THEN RAISE(ABORT, 'INVALID_LIFECYCLE_TRANSITION')
  END;
END;
