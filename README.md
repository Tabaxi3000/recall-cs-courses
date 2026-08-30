# Recall — Course & Certification Review

A static spaced-repetition site for CS 111 (New), CS 157, CS 251, CS 259Q, and CompTIA A+ Core 1. Progress is stored in browser `localStorage` and can be exported/imported as JSON.

**Live site:** https://tabaxi3000.github.io/recall-cs-courses/

The bank currently contains 719 cards in 65 unit/objective decks. The CompTIA A+ Core 1 bank contributes 266 cards across all 27 objectives in Domains 1–5. Use scheduled review for durable recall or Cram mode for an unscheduled pass through a full deck.

## Study tools

- Configurable 25/5 and 50/10 Pomodoro cycles with completed-session totals
- Guided 25-, 50-, and 90-minute study sprints tailored to each course and topic
- Written free-response quizzes with self-scoring and a direct review queue for missed prompts
- A persistent scratchpad for misconceptions, formulas, and next-step notes

Tool statistics and scratchpad text are stored with the review schedule and included in progress exports.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` from this directory.

## Data

Edit `cards.js` for the Stanford courses and `comptia-cards.js` for CompTIA A+ Core 1. Card IDs are stable hashes of course, unit, and prompt text. Reordering cards does not reset progress, but changing a prompt creates a new card ID.

Math is rendered to MathML with vendored Temml 0.13.4.
