const { login } = require('../controller/user');
const { SuccessModel, ErrorModel } = require('../model/resModel');

const getCookieExpire = () => {
    const d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
    console.log('d.toGMTSring', d.toGMTString());
    return d.toGMTString();
}

const handleUserRouter = (req, res) => {
    const method = req.method;
    if (method === 'GET' && req.path === '/api/user/login') {
        const { username, password } = req.query;
        const result = login(username, password);
        return result.then(data => {
            if (data.username) {
                req.session.username = data.username;
                req.session.realname = data.realname;
                console.log('session', req.session);

                return new SuccessModel();
            }
            return new ErrorModel('登录失败');
        });
    }
    //登录验证的测试
    if (method == 'GET' && req.path === '/api/user/login-test') {
        if (req.session.username) {
            return Promise.resolve(new SuccessModel({
                session: req.session
            }));
        }

        return Promise.resolve(new ErrorModel('尚未登录'))
    }
}

module.exports = handleUserRouter;