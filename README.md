# Complexity Analyzer

A LeetCode-style code complexity analyzer with side-by-side comparison.

## How to run

1. Open `index.html` directly in your browser — no server needed.
2. Paste your code in the editor.
3. Click **Analyze** to get time & space complexity results.
4. Click **Add approach** to add a second or third version and compare.

## Features

- Dark theme editor with line numbers and tab support
- Claude AI analysis: time, space, best/worst/average case
- LeetCode-style runtime distribution chart (beats X% of submissions)
- Head-to-head comparison with complexity score chart
- Memory usage percentile bar chart
- Up to 3 approaches at once

## Project structure

```
complexity-analyzer/
├── index.html        ← Open this in your browser
├── css/
│   └── style.css     ← All styles
├── js/
│   └── app.js        ← All logic
└── README.md
```

## Note

Requires an internet connection for:
- Claude AI API (analysis)
- Chart.js (loaded from CDN)
