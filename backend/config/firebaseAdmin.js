const admin = require('firebase-admin');

// Initialize Firebase Admin using either GOOGLE_APPLICATION_CREDENTIALS or a base64-encoded service account in FIREBASE_SERVICE_ACCOUNT
function initializeFirebaseAdmin() {
  if (admin.apps.length) {
    return admin.app();
  }

  // Prefer explicit base64 service account if provided
  const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (base64ServiceAccount) {
    const json = JSON.parse(Buffer.from(base64ServiceAccount, 'base64').toString('utf8'));
    return admin.initializeApp({
      credential: admin.credential.cert(json)
    });
  }

  // Fallback to ADC via GOOGLE_APPLICATION_CREDENTIALS or environment (e.g., GCP)
  return admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

function getAdmin() {
  try {
    return initializeFirebaseAdmin();
  } catch (e) {
    // Defer throwing until verification is attempted to avoid crashing server boot if credentials are missing.
    return null;
  }
}

async function verifyIdToken(idToken) {
  const app = getAdmin();
  if (!app) {
    throw new Error('Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.');
  }
  const auth = admin.auth(app);
  return await auth.verifyIdToken(idToken);
}

module.exports = { verifyIdToken };


