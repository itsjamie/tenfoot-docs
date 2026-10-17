# tenfoot-docs

The documentation site for [Tenfoot](https://www.npmjs.com/package/tenfoot), a GPU UI renderer for
set-top boxes and smart TVs. It is published at https://itsjamie.github.io/tenfoot-docs/.

The library is not in this repository. The site installs `tenfoot` from npm like any application,
and the tutorial's live demos run the published package.

```sh
pnpm install
pnpm run dev      # http://localhost:4321/tenfoot-docs/
pnpm run check    # type-check the tutorial listings against the package's declarations
pnpm run build    # dist/, static
```

`.github/workflows/pages.yml` builds and deploys on every push to `main`.

## Layout

- `src/content/docs/` holds the pages.
- `steps/` holds the tutorial and widget listings. Each page imports its listing twice: once to run it
  in the monitor, and once as raw text to show it, so the code on the page is the code running.
- `starter/` holds the two files the setup step shows.
- `public/arena/` is a built copy of ARENA+, the reference app. The widget pages also load its fonts.

## Writing ahead of a release

To run the site against a local checkout of the library instead of the published package:

```sh
TENFOOT_SRC=/path/to/tenfoot pnpm run dev
```

## Refreshing ARENA+

`public/arena/` is build output, not source. From a checkout of the library:

```sh
pnpm run build
rm -rf /path/to/tenfoot-docs/public/arena
cp -r dist/arena /path/to/tenfoot-docs/public/arena
```

The photographs in it are from Wikimedia Commons, and each one's author and licence are in
`public/arena/feed.json`.

Copyright (c) 2026 Jamie Stackhouse. All rights reserved.
