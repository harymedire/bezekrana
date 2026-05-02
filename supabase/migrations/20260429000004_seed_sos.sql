-- ============================================================================
-- Seed: SOS quick ideas (Bosnian primary; admin can localize others later)
-- ============================================================================

INSERT INTO public.sos_tips (locale, title, body, icon, sort_order) VALUES
  ('bs', 'Lov na predmet u boji', 'Reci djetetu jednu boju i pošalji ga da pronađe 5 stvari te boje. 3-5 minuta tišine.', 'palette', 10),
  ('bs', 'Slanik kao instrument', 'Daj plastičnu bocu sa pirinčem unutra. Improvizirani bubanj/zvečka.', 'music', 20),
  ('bs', 'Slovo dana', 'Reci slovo i tražite zajedno stvari u prostoriji koje počinju tim slovom.', 'book-open', 30),
  ('bs', 'Tunel od stolica', 'Prebaciš deku preko 2 stolice. Beskonačna zabava.', 'tent', 40),
  ('bs', 'Sortiranje boja', 'Krupne LEGO kocke ili veliki šareni čepovi od plastičnih boca po bojama u činijice. Bezbjedno za uzrast 2–4 god.', 'shapes', 50),
  ('bs', '"Kuhanje" iz tegli', 'Daj prazne tegle, kašike i posudu vode. "Kuha" 30 minuta.', 'utensils', 60),
  ('bs', 'Crtanje kontura tijela', 'Lezi na papir, obriši konturu, dijete je oboji.', 'user', 70),
  ('bs', 'Skupljanje "blaga"', 'Daj kesu i šalji ga da skupi sve crveno (ili kockasto, mekano…).', 'gem', 80);

INSERT INTO public.sos_tips (locale, title, body, icon, sort_order) VALUES
  ('en', 'Color hunt', 'Pick a color, send them to find 5 things of that color. 3-5 minutes of quiet.', 'palette', 10),
  ('en', 'Bottle shaker', 'Plastic bottle with rice inside. Instant drum/rattle.', 'music', 20),
  ('en', 'Letter of the day', 'Pick a letter, find things in the room starting with it.', 'book-open', 30),
  ('en', 'Chair tunnel', 'Blanket over two chairs. Endless fun.', 'tent', 40),
  ('en', 'Sort the colors', 'Large LEGO bricks or big plastic bottle caps sorted by color into bowls. Safe for ages 2–4.', 'shapes', 50),
  ('en', 'Jar "cooking"', 'Empty jars, spoons, a bowl of water. "Cooks" for 30 minutes.', 'utensils', 60),
  ('en', 'Body outline drawing', 'Lie on paper, trace the outline, kid colors it in.', 'user', 70),
  ('en', 'Treasure hunt', 'Give a bag, send them to collect everything red (or square, soft…).', 'gem', 80);
