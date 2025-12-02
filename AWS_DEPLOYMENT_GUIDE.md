# AWS Deployment Guide - Car Rental Application

This guide walks you through deploying your car rental application to AWS using:
- **AWS Amplify** for the React frontend
- **AWS Elastic Beanstalk** for the Node.js backend
- **MongoDB Atlas** for the database (already configured)

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured (✓ Already installed)
- Git repository initialized
- Node.js and npm installed

---

## Part 1: Deploy Backend to AWS Elastic Beanstalk

### Step 1: Initialize Elastic Beanstalk CLI

```powershell
# Install EB CLI if not already installed
pip install awsebcli

# Verify installation
eb --version
```

### Step 2: Configure AWS Credentials

```powershell
# Configure AWS CLI (if not already done)
aws configure
```

You'll need:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Output format (json)

### Step 3: Initialize and Deploy Backend

```powershell
cd server

# Initialize Elastic Beanstalk application
eb init -p node.js-20 car-rental-backend --region us-east-1

# Create environment and deploy
eb create car-rental-backend-env --single --instance-types t3.micro

# This will:
# - Create an EC2 instance
# - Set up load balancer
# - Deploy your application
# - Provide a URL like: car-rental-backend-env.xxxxxxxx.us-east-1.elasticbeanstalk.com
```

### Step 4: Set Environment Variables for Backend

```powershell
# Set all required environment variables
eb setenv MONGODB_URI="mongodb+srv://totalchaos:totalchaos2005@cluster0.majgsoy.mongodb.net"

eb setenv IMAGEKIT_PUBLIC_KEY="{{IMAGEKIT_PUBLIC_KEY}}"
eb setenv IMAGEKIT_PRIVATE_KEY="{{IMAGEKIT_PRIVATE_KEY}}"
eb setenv IMAGEKIT_URL_ENDPOINT="{{IMAGEKIT_URL_ENDPOINT}}"

eb setenv RAZORPAY_KEY_ID="{{RAZORPAY_KEY_ID}}"
eb setenv RAZORPAY_KEY_SECRET="{{RAZORPAY_KEY_SECRET}}"

eb setenv EMAIL_USER="{{EMAIL_USER}}"
eb setenv EMAIL_PASS="{{EMAIL_PASS}}"

eb setenv TWILIO_ACCOUNT_SID="{{TWILIO_ACCOUNT_SID}}"
eb setenv TWILIO_AUTH_TOKEN="{{TWILIO_AUTH_TOKEN}}"
eb setenv TWILIO_PHONE="{{TWILIO_PHONE}}"

# Restart environment to apply changes
eb restart
```

### Step 5: Upload Firebase Service Account Key

The Firebase admin SDK requires the `serviceAccountKey.json` file. You need to:

1. Add it to S3 and configure EB to download it, OR
2. Set the credentials as environment variables

**Option A: Using S3 (Recommended)**
```powershell
# Upload to S3
aws s3 cp serviceAccountKey.json s3://your-bucket-name/serviceAccountKey.json

# Then add to .ebextensions/firebase.config:
# files:
#   "/tmp/serviceAccountKey.json":
#     mode: "000644"
#     owner: nodejs
#     group: nodejs
#     source: https://s3.amazonaws.com/your-bucket-name/serviceAccountKey.json
```

**Option B: Use environment variables**
Convert the JSON to base64 and set it as an env var (see Firebase docs).

### Step 6: Update CORS Configuration

You'll need to update CORS in your backend to allow requests from your Amplify frontend URL.

Edit `server/server.js` to use dynamic CORS:
```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
```

Then set:
```powershell
eb setenv ALLOWED_ORIGINS="https://your-amplify-url.amplifyapp.com,http://localhost:5173"
```

### Step 7: Check Backend Deployment

```powershell
# Open your application in browser
eb open

# Check status
eb status

# View logs
eb logs
```

**Save your backend URL** (e.g., `https://car-rental-backend-env.us-east-1.elasticbeanstalk.com`)

---

## Part 2: Deploy Frontend to AWS Amplify

### Step 1: Update Frontend Environment Variables

Update `car-rental-1/.env` with your backend URL:
```env
VITE_BASE_URL=https://car-rental-backend-env.us-east-1.elasticbeanstalk.com
```

### Step 2: Push Code to Git Repository

Amplify requires your code in a Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit).

