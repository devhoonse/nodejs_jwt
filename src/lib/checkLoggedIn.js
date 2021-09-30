

const checkLoggedIn = (context, next) => {
    if (!context.state.user) {
        context.status = 401;
        return;
    }
    return next();
};


export default checkLoggedIn;