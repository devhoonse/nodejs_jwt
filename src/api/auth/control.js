
import Joi from "joi";
import User from "../../models/user";


// 회원 가입 : ID PW 검증이 통과되면 쿠키에 'access_token' 값으로 JWT 토큰을 담아서 응답
export const register = async context => {

    const schema = Joi.object().keys({
        username: Joi.string().alphanum().min(3).max(20).required(),
        password: Joi.string().required(),
    });

    const validation = schema.validate(context.request.body);
    if (validation.error) {
        context.status = 400;
        context.body = validation.error;
        return;
    }

    const { username, password } = context.request.body;
    try {
        const isExist = await User.findByUsername(username);
        if (isExist) {
            context.status = 409;   // conflict
            return;
        }

        const user = new User({
            username,
        });
        await user.setPassword(password);
        await user.save();

        context.body = user.serialize();

        const token = user.generateToken();
        context.cookies.set('access_token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
        });

    } catch (error) {
        context.throw(500, error);
    }
};

// 로그인 : ID PW 검증이 통과되면 쿠키에 'access_token' 값으로 JWT 토큰을 담아서 응답
export const login = async context => {

    const { username, password } = context.request.body;

    if (!username || !password) {
        context.status = 401;   // unauthorized
        return;
    }

    try {
        const user = await User.findByUsername(username);
        if (!user) {
            context.status = 401;
            return;
        }

        const passwordValidation = await user.checkPassword(password);
        if (!passwordValidation) {
            context.status = 401;
            return;
        }

        context.body = user.serialize();

        const token = user.generateToken();
        context.cookies.set('access_token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
        });

    } catch (error) {
        context.throw(500, error);
    }
};

// 토큰 유효성 검증을 위한 jwtMiddleware 미들웨어를 정상적으로 통과해서 왔다면
// context.state.user 에 값이 정상적으로 들어 있을 것임
// 이 값이 정상적으로 들어 있는지 검사하고
// 없으면 Unauthorized 401 에러를 방출
export const check = async context => {

    const { user } = context.state;
    if (!user) {
        context.state = 401;
        return;
    }

    context.body = user;

};

// 브라우저 쿠키의 'access_token' 값을 비움
export const logout = async context => {

    context.cookies.set('access_token');
    context.status = 204;

};
