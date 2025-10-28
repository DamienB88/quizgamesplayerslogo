# GitHub Actions Workflows

## Important Note

The GitHub Actions workflow files (`ci.yml` and `build-and-deploy.yml`) are available in the `.github/workflows/` directory but were not pushed to the repository due to GitHub App permission restrictions.

## To Add Workflows Manually

1. **Enable Workflow Permissions** in your GitHub repository:
   - Go to Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"
   - Save changes

2. **Add the workflow files**:
   ```bash
   git add .github/workflows/
   git commit -m "chore: add GitHub Actions workflows"
   git push
   ```

## Available Workflows

### `ci.yml` - Continuous Integration
- Runs on every push and pull request
- Linting and type checking
- Unit tests with coverage
- Build verification
- Security scanning

### `build-and-deploy.yml` - Build and Deploy
- Builds iOS and Android apps on version tags
- Deploys web dashboard to Vercel
- Publishes to Expo

## Alternative

You can also manually create these files directly in GitHub:
1. Go to Actions tab in your repository
2. Click "New workflow"
3. Copy the content from the local files
4. Commit directly to the branch

The workflow files are ready to use and fully configured for the Privacy Social app.
