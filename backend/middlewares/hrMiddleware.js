export const hrMiddleware = async (req, res, next) => {
    if (!req.employee.isHR) {
        return res.status(403).json({ error: 'Forbidden: HR access required' });
    }
    next();
};