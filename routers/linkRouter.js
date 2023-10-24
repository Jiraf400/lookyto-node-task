const Router = require('express').Router;
const router = new Router;
const controller = require('../controllers/linkController');

router.post('/create', controller.createLink);
router.get('/getList', controller.getLinks);
router.get('/**', controller.useShorterLink);

module.exports = router;