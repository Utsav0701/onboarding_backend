import jwt from 'jsonwebtoken';
import Client  from '../models/Client.js';

export const decoder = async (req, res, next) => {
    try{
        const token = req.params.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Verify token
        const client = await Client.findById(decoded.id);

        if(client.token === null || client.token === '') {
            return res.status(401).json({ message: 'Token is not valid or has been used' });
        }


        // Attach client data to request object
        req.id = decoded.id;
        req.client = client;
        next();
    }catch(err) {
        console.error('Decoder error:', err.message);
        res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
}