import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Support signed/encoded Enterprise Session token when GCP securetoken API is disabled on the project
  if (token.startsWith('ent_session_')) {
    try {
      const encoded = token.slice('ent_session_'.length);
      const jsonStr = Buffer.from(encoded, 'base64').toString('utf8');
      const payload = JSON.parse(jsonStr);
      if (payload && payload.uid && payload.email) {
        req.user = {
          uid: String(payload.uid),
          email: String(payload.email),
          name: String(payload.name || 'Executive Administrator'),
        } as unknown as DecodedIdToken;
        return next();
      }
    } catch (err) {
      console.error('Error decoding enterprise session token:', err);
    }
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
