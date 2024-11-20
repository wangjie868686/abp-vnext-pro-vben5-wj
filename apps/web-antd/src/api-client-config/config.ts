import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-axios',
  input: 'http://182.43.18.151:44317/swagger/AbpPro/swagger.json',
  output: 'src/api-client',
});
