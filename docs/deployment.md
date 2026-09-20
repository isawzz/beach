---
title: Deployment
status: in_progress
last_updated: 2026-09-19
---

# Deployment

- Static frontend (`common/`, `koala/`) + PHP backend (`common/api.php`).
- No required environment variables; no build step.
- `api.php` picks DB credentials by host; localhost defaults to `gamedb`/`root`/empty password.
