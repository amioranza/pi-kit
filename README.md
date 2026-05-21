# Pi Sandbox Kit

This kit runs the Pi coding agent inside a Docker Sandbox with support for host Ollama, OpenRouter, and common development ecosystems.

## Requirements

Install Docker's `sbx` CLI before using this kit. See the Docker Sandboxes get started guide for platform requirements and install instructions:

https://docs.docker.com/ai/sandboxes/get-started/

## Start Pi

Default startup uses the kit defaults from `spec.yaml`:

```bash
sbx run --kit ./pi-kit/ pi
```

You can also start directly from GitHub without a local checkout:

```bash
sbx run --kit "git+https://github.com/amioranza/pi-kit.git#dir=." pi -- --provider ollama --model qwen3.6:27b-coding-mxfp8
```

Current default model:

```text
provider: ollama
model: qwen3:8b
```

## Override the startup model

Pass Pi arguments after `--`:

```bash
sbx run --kit ./pi-kit/ pi -- --provider openrouter --model qwen/qwen3.6-35b-a3b
```

Another Ollama example:

```bash
sbx run --kit ./pi-kit/ pi -- --provider ollama --model llama3.1:8b
```

Optional thinking level:

```bash
sbx run --kit ./pi-kit/ pi -- --provider openrouter --model anthropic/claude-sonnet-4 --thinking medium
```

## Ollama on the host

Inside the sandbox, the host machine is reached through:

```text
host.docker.internal
```

The kit configures Ollama as:

```text
http://host.docker.internal:11434/v1
```

Make sure Ollama is reachable from Docker. If needed, start Ollama on the host with:

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

At sandbox startup, the kit queries:

```text
http://host.docker.internal:11434/api/tags
```

and writes discovered models to:

```text
/home/agent/.pi/agent/models.json
```

If discovery fails, the kit falls back to:

```text
llama3.1:8b
qwen2.5-coder:7b
```

## OpenRouter

OpenRouter is configured in generated `models.json` using:

```text
https://openrouter.ai/api/v1
```

The sandbox credential proxy expects the host to provide:

```text
OPENROUTER_API_KEY
```

Example:

```bash
sbx run --kit ./pi-kit/ pi -- --provider openrouter --model qwen/qwen3.6-35b-a3b
```

## Domain allowlist profiles

`spec.yaml` contains a generated `network.allowedDomains` block. Do not hand-edit that block directly unless you intend to discard the profile workflow.

Profiles live in:

```text
pi-kit/domain-profiles/
```

Current profiles:

- `base.txt` — Pi, GitHub, GitLab, Bitbucket, common GitHub release assets
- `node.txt` — npm, Node.js, pnpm, yarn, Deno, JSR
- `rust.txt` — crates.io, Cargo index, rustup/toolchains
- `go.txt` — Go proxy, checksum DB, Go downloads
- `python.txt` — Python.org, PyPI, pip bootstrap, Python package files
- `tauri.txt` — common Linux/Tauri dependency sources
- `ai.txt` — AI APIs and host Ollama

Regenerate the allowlist with all default profiles:

```bash
node pi-kit/scripts/render-allowed-domains.js
```

Or generate from selected profiles:

```bash
node pi-kit/scripts/render-allowed-domains.js base node rust python ai
```

The generator rewrites only the `allowedDomains` block in `spec.yaml`.

## Important sbx argument behavior

Use `--` to pass arguments to Pi:

```bash
sbx run --kit ./pi-kit/ pi -- --provider ollama --model qwen3:8b
```

Host environment variables like this are not reliably forwarded into the sandbox:

```bash
PI_DEFAULT_PROVIDER=ollama sbx run --kit ./pi-kit/ pi
```

That is why this kit uses an entrypoint wrapper script and Pi CLI args for per-run overrides.

## Files generated inside the sandbox

The kit creates or updates:

```text
/home/agent/.pi/agent/pi-entrypoint
/home/agent/.pi/agent/settings.json
/home/agent/.pi/agent/models.json
```

`models.json` is regenerated on sandbox startup so it can reflect host Ollama models.
