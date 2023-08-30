import express, { Request, Response } from 'express';
import { AuthService, REFRESH_TOKEN_KEY } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { DataReply } from '../core/DataReply';
import { CommonTypes } from 'common';

const router = express.Router();

// Get the logged in user.
router.get('/myuser', AuthService.authMiddleware, async (req: Request, res: Response) => {
  try {
    const { user } = res.locals;
    const reply = await UserService.get(user.id);

    if (reply.error) {
      return res.status(500).json({ error: reply.error });
    }

    return res.status(200).json(reply.data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // First grab the user by username
    const reply = await UserService.getByQuery({ email });

    // Check that we got a user back.
    if (reply.error || !reply.data) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check the password.
    if (!(await AuthService.checkPassword(reply.data.id, password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = AuthService.generateAccessToken(reply.data);
    const refreshToken = AuthService.generateRefreshToken(reply.data);

    return res
      .cookie(REFRESH_TOKEN_KEY, refreshToken, AuthService.makeRefreshCookieProps())
      .header('Authorization', `Bearer ${accessToken}`)
      .json(reply.data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Register route
router.post('/register', async (req: Request, res: Response) => {
  try {
    const password: string = req.body.password;
    delete req.body.password;
    const user: Partial<CommonTypes.User> = req.body;
    const reply: DataReply<CommonTypes.User> = await UserService.create(user, password);

    if (reply.error || !reply.data) {
      return res.status(500).json({ error: reply.error });
    }

    const accessToken = AuthService.generateAccessToken(reply.data);
    const refreshToken = AuthService.generateRefreshToken(reply.data);

    return res
      .cookie(REFRESH_TOKEN_KEY, refreshToken, AuthService.makeRefreshCookieProps())
      .header('Authorization', `Bearer ${accessToken}`)
      .json(reply.data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Refresh route
// TODO: When do we want to call this?
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_KEY];

    if (!refreshToken) {
      return res.status(401).json({ error: 'Access Denied. No refresh token provided.' });
    }
    const decoded: any = AuthService.verifyToken(refreshToken);
    const reply: DataReply<string> = await UserService.refresh(decoded.user);

    if (reply.error) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    res
      .cookie(REFRESH_TOKEN_KEY, refreshToken, AuthService.makeRefreshCookieProps())
      .header('Authorization', `Bearer ${reply.data}`)
      .json(decoded.user);
  } catch (error: any) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout route
router.put('/logout', (_req: Request, res: Response) => {
  // Clear the refresh token cookie. Set the expiry to a date in the past.
  res.clearCookie(REFRESH_TOKEN_KEY, AuthService.makeRefreshCookieProps(new Date(Date.now() - 1000)));
  res.send('Logged out');
});

export default router;
