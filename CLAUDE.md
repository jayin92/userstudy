# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Locally

This is a pure static web application with no build step. Serve it with any static file server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

All dependencies are pre-bundled in `vendor/` — no `npm install` or package manager needed.

## Architecture

### Core Files
- `index.html` — Page shell + all embedded configuration (see below)
- `index.js` — All application logic: state management, rendering, navigation, form submission
- `style.css` — UI styling
- `data/` — Study media files (images + videos), organized by set number

### Application Flow

```
Page 0 (username) → Pages 1–8 (study sets) → Google Forms submission
```

State is tracked by a global `now` integer (0 = username page, 1–8 = study sets). All user responses are stored in the `data_list[]` array. On the final page's "Next", responses are encoded as URL query parameters and `window.location.replace()` redirects to Google Forms.

### Key Functions in `index.js`

| Function | Purpose |
|---|---|
| `renderObjects(now)` | Renders either the username input (page 0) or a study set page |
| `renderQuestions()` | Generates radio button survey HTML for the current set |
| `generateElements()` | Creates `<video>` or `<img>` HTML for media display |
| `changePage(now)` | Validates the current page before advancing; returns false if incomplete |
| `resetRadioStatus(now)` | Restores the user's previously selected radio buttons when navigating back |

Videos are Fisher-Yates shuffled on load so variant order is randomized per session.

### Data Sets

- **Sets 1–4** (`data/1/` through `data/4/`): one reference image (`input.jpg`), 4 video variants (citydreamer, gaussiancity, corgs, ours_stage2), plus ground truth
- **Sets 5–8** (`data/5/` through `data/8/`): two reference images (`input1.jpg`, `input2.jpg`), 4 different video variants (corgs, eogs, sat-nerf, ours_stage2), plus ground truth

`num_of_selection` is computed dynamically per set (length of the variants array).

### Configuration (all in `index.html`)

All study configuration is embedded as JavaScript variables in `index.html`:

- `form_url` — Google Forms endpoint
- `username_entry` — Google Forms field ID for username
- `entry_list` — 2D array of Google Forms entry IDs: `entry_list[set_index][question_index]` (8 sets × 3 questions)
- `questions_title` / `questions` — Survey question labels and text
- `data_list` — Array of set metadata objects; index 0 holds username, indices 1–8 hold study set data

To add a new study set: add an entry to `data_list`, add a corresponding row to `entry_list`, and add media files to `data/`.

## Branches

- `main` — Primary branch
- `nyc` — NYC dataset variant (re-encoded videos with `_reencoded` suffix)
