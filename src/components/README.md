# src/components — site-local components only

Components in this directory belong to THIS site. Keep them ≤ 80 lines,
token-driven (no hardcoded hex/radii/shadows), pure `.astro`.

Shared primitives (Button, Card, Callout, CtaBand, EmailLink, FaqList, Prose,
SectionHeading, TestimonialCard) come from **`@ampolic/ui`** (GitHub Packages —
install requires auth, see the ampolic-ui README):

```astro
---
import { Button, Card } from '@ampolic/ui';
---
```

Components generic enough for other client sites should be generalized and
upstreamed to ampolic-ui (with a changeset), then deleted here. What stays is
truly site-specific: Header/Footer/SEO/ContactForm (driven by config/site.ts),
Hero, blog components, ServiceAreaMap, ThemeToggle.
