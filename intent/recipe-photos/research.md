# Recipe photo selection — observed source evidence

Date: 2026-11-23. Author: orchestrator. This is read-only intake research,
not approval of a new application network boundary.

## Current application results

Read the user's existing gnocchi results through the in-app browser without
resubmitting the query or changing the page. The Love and Lemons card loaded a
150×150 image; Inspired Taste and King Arthur rendered the fallback with no
image element. This isolates missing selection from a browser image error.

## Original publisher metadata

Fetched the three public HTML documents with a bounded read-only research
script, then parsed JSON-LD, Open Graph tags, and relevant image attributes.
No paid LLM call or image binary download was needed.

| Source | Observed metadata | Improvement opportunity |
| --- | --- | --- |
| [Love and Lemons](https://www.loveandlemons.com/gnocchi-recipe/) | Recipe.image array supplies 500×500, 500×375, 480×270 and original gnocchi.jpg URLs; Open Graph declares a 1740×911 image. HTML 618,767 bytes. | Prefer a larger source-supplied recipe image over the current 150×150 thumbnail. |
| [Inspired Taste](https://www.inspiredtaste.net/61427/potato-gnocchi/) | No Recipe node found by the research parser; og:image supplies Gnocchi-Recipe-1.jpg with 1250×833 dimensions. HTML 411,584 bytes. | Use page-level social metadata when structured recipe-image data is absent. |
| [King Arthur Baking](https://www.kingarthurbaking.com/recipes/potato-gnocchi-recipe) | Recipe.image is an ImageObject with a url; the same image is declared by og:image. Hero markup declares 1248×832. HTML 340,485 bytes. | Support ImageObject values, rather than relying on model-retrieved image text. |

Exact source-provided image examples:

- Love and Lemons: https://cdn.loveandlemons.com/wp-content/uploads/2025/02/gnocchi-500x500.jpg
- Inspired Taste: https://www.inspiredtaste.net/wp-content/uploads/2026/08/Gnocchi-Recipe-1.jpg
- King Arthur: https://www.kingarthurbaking.com/sites/default/files/2025-02/Potato-Gnocchi_2025_Lifestyle_ALT_H_045.jpg

The URLs above were read from the publishers' metadata, not constructed by
rewriting thumbnail filenames. Source pages can change; deterministic tests
should use small synthetic metadata fixtures, with separately labeled live QA.

## Design implications to evaluate

Prefer deterministic source-specific Recipe.image extraction, including array
and ImageObject forms, then page-level og:image and an appropriate final
fallback. Favor suitable larger variants explicitly supplied by the publisher.
Do not scan arbitrary page images indiscriminately: related recipes, author
avatars, logos and advertisements are not interchangeable with a recipe photo.

The current application deliberately does not fetch arbitrary recipe URLs.
Introducing HTML retrieval needs an approved SSRF-safe, bounded, cancellable
design and independent security review. Image binaries should continue loading
directly in the browser; this task does not require a server image proxy.

## Primary references

- [Schema.org Recipe](https://schema.org/Recipe) and [image](https://schema.org/image)
  define source-associated image metadata, including URL/ImageObject forms.
- [Open Graph protocol](https://ogp.me/) defines og:image and optional dimensions.
- The three publisher pages above provide the observed examples.
