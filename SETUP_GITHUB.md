# GitHub Setup Instructions

## Step 1: Create Repository on GitHub

1. Go to https://github.com/sagarprasad
2. Click the "+" icon in the top right
3. Select "New repository"
4. Repository name: `rule-editor`
5. Description: "Rule Engine Editor for Business Users"
6. Choose Public or Private
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repository, run these commands:

```bash
cd /Users/sagar.prasad/Documents/office/code/others/rule-editor
git push -u origin main
```

If you need to authenticate, GitHub will prompt you for credentials or you can use a Personal Access Token.

## Step 3: Deploy to GitHub Pages (Optional)

To host the application on GitHub Pages:

1. Install gh-pages package:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json scripts:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. Deploy:
```bash
npm run deploy
```

4. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

The app will be available at: `https://sagarprasad.github.io/rule-editor/`
