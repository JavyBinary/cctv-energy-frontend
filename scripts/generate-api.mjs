import { resolve } from 'node:path';
import { generateApi } from 'swagger-typescript-api';

generateApi({
  name: 'Api.ts',
  output: resolve(process.cwd(), './src/api'),
  url: 'http://127.0.0.1:8000/openapi.json',
  httpClientType: 'axios',
});
