# Recipe search notebook — intent

- Status: Accepted by Rafael in this chat on 2026-11-23.
- Source: “Let's implement Everyday grid with Search notebook's history, with
  the pills filtering the selected search's results. Make sure it works well
  on desktop and mobile.” This authorizes local implementation and verification.

Make recipe search easy to browse on desktop and mobile by combining the
Everyday grid concept with expandable search-history groups. Keep previous
successful searches available while searching again; filter each group's
results locally without another provider request. Retain the warm stone and
green visual direction, clear source links and optional photo fallback.

History is in memory for this tab/page, not saved across reloads. Ingredient
pills use supported recipe-title evidence; short-time filtering requires an
unambiguous reported total time. No database, provider changes, new dependencies,
production deployment, or merge is requested. The existing human merge and
release gates remain closed.
