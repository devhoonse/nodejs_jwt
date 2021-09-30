import Router from 'koa-router';
import auth from "./auth";


const api = new Router();


api.get('/test', context => {
    context.body = 'test successful!';
});
api.use('/auth', auth.routes());


export default api;