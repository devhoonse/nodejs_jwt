
import jwt from 'jsonwebtoken';
import User from "../models/user";


// 요청받은 컨트롤러가 실행되기에 앞서 항상 실행되는 미들웨어
// 요청 쿠키의 'access_token' 에 JWT 토큰이 들어 있는지 확인하고
// 복호화된 JWT 토큰으로부터 user 식별자 정보를 가져옴
// 가져온 user 식별자 정보를 context.state.user 에 담아주고
// JWT 토큰을 재발행해서 쿠키의 'access_token' 에 만료 일자를 다시 늘려서 넣어줌
const jwtMiddleware = async (context, next) => {
    const token = context.cookies.get('access_token');
    if (!token) {
        return next();
    }

    try {
        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
        context.state.user = {
            _id: tokenDecoded._id,
            username: tokenDecoded.username,
        };

        const now = Math.floor(Date.now() / 1000);
        if (tokenDecoded.exp - now < 60 * 60 * 24 * 3.5) {
            const user = await User.findById(tokenDecoded._id);
            const newToken = user.generateToken();
            context.cookies.set('access_token', newToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
            });
            console.log('[INFO] newToken', newToken);
        }

        console.log(tokenDecoded);
        return next();
    } catch (error) {
        return next();
    }
};


export default jwtMiddleware;