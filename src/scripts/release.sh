#!/bin/bash
set -e

cd "$(dirname "$0")/../.."

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

if [ -z "$1" ]; then
  echo -e "${RED}Usage: $0 <version>${NC}"
  echo "  version: semantic version (e.g. 0.7.0) or bump: patch, minor, major"
  exit 1
fi

VERSION="$1"

# Resolve bump keywords
CURRENT=$(node -p "require('./package.json').version")
if [ "$VERSION" = "patch" ] || [ "$VERSION" = "minor" ] || [ "$VERSION" = "major" ]; then
  IFS='.' read -r MAJ MIN PAT <<< "$CURRENT"
  case "$VERSION" in
    patch) PAT=$((PAT + 1)) ;;
    minor) MIN=$((MIN + 1)); PAT=0 ;;
    major) MAJ=$((MAJ + 1)); MIN=0; PAT=0 ;;
  esac
  VERSION="$MAJ.$MIN.$PAT"
fi

TAG="v$VERSION"

echo -e "${GREEN}Releasing $TAG (current: $CURRENT)${NC}"

# Check clean working tree
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}Working tree is dirty. Commit or stash changes first.${NC}"
  exit 1
fi

# Check on main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo -e "${RED}Not on main branch (current: $BRANCH)${NC}"
  exit 1
fi

# Update version in package.json
npm version "$VERSION" --no-git-tag-version

# Commit and tag
git add package.json package-lock.json
git commit -m "release: v$VERSION"
git tag "$TAG"

# Push
git push origin main
git push origin "$TAG"

echo -e "${GREEN}✅ Released $TAG${NC}"
echo -e "${GREEN}GitHub Actions will publish to npm.${NC}"
