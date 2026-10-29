export const productValidator = (req, res, next) => { if (!req.body?.name) return res.status(400).json({ success: false, message: 'Product name is required' }); next(); };
