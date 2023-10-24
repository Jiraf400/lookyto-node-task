const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (id, username) => {
    const payload = {
        id, username
    };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '12h'})
}

class authController {

    async registration(req, res) {
        const {username, password} = req.body;

        if (!username || !password) return res.status(400).json({'message': 'Username and password are required.'});

        const duplicate = await User.findOne({username: username}).exec();

        if (duplicate) return res.sendStatus(409).json({'message': 'User already exists.'});

        try {
            const hashedPwd = await bcrypt.hash(password, 10);

            const result = await User.create({
                "username": username,
                "password": hashedPwd
            });

            console.log(result);

            res.status(201).json({'success': `New user ${username} created!`});
        } catch (err) {
            res.status(500).json({'message': err.message});
        }
    }

    async login(req, res) {
        const {username, password} = req.body;
        if (!username || !password) return res.status(400).json({'error': 'Username and password are required.'});

        const foundUser = await User.findOne({username: username}).exec();

        if (!foundUser) return res.sendStatus(403).json({'error': `User not exists with username ${username}`});

        const match = await bcrypt.compare(password, foundUser.password);
        if (match) {

            const accessToken = generateAccessToken(foundUser.id, foundUser.username)

            const result = await foundUser.save();
            console.log(result);

            res.json({'access_token': accessToken});
        } else {
            res.sendStatus(401).json({'error': 'Login error'});
        }
    }

}

module.exports = new authController();