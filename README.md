# milkstudio-sa.github.io

The link page behind the QR code on the milkstudio tag.

## Change a link

1. Open `links.js` on GitHub and click the pencil icon.
2. Edit, add or remove lines in the `links` list. Change `whatsapp` to update the number everywhere, including the order form.
3. Click **Commit changes**. The site updates in about a minute.

The QR code points to `https://milkstudio-sa.github.io/`. That address never changes, so printed tags keep working whatever you edit here.

## Pages

- `/` is the link page and baking instructions
- Light/dark mode: the cookie button at the top. Images are in `img/`.
- `/sample/` is the free sample request for cafés
- `/order/` is the wholesale order form (prices and flavours are in the `CONFIG` block near the bottom of `order/index.html`)

## Saving form answers

Both forms save answers to a Google Sheet as people type (one row per visit, with a status column). The sheet link goes in `sheetUrl` in `links.js`.
