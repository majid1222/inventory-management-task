// pages/transfers.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CategoryIcon from '@mui/icons-material/Category';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

export default function TransfersPage() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transfers, setTransfers] = useState([]);

  const [productId, setProductId] = useState('');
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      setError('');
      setLoading(true);
      try {
        const [pRes, wRes, tRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/warehouses'),
          fetch('/api/transfers'),
        ]);

        const [p, w, t] = await Promise.all([
          pRes.ok ? pRes.json() : Promise.resolve([]),
          wRes.ok ? wRes.json() : Promise.resolve([]),
          tRes.ok ? tRes.json() : Promise.resolve([]),
        ]);

        setProducts(Array.isArray(p) ? p : []);
        setWarehouses(Array.isArray(w) ? w : []);
        setTransfers(Array.isArray(t) ? t : []);
      } catch (e) {
        console.error(e);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Client-side validation
    if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
      setError('All fields are required');
      return;
    }
    if (fromWarehouseId === toWarehouseId) {
      setError('Source and destination warehouses must differ');
      return;
    }
    const qtyNum = Number(quantity);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/transfers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: Number(productId),
          fromWarehouseId: Number(fromWarehouseId),
          toWarehouseId: Number(toWarehouseId),
          quantity: qtyNum,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Transfer failed');
      }

      setSuccessMsg(`Transfer ${data.id} completed`);
      setTransfers(prev => [data, ...prev]); // prepend new transfer
      setQuantity(''); // keep selections, reset qty
    } catch (err) {
      console.error(err);
      setError(err.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <InventoryIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory Management System
          </Typography>
          <Link href="/" passHref>
            <Button color="inherit">Dashboard</Button>
          </Link>
          <Link href="/products" passHref>
            <Button color="inherit">Products</Button>
          </Link>
          <Link href="/warehouses" passHref>
            <Button color="inherit">Warehouses</Button>
          </Link>
          <Link href="/stock" passHref>
            <Button color="inherit">Stock Levels</Button>
          </Link>
          <Link href="/transfers" passHref>
            <Button color="inherit" sx={{ borderBottom: '2px solid #ab47bc' }}>
              Transfers
            </Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Stock transfers
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Transfer form */}
            <Card sx={{ mb: 4 }}>
              <CardContent component="form" onSubmit={onSubmit}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    select
                    label="Product"
                    value={productId}
                    onChange={e => setProductId(e.target.value)}
                    size="small"
                    sx={{ minWidth: 260 }}
                  >
                    {products.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.sku} — {p.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="From warehouse"
                    value={fromWarehouseId}
                    onChange={e => setFromWarehouseId(e.target.value)}
                    size="small"
                    sx={{ minWidth: 220 }}
                  >
                    {warehouses.map(w => (
                      <MenuItem key={w.id} value={w.id}>
                        {w.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="To warehouse"
                    value={toWarehouseId}
                    onChange={e => setToWarehouseId(e.target.value)}
                    size="small"
                    sx={{ minWidth: 220 }}
                  >
                    {warehouses.map(w => (
                      <MenuItem key={w.id} value={w.id}>
                        {w.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Quantity"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    size="small"
                    sx={{ minWidth: 160 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SwapHorizIcon />
                        </InputAdornment>
                      ),
                      inputProps: { inputMode: 'numeric', pattern: '[0-9]*' },
                    }}
                  />
                </Box>

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {successMsg && <Alert severity="success" sx={{ mt: 2 }}>{successMsg}</Alert>}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Transferring...' : 'Submit transfer'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Transfer history */}
            <Typography variant="h5" gutterBottom>
              Transfer history
            </Typography>
            <Paper>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Product</strong></TableCell>
                    <TableCell><strong>From</strong></TableCell>
                    <TableCell><strong>To</strong></TableCell>
                    <TableCell align="right"><strong>Quantity</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Created at</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(Array.isArray(transfers) ? transfers : []).map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.productName || t.productId}</TableCell>
                      <TableCell>{t.fromWarehouseName || t.fromWarehouseId}</TableCell>
                      <TableCell>{t.toWarehouseName || t.toWarehouseId}</TableCell>
                      <TableCell align="right">{t.quantity}</TableCell>
                      <TableCell>{t.status}</TableCell>
                      <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {(!Array.isArray(transfers) || transfers.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography color="text.secondary">
                          No transfers yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </>
        )}
      </Container>
    </>
  );
}
