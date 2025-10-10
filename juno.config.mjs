import { defineConfig } from "@junobuild/config";

/** @type {import('@junobuild/config').JunoConfig} */
export default defineConfig({
  satellite: {
    ids: {
      development: process.env.NEXT_PUBLIC_JUNO_SATELLITE_ID,
      production: process.env.NEXT_PUBLIC_JUNO_SATELLITE_ID,
    },
    source: "out",
    predeploy: ["npm run build"],
    // Specify the path to the custom satellite WASM for local development
    functions: {
      source: "target/deploy/satellite.wasm.gz"
    }
  },
});

