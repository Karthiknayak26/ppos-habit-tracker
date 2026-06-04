import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  // Set JWT as HTTP-only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-site cookies
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  
  return token;
};

export default generateToken;
