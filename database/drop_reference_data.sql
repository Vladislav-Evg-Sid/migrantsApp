BEGIN;

DELETE FROM ppts;
DELETE FROM schools;
DELETE FROM area_responsibles;
DELETE FROM participant_statuses;
DELETE FROM test_attempts;
DELETE FROM nations;
DELETE FROM test_dates;
DELETE FROM areas;

ALTER TABLE participant_statuses ALTER COLUMN id RESTART WITH 1;
ALTER TABLE nations ALTER COLUMN id RESTART WITH 1;
ALTER TABLE test_dates ALTER COLUMN id RESTART WITH 1;
ALTER TABLE area_responsibles ALTER COLUMN id RESTART WITH 1;

COMMIT;
