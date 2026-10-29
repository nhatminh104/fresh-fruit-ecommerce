import Inventory from './inventory.model.js'; export const listInventory = () => Inventory.find().populate('product').lean();
