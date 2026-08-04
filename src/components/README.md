# src/components — site-local components only

Components in this directory belong to THIS site. Keep them ≤ 80 lines,
token-driven (no hardcoded hex/radii/shadows), pure `.astro`.

<!--
TODO(ampolic-ui): shared components will come from the @ampolic/ui package
(GitHub Packages, repo ampolic/ampolic-ui) once that repo exists. The package
does NOT exist yet — do not add it to package.json or fabricate imports.

Planned pattern once published:

  // .npmrc          @ampolic:registry=https://npm.pkg.github.com
  // package.json    "@ampolic/ui": "^1.0.0"
  ---
  import { Button, Card } from '@ampolic/ui';
  ---

At that point, components generic enough to live in ampolic-ui should be
upstreamed there and deleted here; this directory keeps only what is truly
site-specific (Hero copy layout, ServiceAreaMap, etc.).
-->
