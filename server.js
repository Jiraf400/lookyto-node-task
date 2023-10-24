const express = require('express');
const linkRouter = require('./routers/linkRouter');
const authRouter = require('./routers/authRouter');
const mongoose = require("mongoose").default;

const PORT = process.env.PORT || 5000;
const app = express();
require('dotenv').config();

app.use(express.json());

app.use('/auth', authRouter);
app.use('/links/', linkRouter);
app.use('/', linkRouter);

const start = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
    } catch (e) {
        console.log(e)
    }
}

start();
