# Ahmed & Yasmeen — Engagement Invitation

Static site: `index.html`, `style.css`, `script.js`. No build step, no backend.

## Deploy to GitHub Pages
1. Create a new **public** GitHub repository and upload `index.html`, `style.css`, `script.js`, this README and the whole `assets` folder (it holds all the images).
2. Repo **Settings → Pages → Build and deployment → Deploy from a branch**, pick `main` and `/ (root)`, then Save.
3. After a minute or two the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Settings (top of `script.js`, the `CONFIG` object)
| Key | What it does |
| --- | --- |
| `formspreeId` | Optional. Your Formspree form ID — RSVPs and wishes are emailed to you. |
| `music` | Optional. File name of a song uploaded next to `index.html` (e.g. `music.mp3`). |
| `venue`, `address`, `eventStart`, `eventEnd` | Event details used by the map, countdown and calendar. |

Without `formspreeId`, RSVPs and wishes are saved only in each guest's own browser.
