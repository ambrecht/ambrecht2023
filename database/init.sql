psql -h your_host -U your_user -d postgres

-- Datenbank anlegen:
CREATE DATABASE myapp;

-- Zur neu angelegten Datenbank wechseln:
\c myapp

-- Tabelle "sessions" anlegen, die den gesamten Text, das Erfassungsdatum und die Zählerstände enthält:
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  letter_count INTEGER NOT NULL,
  word_count INTEGER NOT NULL
);

-- Funktion, die bei INSERT oder UPDATE die aktuelle Session als JSON an einen dynamischen Kanal sendet:
CREATE OR REPLACE FUNCTION notify_session_update() RETURNS trigger AS $$
DECLARE
  channel_name TEXT;
BEGIN
  channel_name := 'session_update_channel_' || NEW.id;
  PERFORM pg_notify(channel_name, row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger, der nach jedem INSERT oder UPDATE in der Tabelle "sessions" die Benachrichtigung auslöst:
DROP TRIGGER IF EXISTS session_notify_trigger ON sessions;
CREATE TRIGGER session_notify_trigger
AFTER INSERT OR UPDATE ON sessions
FOR EACH ROW EXECUTE PROCEDURE notify_session_update();

-- Funktion, die das Löschen von Sessions verhindert, sofern diese jünger als 24 Stunden sind:
CREATE OR REPLACE FUNCTION prevent_young_deletion() RETURNS trigger AS $$
BEGIN
  IF (OLD.created_at > NOW() - INTERVAL '24 hours') THEN
    RAISE EXCEPTION 'Sessions, die jünger als 24 Stunden sind, dürfen nicht gelöscht werden.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger, der vor dem Löschen einer Session diese Altersüberprüfung vornimmt:
CREATE TRIGGER prevent_delete_trigger
BEFORE DELETE ON sessions
FOR EACH ROW EXECUTE PROCEDURE prevent_young_deletion();