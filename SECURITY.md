# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| `main` (latest) | ✅ |

This is a static course site (HTML/CSS/vanilla JS, no backend, no
dependencies, no build step). The attack surface is correspondingly small.

## Reporting a Vulnerability

Please **do not open a public issue**. Use
[private vulnerability reporting](../../security/advisories/new) on this
repo, or email the maintainer. Include:

- What you found and where (file + line if possible)
- Steps to reproduce
- What you think the impact is

You can expect an acknowledgment within 7 days. If the report is
accepted, a fix will land on `main` and be credited in the commit
message unless you prefer otherwise.

## Scope Notes

- There is no server side: no secrets, sessions, or user data exist here.
- Third-party code is limited to zero runtime dependencies; the only
  external references are outbound documentation links.
- GitHub secret scanning and push protection are enabled on this repo
  as a backstop.
