import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const getadmindetails = async (req, res) => {
  try {
    
 
    res.status(200).json({
      role: req.admin.role, 
    }); // { id, email }
  } catch (err) {
    console.error('Error fetching admin details:', err);
    return res.status(404).json({ message: 'Admin not found' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    

    // Set token in HTTP-only cookie
    // res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: false, // set true in production
    //   sameSite: 'Lax', // adjust based on your needs
    //   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    // });

      res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

    res.status(200).json({
      message: 'Login successful',
      
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
