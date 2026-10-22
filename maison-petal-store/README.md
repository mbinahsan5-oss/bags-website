# Maison Petal - girls bag store (PKR)

Static ecommerce site: HTML, CSS and JavaScript. No server needed.

## Run on GitHub Pages
1. Create a GitHub repository and upload everything in this folder.
2. Settings > Pages > Deploy from a branch > `main` / `(root)` > Save.
3. Your store opens at `https://YOUR-USERNAME.github.io/REPO-NAME/`. Admin: `/admin.html` (first password `admin123`).

## What you can manage in Admin
- Products: add, edit, hide, copy, reorder, delete, replace photos, sale price, stock, badges.
- Categories: names and tile images.
- Homepage and hero: headline, text, button, badge, hero images, announcement bar, scrolling banner, "why us" cards, reviews, FAQ.
- Coupons and delivery charges, WhatsApp number, contact and social links, currency symbol (default Rs).
- SEO: page title, description, keywords, website address, share image.

## Publish your changes to visitors
Admin edits are saved in your browser. Open Admin > Backup and publish, download `store.json`, replace `data/store.json` in the repository and commit.

## SEO checklist
1. Admin > Store, contact and SEO: fill title, description and your website address, save.
2. Backup and publish: download `sitemap.xml` and `robots.txt` and upload them to the repository root.
3. In `index.html` replace every `YOUR-USERNAME.github.io/REPO-NAME` with your real address (social previews read this file).
4. Add the site to Google Search Console and submit `sitemap.xml`.
5. Give every product a clear name, description and photo.

## Meta (Facebook and Instagram) ads
1. Admin > Meta Ads: paste your Pixel ID and save. Events sent: ViewContent, AddToCart, InitiateCheckout, Purchase (or Lead) and Contact, all with PKR values and product ids.
2. Admin > Backup and publish > Download publish pack. Unzip it into your repository root, replace files, commit. It contains `meta-catalog.csv`, your uploaded images, `data/store.json` and an SEO-ready `index.html`.
3. In Meta Commerce Manager: create a catalog > Data sources > Scheduled feed > paste `https://YOUR-SITE/meta-catalog.csv`, update daily.
4. In Ads Manager choose Sales, pick the catalog and Advantage+ catalog ads. Use the links from Admin > Meta Ads so orders show their ad source.
5. Test events in Meta Events Manager > Test events.

## Limits
GitHub Pages is static: the admin password is only a convenience lock, and orders are not stored on a server (customers send them to your WhatsApp). For live orders, payments and secure logins, add a backend such as Supabase or Firebase.
