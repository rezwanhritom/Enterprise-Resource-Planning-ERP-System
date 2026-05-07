import jwt from 'jsonwebtoken';

const generateToken = ({ userId, roles }) => {
  return jwt.sign({ userId, roles }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export default generateToken;
