# Skip that Noise

A Firefox extension that automatically skips songs by specific artists on YouTube Music.

<img src="img-src/screenshot.png" width="300">

# Installation

To install the extension permanently, you need to package and sign it. Firefox requires extensions to be signed to install permanently.

`web-ext` is Mozilla's official command-line tool for building and signing extensions.

**1. Install web-ext:**

```bash
npm install --global web-ext
```

**2. Setup your Mozilla Add-ons account:**

Register on [addons.mozilla.org](https://addons.mozilla.org). Then generate API credentials from [addons.mozilla.org/en-US/developers/addon/api/key/](https://addons.mozilla.org/en-US/developers/addon/api/key/).

At this point, you should also open `manifest.json` and set the `applications.gecko.id` field to a unique identifier for your extension.

**3. Build the extension:**

```bash
web-ext build --overwrite-dest
web-ext sign --api-key="[JWT issuer]" --api-secret="[JWT secret]" --channel="unlisted"
```

This creates a ZIP file called `web-ext-artifacts/skip_that_noise-1.0.zip`, and the sigend extension called `web-ext-artifacts/[id]-1.0.xpi`.

**4. Install the signed extension:**

You can now go to Firefox's Extension Manager (`about:addons`), click on the gear icon, and select "Install Add-on From File..." to install the signed extension.

### Testing During Development

Run the extension in a temporary Firefox instance:

```bash
web-ext run
```

### Linting

Check for common issues:

```bash
web-ext lint
```