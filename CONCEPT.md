# What this actually is

**A slot machine you fill yourself — and spin to get a brief.**

Not a gambling game. The reels are independent randomisers over *your* lists. You decide
what the categories are; the machine decides what you get from them.

> Load the reels with what you want to practise. Pull the lever. Take the constraint and
> go do the work.

If a feature only makes sense for a casino game — odds, betting, payout tables, chasing a
jackpot — it is off-brief.

## The idea, and how it widened

It started as UI practice: make one interface element a day, and use a slot machine to
decide *which* one, so you stop making the same safe choices.

Then the obvious generalisation landed: **there is nothing UI-specific about it.** The same
machine works for any domain where you want a constraint rather than a blank page.

| Deck | Reel 1 | Reel 2 | Reel 3 |
| --- | --- | --- | --- |
| UI | a typeface | a palette | a component |
| System design | a problem shape | a scale ("10M writes/s") | a constraint ("no managed services") |
| Backend | a service | a failure mode | a budget |
| Maths | a topic | a difficulty | a proof style |
| Writing | a form | a voice | a subject |

So the product is **a deck machine**: a set of named reels, each holding your own items,
and a lever. UI design is just the first deck that ships with it.

This is the intent, and it should drive every decision below it.

## Why a slot machine rather than a "generate" button

- **Randomness removes choice paralysis.** You do not pick; you respond.
- **Constraints force range.** You land on combinations you would never choose, which is
  the entire point of deliberate practice.
- **It is a ritual.** Having to pull something is different from clicking a button. The
  pull is the moment of commitment, and it should feel physical.
- **The machine is the aesthetic.** A slot machine drawn as isometric technical line art
  is worth looking at — see `ART.md`.

## What the user owns

- **Decks.** Named sets of reels. Ship a few; the user adds their own.
- **Reels.** Each reel is a category with a list of items. A reel can be loaded, edited,
  reordered or emptied independently.
- **Items.** One item is one outcome: a word, a phrase, a short line of text.

The machine owns only the draw, the motion, and the presentation of the result.

## What a spin produces

One item from each reel, presented as a single readable brief — the thing you screenshot
and take to your work. So the result needs to be:

- **Copyable.** A "copy brief" action is the payoff.
- **Legible in the machine.** In the readout, not a floating overlay competing with the
  geometry.
- **Storable.** A short history of what you have already been given, so you can see your
  range over a month and avoid re-spinning until you like the answer.

Open questions not yet decided:

- Should a reel be allowed to be "locked" so you can hold one axis and re-roll the others?
- How many reels should a deck support — fixed at three, or any number?
- Does a deck carry its own result text (a brief), or is the brief just the items joined?
- Should items support weight, so a favourite comes up more often?

## What "winning" means

There is no win state and no payout. The natural replacements, in increasing scope:

1. **A brief you can read and copy.** The minimum: the draw, legible, with the deck it came
   from.
2. **A deliberately awkward draw.** A rare callout for the combination that is hardest to
   work with, rather than a reward — the point of practice is the uncomfortable one.
3. **A record.** Even a plain count of briefs taken makes the practice feel like it is
   accumulating.

## Design consequences worth remembering

- **Reels must render arbitrary text, not a fixed symbol set.** The hand-drawn symbols are
  a good default for the shipped decks, but a user item is a string and has to be drawn as
  one. Every item should still get a deterministic line-art mark so the machine keeps its
  look — which is exactly what `RuneIcons` does: one glyph, several treatments.
- **Everything lives in localStorage.** No account, no backend, no server. A practice tool
  should work offline and never ask you to sign up.
- **The lever is the only required control.** A keyboard fallback and a spin button exist,
  but the lever is the product.
- **Nothing should block the first spin.** A new visitor should be able to pull the lever
  within seconds on the shipped deck, before ever opening an editor.

## Current state (honest)

Built: the 3D machine, the lever, spinning reels, an in-machine readout, orbit controls, an
entrance animation, a landing page.

**Not yet true to this document:** the reels carry hard-coded slot symbols (cherry, seven,
bar) and the outcome uses a fixed win/lose rule. There is no deck model, no way to add
items, and no persistence. That is the next real piece of work, and everything about the
"game loop" follows from it rather than the other way round.
