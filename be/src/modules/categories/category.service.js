import Category from './category.model.js'; export const listCategories = () => Category.find({ isActive: true }).sort({ name: 1 }).lean();
