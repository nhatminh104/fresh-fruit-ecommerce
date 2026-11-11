import Product from '../products/product.model.js';
import Inventory from './inventory.model.js';

export async function listInventory() {
  const [products, settings] = await Promise.all([
    Product.find().select('name stock unit isActive').sort({ stock: 1 }).lean(),
    Inventory.find().select('product lowStockAt quantity').lean()
  ]);
  const thresholds = new Map(settings.map((item) => [String(item.product), item.lowStockAt]));
  return products.map((product) => ({
    product,
    quantity: product.stock,
    lowStockAt: thresholds.get(String(product._id)) || 5
  }));
}
