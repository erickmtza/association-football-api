BEGIN;

TRUNCATE
  af_players,
  af_users
  RESTART IDENTITY CASCADE;

INSERT INTO af_users (username, teamname, password)
VALUES
  ('dunder', 'Juventus', '$2a$12$BuSmUkHKEU5NkB2TC.LmredEqX9Ny4LNuHcMOi4w1AgZO37P9aJsO'),
  ('bang', 'Barcelona', '$2a$12$hcBp1IhlYw8ztKVGK5WrOe8Gi6KIBLR.wBprzR.XCzaU6LXaY2Xbe');

INSERT INTO af_players (name, img, user_id, pos, att, def, spd)
VALUES
  ('Cristiano R.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGVIKhEXqujrRqWW7CvPMgudWRF2D4YM8PTpHAMtg2uRbPP_PYJg', 1, 'CF', 92, 71, 89),
  ('Leonel Messi', 'http://www.gstatic.com/tv/thumb/persons/983712/983712_v9_ba.jpg', 1, 'CF', 92, 71, 89),
  ('Coutinho', 'https://cdn.images.express.co.uk/img/dynamic/67/750x445/1140956.jpg', 1, 'CM', 92, 71, 89),
  ('Buffon', 'https://cdn.calciomercato.com/images/2019-03/buffon.psg.2018.19.braccia.460x340.jpg', 2, 'GK', 92, 71, 89),
  ('Jordi Alba', 'https://stmed.net/sites/default/files/jordi-alba-wallpapers-31134-946387.jpg', 1, 'LB, RB', 92, 71, 89);


COMMIT;
