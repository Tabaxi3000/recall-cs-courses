# Recall — CS Course Review

A static spaced-repetition site for CS 111 (New), CS 157, CS 251, and CS 259Q. Progress is stored in browser `localStorage` and can be exported/imported as JSON.

**Live site:** https://tabaxi3000.github.io/recall-cs-courses/

The bank currently contains 392 cards in 34 unit/topic decks. Use scheduled review for durable recall or Cram mode for an unscheduled pass through a full deck.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` from this directory.

## Data

Edit `cards.js`; card IDs are stable hashes of course, unit, and prompt text. Reordering cards does not reset progress, but changing a prompt creates a new card ID.

Math is rendered to MathML with vendored Temml 0.13.4.
