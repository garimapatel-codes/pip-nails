# pip._.nails

A catalogue site for a handmade press-on nail artist.

Two pages, no build step, no framework. Open `index.html` and it runs.

- `index.html` — landing page with the rotating set carousel
- `catalogue.html` — every set, with filters and saved picks
- `carousel.js` / `catalogue.js` — behaviour for each page
- `styles.css` / `catalogue.css` — styles for each page
- `images/` — set photos

## Running it locally

Use a server rather than opening the file directly — the clipboard
API needs a real origin and falls back unnecessarily on `file://`.

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Editing the sets

All set data lives in the `DESIGNS` array at the top of `catalogue.js`:
name, price, shape, length, description and image path. Add a photo to
`images/`, add an entry to the array, and it appears in the grid with
filters and saving already working.

The three sets shown on the landing page carousel are in the `SETS`
array at the top of `carousel.js`.

Prices are in the `CURRENCY` constant plus the per-set `price` values.

## Saved picks

Picks are kept in the browser's `localStorage`. No account, no server,
and nothing leaves the visitor's device. The enquiry button copies the
list as text and opens Instagram DMs.
