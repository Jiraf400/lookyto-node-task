const User = require('../models/User');
const Link = require('../models/Link');
const crypto = require('crypto');
require('dotenv').config();
const jwt = require('jsonwebtoken');


class linkController {

    async createLink(req, res) {
        try {

            const authHeader = req.headers.authorization || req.headers.Authorization;
            if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({'error': 'invalid token'}).end();
            const token = authHeader.split(' ')[1];
            console.log(token)

            jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET,
                (err, decoded) => {
                    if (err) return res.status(401).json({'error': 'invalid token'}).end();
                    req.user = decoded.username;
                });

            const {linkJson} = req.body;

            const hashedLink = generateHashedLink();

            const link = (await Link.create({
                'original_link': linkJson,
                'hashed_link': hashedLink
            }));

            const userFromDb = await User.findOne(req.user.toObject);
            userFromDb.links.push(link);

            const savedUser = await User.updateOne(
                {'username': userFromDb.username},
                {'links': userFromDb.links}
            );

            console.log(`saved user: ${savedUser}`);

            return res.status(201).json({'link': hashedLink}).end();

        } catch (err) {
            console.error(err)
            return res.status(400).json({'error': 'Link creation error'}).end();
        }

    }

    async deleteLink(req, res) {

    }

    async getLinks(req, res) {

    }


}

const generateHashedLink = () => {

    const newLink = crypto.randomBytes(4).toString('hex');
    console.log('generateHashedLink: ' + newLink)

    return process.env.LINK_PREFIX + process.env.PORT + '/' + newLink;
}

module.exports = new linkController();






