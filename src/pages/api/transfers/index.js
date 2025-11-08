// pages/api/transfers/index.js
import { getAllData } from '../../../../lib/data';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { transfers, products, warehouses } = await getAllData();

    const list = Array.isArray(transfers) ? transfers : [];
    const enriched = list.map(t => ({
      ...t,
      productName: products.find(p => Number(p.id) === Number(t.productId))?.name || String(t.productId),
      fromWarehouseName: warehouses.find(w => Number(w.id) === Number(t.fromWarehouseId))?.name || String(t.fromWarehouseId),
      toWarehouseName: warehouses.find(w => Number(w.id) === Number(t.toWarehouseId))?.name || String(t.toWarehouseId),
    }));

    res.status(200).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load transfers' });
  }
}
