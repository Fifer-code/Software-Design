const jwt = require('jsonwebtoken');

const DEFAULT_SECRET = 'dev-only-secret-change-me';

const getJwtSecret = () => process.env.JWT_SECRET || DEFAULT_SECRET;

const extractBearerToken = (authorizationHeader = '') => {
    if (typeof authorizationHeader !== 'string') {
        return null;
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return null;
    }

    return token;
};

const authenticateToken = (req, res, next) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    try {
        const payload = jwt.verify(token, getJwtSecret());
        req.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role
        };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }

    next();
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    getJwtSecret
};