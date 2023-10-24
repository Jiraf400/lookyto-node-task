const User = require('../models/User');
const Link = require('../models/Link');
const crypto = require('crypto');
require('dotenv').config();
const jwt = require('jsonwebtoken');


class linkController {

    async createLink(req, res) {
        try {

            const userFromToken = validateAuthHeaderAndExtractUsername(req, res);

            const {linkJson} = req.body;

            const hashedLink = generateHashedLink();

            const link = (await Link.create({
                'original_link': linkJson,
                'hashed_link': hashedLink
            }));

            const userFromDb = await User.findOne({'username': userFromToken});

            userFromDb.links.push(link);

            await User.updateOne(
                {'username': userFromDb.username},
                {'links': userFromDb.links}
            );

            return res.status(201).json({'link': hashedLink}).end();

        } catch (err) {
            console.error(err)
            return res.status(400).json({'error': 'Link creation error'}).end();
        }

    }

    async useShorterLink(req, res) {

        const hashed_link = req.protocol + '://' + req.get('host') + req.originalUrl;

        const linkFromDb = await Link.findOne({hashed_link});

        if (!linkFromDb) {
            return res.status(403).json({'error': 'No models found'}).end();
        }

        const originalLink = linkFromDb.original_link;

        return res.redirect(originalLink);
    }

    async getLinks(req, res) {

    }

}

const validateAuthHeaderAndExtractUsername = (req, res) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({'error': 'invalid token'}).end();
    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(401).json({'error': 'invalid token'}).end();
            req.user = decoded.username;
        });

    return req.user;
}

const generateHashedLink = () => {

    const newLink = crypto.randomBytes(4).toString('hex');
    console.log('generateHashedLink: ' + newLink)

    return process.env.LINK_PREFIX + process.env.PORT + '/' + newLink;
}

module.exports = new linkController();






