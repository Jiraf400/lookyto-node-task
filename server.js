const express = require('express');
const PORT = process.env.PORT || 5000;
const app = express();

const linkRouter = require('./routers/linkRouter');
const authRouter = require('./routers/authRouter');

app.use(express.json());

app.use('/auth', authRouter);
app.use('/', linkRouter);

const start = function () {
    try {
        app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
    } catch (e) {
        console.log(e)
    }
}

start();
