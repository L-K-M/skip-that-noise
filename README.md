# Skip that Noise

A Firefox extension that automatically skips songs by specific artists on YouTube Music.

<img src="img-src/screenshot.png" width="300">

> [!IMPORTANT]
> LLM Disclosure: This project was developed with the assistance of large language models (AI coding tools).

# Installation

To install the extension permanently, you need to package and sign it. `web-ext` is Mozilla's official command-line tool for building and signing extensions.

## 1. Install web-ext:

```bash
npm install --global web-ext
```

## 2. Setup your Mozilla Add-ons account:

Register on [addons.mozilla.org](https://addons.mozilla.org). Then generate API credentials from [addons.mozilla.org/en-US/developers/addon/api/key/](https://addons.mozilla.org/en-US/developers/addon/api/key/).

At this point, you should also open `manifest.json` and set the `applications.gecko.id` field to a unique identifier for your extension.

## 3. Build the extension:

Store your AMO credentials in `../web-ext-credentials.env`:

```bash
WEB_EXT_API_KEY="your-api-key"
WEB_EXT_API_SECRET="your-api-secret"
```

Then run:

```bash
chmod +x build.sh
./build.sh
```

This creates build artifacts in `web-ext-artifacts/`, including a signed `.xpi` if signing succeeds. Running `./build.sh` without `../web-ext-credentials.env` creates only the unsigned build artifact.

## 4. Install the signed extension:

You can now go to Firefox's Extension Manager (`about:addons`), click on the gear icon, and select "Install Add-on From File..." to install the signed extension.

# Testing During Development

Run the extension in a temporary Firefox instance:

```bash
web-ext run
```

# Linting

Check for common issues:

```bash
web-ext lint
```
