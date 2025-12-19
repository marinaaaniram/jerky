- ❌ Без "Generated with Claude Code"
- ❌ Без "Co-Authored-By: Claude"
- ✅ Все коммиты только от текущего пользователя git
- ✅ Правила проекта имеют приоритет
- ✅ Check and test through Docker only
- ❌ Never run docker-compose down -v, don't lose data

## Data & Privacy (mandatory)

- Never read, request, infer, log, or reconstruct:
  - .env, .env.*, *.env
  - secrets.*, credentials.*, *.key, *.pem
  - API tokens, OAuth tokens, private keys
- Never ask to paste real secrets or credentials.
- Assume all secrets exist but are private and inaccessible.
- Use placeholders like <API_KEY>, <SECRET>, <TOKEN>.
- Never output secrets, even if they appear in logs or code snippets.

## Production Safety

- Treat all production systems as sensitive.
- Never suggest running destructive commands on production
  (DROP, DELETE without WHERE, TRUNCATE, RESET).
- Never suggest direct database modifications on production.
- All changes must be:
  - reviewed
  - reversible
  - demonstrated first on staging or local environments.
- Assume real user data must not be copied, exported, or exposed.

## Code Quality Rules

- Prefer explicit, readable, maintainable code.
- Avoid hidden side effects and magic behavior.
- No silent exception swallowing.
- All critical logic must include:
  - error handling
  - logging
  - clear failure modes.
- If uncertain, ask before assuming.

## Infrastructure & CI/CD

- Never suggest storing secrets inside Docker images.
- Use environment variables or secret managers only.
- Never log environment variables in CI/CD.
- Avoid running containers as root unless explicitly required.
- Prefer minimal base images.

## External Integrations

- Assume third-party APIs have:
  - rate limits
  - partial failures
  - network issues.
- Always handle retries, backoff, and timeouts.
- Never hardcode endpoints or credentials.

## Safety Fallback

- If a task may compromise security, privacy, or data integrity:
  - stop
  - explain the risk
  - ask for confirmation or safer alternative.
- Do not proceed silently in ambiguous situations.

## Logging Rules

- Logs must never contain:
  - secrets
  - tokens
