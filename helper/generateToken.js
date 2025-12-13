import jwt from 'jsonwebtoken';

export const generateToken = (userid) => {
   const token = jwt.sign(
        { id: userid},
        process.env.JWT_SECRET
      );
    return token;
}