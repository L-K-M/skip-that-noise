# Skip that Noise

A Firefox extension that automatically skips songs by specific artists on YouTube Music.

<img src="img-src/screenshot.png" width="300">

> [!IMPORTANT]
> LLM Disclosure: This project was developed with the assistance of large language models (AI coding tools).

# Installation

To install the extension permanently, you need to package and sign it. The tooling is [`web-ext`](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/), Mozilla's official command-line tool, driven through `npm` scripts.

## 1. Install the tooling:

```bash
npm install
```

## 2. Setup your Mozilla Add-ons account:

Register on [addons.mozilla.org](https://addons.mozilla.org). Then generate API credentials from [addons.mozilla.org/en-US/developers/addon/api/key/](https://addons.mozilla.org/en-US/developers/addon/api/key/).

At this point, you should also open `manifest.json` and set the `browser_specific_settings.gecko.id` field to a unique identifier for your extension.

## 3. Build (and sign) the extension:

Build an unsigned `.zip`:

```bash
npm run build
```

To produce a signed `.xpi` for permanent installation, export your AMO credentials and run the signing script:

```bash
export WEB_EXT_API_KEY="your-jwt-issuer"
export WEB_EXT_API_SECRET="your-jwt-secret"
npm run sign
```

Both write to `web-ext-artifacts/`. The same signing happens automatically in CI when a `v*` tag is pushed and the `AMO_JWT_ISSUER` / `AMO_JWT_SECRET` repository secrets are configured — see [CICD.md](CICD.md).

## 4. Install the signed extension:

You can now go to Firefox's Extension Manager (`about:addons`), click on the gear icon, and select "Install Add-on From File..." to install the signed extension.

# Testing During Development

Run the extension in a temporary Firefox instance:

```bash
npm run start
```

# Linting

Check for common issues:

```bash
npm run lint
```
