
import Router from 'koa-router';
import * as authCtrl from './control';


const auth = new Router();
auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.get('/check', authCtrl.check);
auth.post('/logout', authCtrl.logout);


export default auth;
