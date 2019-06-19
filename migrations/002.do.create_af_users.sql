CREATE TABLE af_users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  teamname TEXT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT now(),
  date_modified TIMESTAMP
);

ALTER TABLE af_players
  ADD COLUMN
    user_id INTEGER REFERENCES af_users(id)
    ON DELETE SET NULL;