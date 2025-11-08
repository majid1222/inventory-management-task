// pages/api/transfers/create.js
import { performStockTransfer } from '../../../../lib/data';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { productId, fromWarehouseId, toWarehouseId, quantity } = req.body || {};
    const { transfer } = await performStockTransfer({
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
    });

    res.status(201).json(transfer);
  } catch (err) {
    console.error('Transfer error:', err);
    // 400 for validation/business rule failures; 500 is used inside endpoint only for unexpected
    res.status(400).json({ error: err.message || 'Transfer failed' });
  }
}
