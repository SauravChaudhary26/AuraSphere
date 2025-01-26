// Import the googleapis library
const { google } = require("googleapis");

// Ensure that environment variables are set correctly
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "postmessage"; // Default to 'postmessage' if not set

// Check if environment variables are properly loaded
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
   throw new Error(
      "Google Client ID and Secret must be set in environment variables."
   );
}

// Initialize the OAuth2 client for Google APIs
const oauth2Client = new google.auth.OAuth2(
   GOOGLE_CLIENT_ID,
   GOOGLE_CLIENT_SECRET,
   GOOGLE_REDIRECT_URI
);

// Export the oauth2Client for use in other parts of your app
module.exports = {
   oauth2Client,
};
