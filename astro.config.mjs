// @ts-check
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  output: 'static',
  env: {
    schema: {
      FIREBASE_API_KEY:             envField.string({ context:"client", access:"public"}),
      FIREBASE_AUTH_DOMAIN:         envField.string({ context:"client", access:"public"}),
      FIREBASE_PROJECT_ID:          envField.string({ context:"client", access:"public"}),
      FIREBASE_STORAGE_BUCKET:      envField.string({ context:"client", access:"public"}),
      FIREBASE_MESSAGING_SENDER_ID: envField.string({ context:"client", access:"public"}),
      FIREBASE_APP_ID:              envField.string({ context:"client", access:"public"}),
      FIREBASE_MEASUREMENT_ID:      envField.string({ context:"client", access:"public"}),
    }
  }
});