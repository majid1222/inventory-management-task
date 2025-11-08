// lib/data.js
import fs from 'fs/promises';
import path from 'path';

/**
 * Data layer with JSON persistence for:
 * - products.json
 * - warehouses.json
 * - stock.json
 * - transfers.json
 * - alerts.json
 *
 * Exposes helpers to:
 * - Load/save datasets
 * - Compute derived totals/metrics
 * - Perform validated stock transfers with history
 * - Generate and track alerts with workflow statuses
 */

const dataDir = path.join(process.cwd(), 'data');

const productsPath = path.join(dataDir, 'products.json');
const warehousesPath = path.join(dataDir, 'warehouses.json');
const stockPath = path.join(dataDir, 'stock.json');
const transfersPath = path.join(dataDir, 'transfers.json');
const alertsPath = path.join(dataDir, 'alerts.json');

// ---------- Generic file helpers ----------

async function ensureFile(filePath, fallback = '[]') {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, fallback, 'utf-8');
  }
}

async function readJson(filePath) {
  await ensureFile(filePath);
  const text = await fs.readFile(filePath, 'utf-8');
  // Fallback to [] if file is empty
  const data = text && text.trim().length ? JSON.parse(text) : [];
  return data;
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---------- Load/save datasets ----------

export async function getProducts() {
  return readJson(productsPath);
}
export async function saveProducts(products) {
  return writeJson(productsPath, Array.isArray(products) ? products : []);
}

export async function getWarehouses() {
  return readJson(warehousesPath);
}
export async function saveWarehouses(warehouses) {
  return writeJson(warehousesPath, Array.isArray(warehouses) ? warehouses : []);
}

export async function getStock() {
  return readJson(stockPath);
}
export async function saveStock(stock) {
  return writeJson(stockPath, Array.isArray(stock) ? stock : []);
}

export async function getTransfers() {
  return readJson(transfersPath);
}
export async function saveTransfers(transfers) {
  return writeJson(transfersPath, Array.isArray(transfers) ? transfers : []);
}

export async function getAlerts() {
  return readJson(alertsPath);
}
export async function saveAlerts(alerts) {
  return writeJson(alertsPath, Array.isArray(alerts) ? alerts : []);
}

/**
 * Convenience loader used by endpoints that need multiple datasets.
 */
export async function getAllData() {
  const [products, warehouses, stock, transfers, alerts] = await Promise.all([
    getProducts(),
    getWarehouses(),
    getStock(),
    getTransfers(),
    getAlerts(),
  ]);
  return { products, warehouses, stock, transfers, alerts };
}

// ---------- Derived metrics (Task 1 helpers) ----------

/**
 * Compute total stock for a product across all warehouses.
 */
export async function getTotalStockForProduct(productId) {
  const stock = await getStock();
  return stock
    .filter(s => Number(s.productId) === Number(productId))
    .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
}

/**
 * Compute stock totals per warehouse (for charts).
 */
export async function getWarehouseStockTotals() {
  const [warehouses, stock] = await Promise.all([getWarehouses(), getStock()]);
  return warehouses.map(wh => {
    const totalQty = stock
      .filter(s => Number(s.warehouseId) === Number(wh.id))
      .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
    return { warehouseId: wh.id, name: wh.name, stock: totalQty };
  });
}

/**
 * Compute total inventory value across all stock lines.
 * Requires unitCost in products.
 */
export async function getTotalInventoryValue() {
  const [products, stock] = await Promise.all([getProducts(), getStock()]);
  return stock.reduce((sum, line) => {
    const product = products.find(p => Number(p.id) === Number(line.productId));
    const unitCost = product ? Number(product.unitCost) : 0;
    const qty = Number(line.quantity) || 0;
    return sum + unitCost * qty;
  }, 0);
}

/**
 * Build inventory overview per product for the dashboard.
 * Returns: [{ id, sku, name, category, reorderPoint, totalQuantity, isLowStock }]
 */
export async function getInventoryOverview() {
  const [products, stock] = await Promise.all([getProducts(), getStock()]);
  return products.map(p => {
    const totalQuantity = stock
      .filter(s => Number(s.productId) === Number(p.id))
      .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
    return {
      ...p,
      totalQuantity,
      isLowStock: totalQuantity < Number(p.reorderPoint || 0),
    };
  });
}

// ---------- Stock transfer workflow (Task 2) ----------

/**
 * Validate and perform stock transfer between warehouses.
 * Input: { productId, fromWarehouseId, toWarehouseId, quantity }
 * Returns: { transfer, stock }
 */
export async function performStockTransfer({
  productId,
  fromWarehouseId,
  toWarehouseId,
  quantity,
}) {
  const [products, warehouses, stock, transfers] = await Promise.all([
    getProducts(),
    getWarehouses(),
    getStock(),
    getTransfers(),
  ]);

  const pid = Number(productId);
  const fromId = Number(fromWarehouseId);
  const toId = Number(toWarehouseId);
  const qty = Number(quantity);

  if (!Number.isFinite(pid)) throw new Error('Invalid productId');
  if (!Number.isFinite(fromId) || !Number.isFinite(toId)) throw new Error('Invalid warehouseId');
  if (fromId === toId) throw new Error('Source and destination warehouses must differ');
  if (!Number.isFinite(qty) || qty <= 0) throw new Error('Quantity must be a positive number');

  const product = products.find(p => Number(p.id) === pid);
  if (!product) throw new Error('Product not found');

  const fromWh = warehouses.find(w => Number(w.id) === fromId);
  const toWh = warehouses.find(w => Number(w.id) === toId);
  if (!fromWh) throw new Error('Source warehouse not found');
  if (!toWh) throw new Error('Destination warehouse not found');

  const source = stock.find(s => Number(s.productId) === pid && Number(s.warehouseId) === fromId);
  const dest = stock.find(s => Number(s.productId) === pid && Number(s.warehouseId) === toId);

  const sourceQty = source ? Number(source.quantity) : 0;
  if (sourceQty < qty) throw new Error('Insufficient stock in source warehouse');

  // Update source
  if (!source) {
    throw new Error('Source stock record not found');
  }
  source.quantity = sourceQty - qty;

  // Update destination (create if missing)
  if (dest) {
    dest.quantity = Number(dest.quantity) + qty;
  } else {
    stock.push({
      id: Date.now(), // basic unique id; swap with UUID in production
      productId: pid,
      warehouseId: toId,
      quantity: qty,
    });
  }

  // Persist stock changes first (integrity before history)
  await saveStock(stock);

  // Create and persist transfer record (prepend newest first)
  const seq = String((Array.isArray(transfers) ? transfers.length : 0) + 1).padStart(4, '0');
  const id = `T-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${seq}`;
  const transferRecord = {
    id,
    productId: pid,
    fromWarehouseId: fromId,
    toWarehouseId: toId,
    quantity: qty,
    createdAt: new Date().toISOString(),
    status: 'COMPLETED',
  };

  const updatedTransfers = Array.isArray(transfers) ? [transferRecord, ...transfers] : [transferRecord];
  await saveTransfers(updatedTransfers);

  return { transfer: transferRecord, stock };
}

// ---------- Alerts system (Task 3) ----------

/**
 * Categorize inventory relative to reorder point.
 * - critical: total < 0.5 * reorderPoint
 * - low: total < reorderPoint
 * - adequate: total >= reorderPoint and < 2 * reorderPoint
 * - overstocked: total >= 2 * reorderPoint
 */
export function categorizeStock(total, reorderPoint) {
  const rp = Number(reorderPoint) || 0;
  if (rp <= 0) return 'adequate';
  if (total < 0.5 * rp) return 'critical';
  if (total < rp) return 'low';
  if (total < 2 * rp) return 'adequate';
  return 'overstocked';
}

/**
 * Recommend reorder quantity based on category:
 * - critical → raise to ~1.5 × RP
 * - low → raise to RP
 * - adequate/overstocked → 0
 */
export function recommendReorder(total, reorderPoint) {
  const rp = Number(reorderPoint) || 0;
  if (rp <= 0) return { recommendedQty: 0, note: 'No reorder point set' };
  const category = categorizeStock(total, rp);
  if (category === 'critical') {
    const target = Math.ceil(1.5 * rp);
    return { recommendedQty: Math.max(0, target - total), note: `Raise to ~1.5× RP (${target})` };
  }
  if (category === 'low') {
    const target = rp;
    return { recommendedQty: Math.max(0, target - total), note: `Raise to RP (${target})` };
  }
  return { recommendedQty: 0, note: 'Adequate or overstocked — no action' };
}

/**
 * Generate or refresh alerts for all products.
 * - Creates alerts for 'critical' and 'low'
 * - Auto-resolves existing alerts if product becomes adequate/overstocked
 * Returns the alerts array after update.
 */
export async function generateAlerts() {
  const [products, stock, existingAlerts] = await Promise.all([
    getProducts(),
    getStock(),
    getAlerts(),
  ]);

  const now = new Date().toISOString();
  const alertByProduct = new Map((existingAlerts || []).map(a => [Number(a.productId), a]));
  const updated = [...(existingAlerts || [])];

  for (const p of products) {
    const pid = Number(p.id);
    const total = stock
      .filter(s => Number(s.productId) === pid)
      .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

    const category = categorizeStock(total, p.reorderPoint);
    const { recommendedQty, note } = recommendReorder(total, p.reorderPoint);

    const existing = alertByProduct.get(pid);

    if (category === 'critical' || category === 'low') {
      if (existing) {
        if (existing.workflowStatus !== 'RESOLVED') {
          existing.totalStock = total;
          existing.category = category;
          existing.recommendedQty = recommendedQty;
          existing.note = note;
          existing.updatedAt = now;
        }
      } else {
        const alert = {
          id: `A-${now}-${pid}`,
          productId: pid,
          sku: p.sku,
          productName: p.name,
          reorderPoint: Number(p.reorderPoint) || 0,
          totalStock: total,
          category, // 'critical' | 'low'
          recommendedQty,
          note,
          workflowStatus: 'NEW', // NEW | ACKNOWLEDGED | ORDERED | RESOLVED
          createdAt: now,
          updatedAt: now,
        };
        updated.unshift(alert);
        alertByProduct.set(pid, alert);
      }
    } else {
      // Adequate/overstocked → resolve existing non-resolved alerts
      if (existing && existing.workflowStatus !== 'RESOLVED') {
        existing.workflowStatus = 'RESOLVED';
        existing.updatedAt = now;
      }
    }
  }

  await saveAlerts(updated);
  return updated;
}

/**
 * Update alert workflow status with optional comment.
 * Valid statuses: NEW | ACKNOWLEDGED | ORDERED | RESOLVED
 */
export async function updateAlertStatus(id, workflowStatus, comment) {
  const alerts = await getAlerts();
  const alert = alerts.find(a => a.id === id);
  if (!alert) throw new Error('Alert not found');

  const valid = ['NEW', 'ACKNOWLEDGED', 'ORDERED', 'RESOLVED'];
  if (!valid.includes(workflowStatus)) throw new Error('Invalid workflow status');

  alert.workflowStatus = workflowStatus;
  alert.updatedAt = new Date().toISOString();
  if (comment) alert.comment = comment;

  await saveAlerts(alerts);
  return alert;
}
