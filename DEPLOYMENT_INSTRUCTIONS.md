# DEPLOYMENT INSTRUCTIONS
# =======================

## Backend (Node.js API) - Vercel Deployment

### Step 1: Create MongoDB Database
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a free M0 cluster
4. Create a database user with credentials
5. Add your Vercel IP (0.0.0.0/0 for testing) to network access
6. Copy connection string: `mongodb+srv://user:password@cluster.mongodb.net/gennotes?retryWrites=true&w=majority`

### Step 2: Generate JWT Secret
Run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and save it for JWT_SECRET

### Step 3: Setup Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select Mail and Windows (or your device)
3. Google will generate a 16-character password
4. Use this as MAIL_PASS (not your Gmail password)

### Step 4: Connect Vercel to GitHub
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Select Backend folder as root directory (if in monorepo)

### Step 5: Set Environment Variables in Vercel
1. Go to Project Settings > Environment Variables
2. Add these variables:
   - DB_URI: `mongodb+srv://user:password@cluster.mongodb.net/gennotes?retryWrites=true&w=majority`
   - JWT_SECRET: (from Step 2)
   - JWT_EXPIRE_IN: `7d`
   - FRONTEND_URL: `https://your-frontend-vercel-url.vercel.app`
   - MAIL_HOST: `smtp.gmail.com`
   - MAIL_PORT: `587`
   - MAIL_SECURE: `false`
   - MAIL_USER: `your-email@gmail.com`
   - MAIL_PASS: (from Step 3 - 16 char app password)
   - MAIL_FROM_NAME: `GenNotes`
   - ALLOWED_ORIGINS: `https://your-frontend-vercel-url.vercel.app,http://localhost:3000`
   - NODE_ENV: `production`

### Step 6: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Note your backend URL: `https://your-backend.vercel.app`

### Step 7: Test Backend
Open in browser: `https://your-backend.vercel.app/`
Should see: `{"success":true,"message":"API Server is running",...}`

---

## Frontend (React + Vite) - Vercel Deployment

### Step 1: Update Production Environment File
Edit `.env.production`:
```
VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1/
```

### Step 2: Connect Vercel to GitHub
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Select Frontend folder as root directory

### Step 3: Configure Build Settings
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL: `https://your-frontend.vercel.app`

### Step 5: Update Backend CORS
Go back to Backend project settings and update:
- FRONTEND_URL: `https://your-frontend.vercel.app`
- ALLOWED_ORIGINS: `https://your-frontend.vercel.app`
Redeploy backend with new variables

---

## Testing Checklist

After deployment, test these flows:

### Authentication Flow
- [ ] Sign up with new email
- [ ] Receive OTP verification email
- [ ] Verify email with OTP
- [ ] Login with credentials
- [ ] View profile/user info
- [ ] Logout

### Notes Management
- [ ] Create new note
- [ ] View all notes
- [ ] View note details
- [ ] Edit note
- [ ] Delete note

### Error Handling
- [ ] Try invalid email on signup
- [ ] Try weak password
- [ ] Try duplicate email signup
- [ ] Try login with wrong password
- [ ] Try accessing protected route without login
- [ ] Test rate limiting (15 auth attempts in 15 mins)

### Email Verification
- [ ] Forgot password flow
- [ ] Reset password with token
- [ ] New OTP verification emails

---

## Troubleshooting

### MongoDB Connection Error
- Check connection string format
- Verify IP whitelist includes 0.0.0.0/0
- Ensure database user credentials are correct
- Check ALLOWED_ORIGINS in MongoDB connection string

### CORS Errors
- Verify ALLOWED_ORIGINS includes frontend URL
- Ensure credentials flag is true
- Check Authorization header format: `Bearer <token>`

### Email Not Sending
- Verify Gmail app password (not regular password)
- Enable Less Secure Apps or use App Passwords
- Check MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS
- Verify email format in controller

### Frontend Not Connecting to Backend
- Check VITE_API_BASE_URL in .env.production
- Ensure backend URL is correct and has /api/v1/ path
- Check browser console for CORS errors
- Verify Vercel environment variables are set

---

## Production Best Practices

1. **Security**
   - Never commit .env files with secrets
   - Use strong JWT_SECRET (32+ characters)
   - Use HTTPS only (Vercel handles this)
   - Keep dependencies updated

2. **Monitoring**
   - Check Vercel logs for errors
   - Monitor MongoDB Atlas metrics
   - Set up error alerts in Vercel

3. **Backup**
   - Regular MongoDB backups
   - Version control for code
   - Document all environment variables

4. **Performance**
   - Enable MongoDB connection pooling
   - Use Vercel analytics
   - Optimize database queries
   - Monitor API response times

---

Generated: November 18, 2025
