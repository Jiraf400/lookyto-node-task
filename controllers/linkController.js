const User = require('../models/User');
const Link = require('../models/Link');
const crypto = require('crypto');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

class linkController {

    async createLink(req, res) {
        try {

            const userFromToken = validateAuthHeaderAndExtractUsername(req, res);

            const userFromDb = await User.findOne({username: userFromToken});

            if (!userFromDb) {
                return res.status(403).json({'error': 'No users found'}).end();
            }

            const {linkJson} = req.body;

            const hashedLink = generateHashedLink();

            const link = (await Link.create({
                original_link: linkJson,
                hashed_link: hashedLink,
                user: userFromDb._id
            }));

            userFromDb.links.push(link);

            await User.updateOne(
                {username: userFromDb.username},
                {links: userFromDb.links}
            );

            await redis.set(link.hashed_link, JSON.stringify(link));

            return res.status(201).json({'link': hashedLink}).end();

        } catch (err) {
            console.error(err)
            return res.status(400).json({'error': 'Link creation error'}).end();
        }

    }

    async useShorterLink(req, res) {

        const hashed_link = req.protocol + '://' + req.get('host') + req.originalUrl;

        let linkFromDb = JSON.parse(await redis.get(hashed_link));

        if(!linkFromDb) {
            console.log('linkFromDb taken from mongo')
            linkFromDb = await Link.findOne({hashed_link});
        }

        if (!linkFromDb) {
            return res.status(403).json({'error': 'No links found'}).end();
        }

        const originalLink = linkFromDb.original_link;

        return res.redirect(originalLink);
    }

    async getLinks(req, res) {

        const userFromToken = validateAuthHeaderAndExtractUsername(req, res);

        const userFromDb = await User.findOne({username: userFromToken});

        const linkArr = [];

        for (const id of userFromDb.links) {
            const linkById = await Link.findById(id);

            linkArr.push(linkById);
        }

        return res.status(200).json(linkArr).end();
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

    return process.env.LINK_PREFIX + process.env.PORT + '/' + newLink;
}

module.exports = new linkController();






