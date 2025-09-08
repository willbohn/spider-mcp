# Publishing to npm

## For Package Maintainers Only

### First Time Setup

1. Create an npm account at https://www.npmjs.com/signup
2. Login to npm:
   ```bash
   npm login
   ```

### Publishing Steps

1. Ensure everything is built:
   ```bash
   npm run build
   ```

2. Test locally:
   ```bash
   npm link
   spider-mcp  # Test the global command works
   ```

3. Update version (if needed):
   ```bash
   npm version patch  # or minor/major
   ```

4. Publish to npm:
   ```bash
   npm publish --access public
   ```

### After Publishing

Users can then use it with:
```bash
# Direct execution with npx
npx @spider-cloud/mcp-server

# Or global install
npm install -g @spider-cloud/mcp-server
```

### Checking Package

View the published package at:
https://www.npmjs.com/package/@spider-cloud/mcp-server