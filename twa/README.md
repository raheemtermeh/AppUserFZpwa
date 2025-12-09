TWA packaging instructions

This folder contains helper samples to create a Trusted Web Activity (Android) wrapper for the Funzone PWA.

Prerequisites (on a machine with Android SDK and Java installed):

1. Install Bubblewrap CLI globally:

   npm install -g @bubblewrap/cli

2. Build your web app for production and serve it over HTTPS at a public URL (required for Digital Asset Links). Example:

   npm run build
   npx serve dist --listen 8080 --single

3. Initialize Bubblewrap (replace values when prompted or use the sample config below):

   bubblewrap init --manifest https://your-domain.example/manifest.json

   or use the config file:

   bubblewrap init --config twa/bubblewrap-config.json

4. Build the TWA:

   bubblewrap build

5. Sign and install the generated APK from `./android/` (see Bubblewrap docs).

Digital Asset Links

To enable TWA without warnings you must host an `assetlinks.json` file at:

https://<your-domain>/.well-known/assetlinks.json

Sample `assetlinks.json` is provided as `assetlinks.sample.json` in this folder — replace package name and SHA256 fingerprint with your Android app's values.

Notes

- Bubblewrap performs key generation and sets Android package name; set the `host` in the config to the public domain where your PWA is served.
- If you need help generating the fingerprint or setting up CI to build the TWA, I can add a sample GitHub Actions workflow.
