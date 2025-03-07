#!/bin/bash

# GitHub setup script for Presidential Roast
echo "Presidential Roast - GitHub Setup"
echo "--------------------------------"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git first."
    exit 1
fi

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Ask for GitHub username and repository name
read -p "Enter your GitHub username: " github_username
read -p "Enter the repository name (default: presidential-roast): " repo_name
repo_name=${repo_name:-presidential-roast}

# Create .gitignore file if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore file..."
    cat > .gitignore << EOF
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF
fi

# Add all files, commit and set remote
echo "Adding files to git..."
git add .

echo "Committing files..."
git commit -m "Initial commit for Presidential Roast"

# Set the remote origin
echo "Setting up remote repository..."
git remote add origin https://github.com/$github_username/$repo_name.git

echo "All done! Now you can push to GitHub with:"
echo "git push -u origin main"
echo ""
echo "After pushing, you can set up Netlify deployment using:"
echo "1. Go to https://app.netlify.com/"
echo "2. Click 'New site from Git'"
echo "3. Choose GitHub and select your repository"
echo "4. Set build command to: npm run build"
echo "5. Set publish directory to: .next"
echo "6. Add environment variables from .env.production"
echo "7. Click 'Deploy site'" 