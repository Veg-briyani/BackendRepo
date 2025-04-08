# Maximus Backend Deployment on Render

This guide explains how to deploy the Maximus backend application to Render's cloud platform.

## Prerequisites

1. A Render account
2. MongoDB Atlas account (for production database)
3. Your environment variables ready

## Deployment Steps
h
### 1. Create a MongoDB Atlas Cluster

- Create or use an existing MongoDB Atlas cluster
- Create a database user with appropriate permissions
- Get your connection string (replace username, password, and cluster details)

### 2. Deploy on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - **Name**: `maximus-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Plan**: Choose an appropriate plan (at least Starter)

### 3. Set Environment Variables

Add the following environment variables in Render dashboard:

- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will override this with its own PORT)
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your JWT secret
- `JWT_EXPIRES_IN`: `30d` (or your preferred expiration)
- `JWT_REFRESH_SECRET`: Your refresh token secret
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number
- `EMAIL_SERVICE`: Your email service provider
- `EMAIL_USER`: Your email username/address
- `EMAIL_PASSWORD`: Your email password or app password
- `EMAIL_FROM`: The from address for emails
- `CLIENT_URL`: The URL of your frontend application on Render
- `OTP_EXPIRY_TIME`: OTP expiration time in milliseconds

### 4. Deploy Frontend

Deploy your frontend application to Render as well, following similar steps.
Update the `CLIENT_URL` in your backend environment variables to match your deployed frontend URL.

### 5. Test the Deployment

- Check the Render logs for any errors
- Test the API endpoints using tools like Postman
- Verify frontend connectivity to the backend

## Important Notes

1. **File Storage**: Render has an ephemeral filesystem, meaning files uploaded to the service will not persist across deploys. Use a service like AWS S3 for production file storage.

2. **Environment Variables**: Never commit sensitive information like API keys or database credentials to your repository. Always use environment variables.

3. **CORS Settings**: The application has been updated to use the CLIENT_URL environment variable for CORS settings.

4. **Database Connections**: Make sure your MongoDB Atlas IP Whitelist includes Render's IP addresses, or set it to allow connections from anywhere (0.0.0.0/0).

5. **Health Check**: Render automatically pings the `/` endpoint. Your application now has a `/api/health` endpoint that returns a status code of 200, which you can use as a health check URL.

## Troubleshooting

- Check Render logs for errors
- Verify that all environment variables are set correctly
- Ensure your MongoDB Atlas connection string is correct and the database is accessible
- Check that your CORS settings allow requests from your frontend application
