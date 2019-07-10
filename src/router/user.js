const { login } = require('../controller/user');
const { SuccessModel, ErrorModel } = require('../model/resModel');

const handleUserRouter = (req, res) => {
    const method = req.method;
    if (method === 'GET' && req.path === '/api/user/login') {
        const { username, password } = req.query;
        const result = login(username, password);
        return result.then(data => {
            if (data.username) {
                return new SuccessModel();
            }
            return new ErrorModel('登录失败');
        });
    }
    //登录验证的测试
    if (method == 'GET' && req.path === '/api/user/login-test') {
        if (req.cookie.username) {
            return Promise.resolve(new SuccessModel());
        }

        return Promise.resolve(new ErrorModel('尚未登录'))
    }
}

module.exports = handleUserRouter;