```powershell
cd E:\last-attempt

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for AWS deployment"

# Push to your remote repository (GitHub/GitLab/etc)
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Step 3: Deploy to AWS Amplify via Console

1. **Go to AWS Amplify Console**: https://console.aws.amazon.com/amplify/
2. Click **"New app"** → **"Host web app"**
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Authorize AWS Amplify to access your repository
5. Select your repository and branch (`main`)
6. Configure build settings:
   - **App name**: car-rental-frontend
   - **Environment**: production
   - **Build settings**: The `amplify.yml` file will be auto-detected
   - **Root directory**: `car-rental-1`

7. **Add environment variables** in Amplify:
   - Click "Advanced settings"
   - Add all `VITE_*` variables from your `.env` file:
     ```
     VITE_CURRENCY=₹
     VITE_BASE_URL=https://your-backend-url.elasticbeanstalk.com
     VITE_FIREBASE_API_KEY=...
     VITE_FIREBASE_AUTH_DOMAIN=...
     VITE_FIREBASE_PROJECT_ID=...
     VITE_FIREBASE_STORAGE_BUCKET=...
     VITE_FIREBASE_MESSAGING_SENDER_ID=...
     VITE_FIREBASE_APP_ID=...
     VITE_FIREBASE_MEASUREMENT_ID=...
     ```

8. Click **"Save and deploy"**

### Step 4: Wait for Deployment

Amplify will:
- Clone your repository
- Install dependencies (`npm ci`)
- Build your app (`npm run build`)
- Deploy to CloudFront CDN

This typically takes 3-5 minutes.

### Step 5: Access Your Application

Once deployed, Amplify provides a URL like:
```
https://main.xxxxxx.amplifyapp.com
```

---

## Part 3: Update Backend CORS

Now that you have your frontend URL, update the backend CORS:

```powershell
cd server
eb setenv ALLOWED_ORIGINS="https://main.xxxxxx.amplifyapp.com,http://localhost:5173"
eb restart
```

---

## Monitoring & Management

### Backend (Elastic Beanstalk)

```powershell
# View logs
eb logs

# Check health
eb health

# SSH into instance (if needed)
eb ssh

# Update application after code changes
eb deploy
```

### Frontend (Amplify)

- **Console**: https://console.aws.amazon.com/amplify/
- **Auto-deploy**: Amplify automatically deploys when you push to the branch
- **Build logs**: Available in the Amplify console
- **Environment variables**: Manage in Amplify Console → App Settings → Environment variables

---

## Cost Estimates

- **Elastic Beanstalk (t3.micro)**: ~$8-10/month
- **AWS Amplify**: ~$5/month (includes CDN, hosting)
- **Data transfer**: Variable (estimate ~$5-10/month)
- **Total**: ~$20-30/month for low-moderate traffic

### Cost Optimization Tips
- Use AWS Free Tier where applicable
- Enable auto-scaling only if needed
- Monitor with AWS Cost Explorer

---

## Troubleshooting

### Backend Issues

1. **App not starting**:
   ```powershell
   eb logs
   # Check for missing environment variables or dependencies
   ```

2. **Database connection fails**:
   - Verify MongoDB Atlas allows connections from AWS IPs
   - Check `MONGODB_URI` environment variable

3. **502 Bad Gateway**:
   - App might be crashing
   - Check logs: `eb logs`
   - Verify PORT is set correctly (5000)

### Frontend Issues

1. **Build fails**:
   - Check build logs in Amplify Console
   - Verify all environment variables are set
   - Test build locally: `npm run build`

2. **API calls fail (CORS)**:
   - Verify backend CORS is configured with frontend URL
   - Check browser console for errors

3. **Environment variables not working**:
   - Ensure all `VITE_*` variables are set in Amplify Console
   - Redeploy after adding variables

---

## Updating Your Application

### Backend Updates
```powershell
cd server
# Make your changes
eb deploy
```

### Frontend Updates
```powershell
# Just push to Git - Amplify auto-deploys
git add .
git commit -m "Update frontend"
git push
```

---

## Security Considerations

1. **Never commit `.env` files** (already in `.gitignore`)
2. **Rotate credentials** regularly (database, API keys)
3. **Use AWS Secrets Manager** for sensitive data in production
4. **Enable HTTPS** (Amplify provides this by default)
5. **Set up AWS WAF** for DDoS protection if needed
6. **Configure Security Groups** to restrict database access

---

## Alternative: AWS Amplify CLI Deployment

If you prefer CLI over Console:

```powershell
cd car-rental-1

# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

---

## Need Help?

- **AWS Documentation**: https://docs.aws.amazon.com/
- **Elastic Beanstalk**: https://docs.aws.amazon.com/elasticbeanstalk/
- **AWS Amplify**: https://docs.amplify.aws/
- **AWS Support**: Available in AWS Console

---

## Quick Command Reference

```powershell
# Backend
cd server
eb init
eb create car-rental-backend-env
eb setenv KEY=value
eb deploy
eb logs
eb status

# Frontend (if using Amplify CLI)
cd car-rental-1
amplify init
amplify publish

# Git
git add .
git commit -m "message"
git push
```

---

**You're all set! 🚀** Your car rental application should now be live on AWS.
