import { builder } from '@builder.io/react';

const apiKey = import.meta.env.VITE_PUBLIC_BUILDER_KEY as string;
if (apiKey) {
  builder.init(apiKey);
} else {
  // eslint-disable-next-line no-console
  console.warn('VITE_PUBLIC_BUILDER_KEY not set. Builder.io content will not load.');
}

export { builder };
