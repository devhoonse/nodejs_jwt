
require('dotenv').config();
import path from 'path';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import send from 'koa-send';
import mongoose from 'mongoose';

import api from './api';
import jwtMiddleware from "./lib/jwtMiddleware";


const { PORT, MONGO_URI } = process.env;


mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, })  // , useFindAndModify: false
    .then(() => {
        console.log(`[INFO] Connected to MongoDB!`);
    })
    .catch(error => {
        console.group(`[ERROR] has been ocurred`);
        console.error(error);
        console.groupEnd();
    });


const app = new Koa();
const router = new Router();


router.get('/about/:name?', context => {
    const { name } = context.params;
    context.body = name ? `${name}에 대하여`: `${name} 님은 우리 멤버가 아닙니다.`;
});
router.use('/api', api.routes());


app.use(bodyParser());
app.use(jwtMiddleware);
app.use(router.routes()).use(router.allowedMethods());


const buildDirectory = path.resolve(__dirname, '../../blog-frontend/build');
app.use(serve(buildDirectory));
app.use(async context => {
    if (context.status === 404 && context.path.indexOf('/api') !== 0) {
        await send(context, 'index.html', { root: buildDirectory, });
    }
});


const port = PORT || 4000;
app.listen(port, () => {
    console.log(`Listening to Port ${port}...`);
});