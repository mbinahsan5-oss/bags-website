# Maison Petal - girls bag store (PKR)

Static ecommerce site: HTML, CSS and JavaScript, with a small secure publishing Worker.

## How publishing works
The store stays in GitHub Pages. An owner sets up a small Cloudflare Worker once; it safely publishes saved changes to the connected GitHub repository. The GitHub access token stays in Cloudflare and is never sent to the browser.

After setup, the client signs in at `/admin.html`, edits the store and presses **Save**. Products, photos, store settings, SEO files and the Meta catalog are committed automatically. GitHub Pages then deploys the update. The client does not need a GitHub account or need to upload files.

### One-time setup for the site owner
These are technical setup steps for the repository owner, not the store client:
1. Create a GitHub fine-grained access token limited to this repository with **Contents: Read and write** permission. Do not put the token in the repository or give it to the client.
2. Install Wrangler (`npm install -g wrangler`) and sign in (`wrangler login`). From the `worker` folder, update `wrangler.toml` with the GitHub owner, repository name, branch, and exact website origin (scheme and hostname only; no trailing slash). If rate-limit namespace `1001` is already in use in your Cloudflare account, change it to another unique numeric ID.
3. Set three Cloudflare secrets from the `worker` folder: `npx wrangler secret put GITHUB_TOKEN`, `npx wrangler secret put ADMIN_PASSWORD`, and `npx wrangler secret put SESSION_SECRET`. Use a unique admin password of at least 16 characters and a random session secret of at least 32 characters. Share only the admin password with the client through a private channel.
4. Deploy the worker with `npx wrangler deploy`. Copy its `https://...workers.dev` address into `window.PETAL_PUBLISHER_URL` in `js/publisher-config.js`.
5. Commit and push the one-time worker configuration, publisher URL and site changes. On GitHub, enable Pages for the branch used in `worker/wrangler.toml`. Test signing in and saving a test product before handing the admin link to the client.

GitHub Pages and the Worker must use the same repository and branch. `ALLOWED_ORIGIN` must exactly match the live site's origin, for example `https://username.github.io` or `https://shop.example.com`.

### Client's everyday steps
1. Open `https://YOUR-USERNAME.github.io/REPO-NAME/admin.html` and sign in with the password supplied by the owner.
2. Add or edit products, choose photos, then press **Save product**. For store settings, press **Save changes**.
3. Wait for the green **Published successfully** message. The store updates on GitHub Pages shortly afterward. If an error appears, press **Try publishing again** or contact the site owner.

The browser keeps a local working copy for the admin. Use the same browser/device when possible; the optional backup download is useful when changing devices.

## What you can manage in Admin
- Products: add, edit, hide, copy, reorder, delete, replace photos, sale price, stock, badges.
- Categories: names and tile images.
- Homepage and hero: headline, text, button, badge, hero images, announcement bar, scrolling banner, "why us" cards, reviews, FAQ.
- Coupons and delivery charges, WhatsApp number, contact and social links, currency symbol (default Rs).
- SEO: page title, description, keywords, website address, share image.

## SEO checklist
1. Admin > Store, contact and SEO: fill title, description and your website address, then save. The updated metadata, sitemap, robots.txt and catalog feed publish automatically.
2. Confirm your GitHub Pages URL is correct in `worker/wrangler.toml` and `js/publisher-config.js`.
3. Add the site to Google Search Console and submit `sitemap.xml`.
4. Give every product a clear name, description and photo.

## Meta (Facebook and Instagram) ads
1. Admin > Meta Ads: paste your Pixel ID and save. Events sent: ViewContent, AddToCart, InitiateCheckout, Purchase (or Lead) and Contact, all with PKR values and product ids.
2. Save changes in Admin. The catalog feed, product photos, `data/store.json` and SEO-ready `index.html` publish automatically. The optional backup pack can also be uploaded manually by the repository owner.
3. In Meta Commerce Manager: create a catalog > Data sources > Scheduled feed > paste `https://YOUR-SITE/meta-catalog.csv`, update daily.
4. In Ads Manager choose Sales, pick the catalog and Advantage+ catalog ads. Use the links from Admin > Meta Ads so orders show their ad source.
5. Test events in Meta Events Manager > Test events.

## Limits and security
- The Cloudflare Worker is required for admin login and automatic publishing. If it is not deployed or configured, Admin cannot sign in or publish.
- The worker commits the store data and generated website assets to the configured branch. Keep the GitHub token in Cloudflare secrets, grant access only to this repository, and rotate/revoke it if exposed.
- The admin password is protected by the worker and is not stored in the public website. The signed admin session expires after eight hours.
- Customer orders are still sent to WhatsApp; this setup does not add server-side order storage, payment processing or inventory reservations.
