import { onRequest } from 'firebase-functions/v2/https';
  const server = import('firebase-frameworks');
  export const ssrveritasinmueble2 = onRequest({}, (req, res) => server.then(it => it.handle(req, res)));
  