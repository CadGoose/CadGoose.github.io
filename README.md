# cadgoose.github.io

Personal site of **George Mkahail**, Cyber Security & Cloud Infrastructure Specialist (Toronto).

Live: https://cadgoose.github.io

- Plain static HTML/CSS/JS with no build step, so every page is fully readable by search engines and link previews.
- `/kql/` hosts the docs for [kql-detection-library](https://github.com/CadGoose/kql-detection-library), generated with `kqldl build-docs`.
- Includes Open Graph image, sitemap, JSON-LD and a keyboard-driven console (press <kbd>`</kbd>).

## Local preview

```bash
python3 -m http.server 8000
```

## Custom domain (later)

When a domain is bought: add a `CNAME` file containing the domain, point DNS at GitHub Pages
(`A` records 185.199.108.153 / .109 / .110 / .111, or a `CNAME` record to `cadgoose.github.io` for `www`),
then update the canonical / og URLs in `index.html` and `sitemap.xml`.
