# SECURITY NOTICE

## Database Credentials Rotation Required

**Date**: June 20, 2025  
**Issue**: Database credentials were accidentally committed to git history

### Actions Taken:
1. ✅ Removed credentials from git history using git filter-branch
2. ✅ Force pushed to GitHub to clean remote repository
3. ⚠️ **You need to rotate your Neon database password**

### How to Rotate Credentials:

1. **Go to Neon Dashboard**
   - Log into your Neon account
   - Navigate to your project settings
   - Find the "Reset password" option

2. **Update Vercel Environment Variables**
   - Go to your Vercel project settings
   - Update all database-related environment variables with new credentials

3. **Update Local .env.local**
   - Update your local .env.local file with new credentials
   - Never commit .env files to git

### Prevention:
- Always use .env.local for sensitive data
- Verify .gitignore includes .env* patterns
- Use Vercel's environment variable system for production secrets
- Consider using git-secrets or similar tools to prevent credential commits