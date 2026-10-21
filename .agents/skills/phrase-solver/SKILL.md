---
name: phrase-solver
description: Solves Wheel of Fortune style word puzzles (Phrase Solver) from a pattern of known letters and blanks, plus letters known not to be in it. Use when the user gives a partly filled-in phrase, a hangman pattern or a Wheel of Fortune board and asks what it could be.
metadata:
  title: Phrase Solver
  url: http://127.0.0.1:3002
---

# Phrase Solver

Ranks fill-ins for each word by how common the word is in English text (an nltk word-frequency table), then joins the best into phrases. No auth.

`curl -sG http://127.0.0.1:3002/solve --data-urlencode 'puzzle=wh__l _f f_rt_n_' --data-urlencode 'exclude=s'` → `{"solutions":["wheel of fortune","wheel of farting",…]}`, up to 30, or `{"error":"…"}` (400).

- `puzzle`: letters where known, `_` for each blank, a space between words. Any character that isn't a letter counts as a blank, so strip punctuation (`don't` → `dont`). At most 24 words of 24 letters.
- `exclude`: letters known not to be in the puzzle (`exclude=rstle`).
- A blank never fills with a letter already shown in the puzzle or in `exclude`, as on the show.
- A word with no match comes back as `?`.
- Each word is ranked on its own, so the list isn't sorted by how much sense the phrase makes: "wheel of farting" is second above.
