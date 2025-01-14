import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-axios',
  input: 'http://localhost:44315/swagger/AbpPro/swagger.json',
  output: 'src/api-client',
});
