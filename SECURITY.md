# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.4.x   | ✅ Current          |
| 2.3.x   | ✅ Security fixes   |
| 2.2.x   | ⚠️ Critical only    |
| < 2.2   | ❌ End of life      |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to **security@launchterminal.dev**.

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of vulnerability (e.g., SQL injection, XSS, SSRF, RCE)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Disclosure Policy

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide an estimated timeline for a fix within 5 business days
- We will notify you when the vulnerability is fixed
- We will publicly disclose the vulnerability after a fix is available

## Security Best Practices for Self-Hosting

1. **Environment Variables**: Never commit `.env` files. Use secrets management (Vault, AWS Secrets Manager, etc.)
2. **Network Security**: Run behind a reverse proxy (nginx, Caddy) with TLS termination
3. **Database**: Use strong passwords, enable SSL, restrict network access
4. **Updates**: Keep LaunchTerminal and all dependencies up to date
5. **Monitoring**: Enable audit logging and monitor for suspicious activity
6. **Docker**: Run containers as non-root (our Dockerfile does this by default)

## Encryption

LaunchTerminal encrypts sensitive data at rest using AES-256-GCM. API keys, tokens, and user data are encrypted before storage. The encryption key is derived from the `ENCRYPTION_KEY` environment variable.

## Bug Bounty

We currently do not have a formal bug bounty program. However, we deeply appreciate security researchers who responsibly disclose vulnerabilities and will acknowledge contributions in our release notes.
