CREATE TABLE af_players (
  id SERIAL PRIMARY KEY,
  img TEXT,
  name TEXT NOT NULL,
  pos TEXT NOT NULL,
  att INTEGER NOT NULL,
  def INTEGER NOT NULL,
  spd INTEGER NOT NULL
);