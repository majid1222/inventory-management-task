// pages/index.js
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  InputAdornment,
  TableContainer,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError('');
      setLoading(true);
      try {
        const [pRes, wRes, sRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/warehouses'),
          fetch('/api/stock'),
        ]);
        if (!pRes.ok || !wRes.ok || !sRes.ok) {
          throw new Error('Failed to load one or more resources');
        }
        const [p, w, s] = await Promise.all([pRes.json(), wRes.json(), sRes.json()]);
        if (mounted) {
          setProducts(Array.isArray(p) ? p : []);
          setWarehouses(Array.isArray(w) ? w : []);
          setStock(Array.isArray(s) ? s : []);
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load dashboard data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Derived metrics
  const totalInventoryValue = useMemo(() => {
    return stock.reduce((sum, item) => {
      const product = products.find(p => Number(p.id) === Number(item.productId));
      const unitCost = product ? Number(product.unitCost) : 0;
      const qty = Number(item.quantity) || 0;
      return sum + unitCost * qty;
    }, 0);
  }, [stock, products]);

  const inventoryOverview = useMemo(() => {
    return products.map(product => {
      const productStock = stock.filter(s => Number(s.productId) === Number(product.id));
      const totalQuantity = productStock.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      return {
        ...product,
        totalQuantity,
        isLowStock: totalQuantity < Number(product.reorderPoint || 0),
      };
    });
  }, [products, stock]);

  // Filters
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map(p => p.category)))],
    [products]
  );

  const filteredInventory = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inventoryOverview.filter(item => {
      const matchesQuery =
        !q ||
        (item.name || '').toLowerCase().includes(q) ||
        (item.sku || '').toLowerCase().includes(q);
      const matchesCategory = category === 'All' || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [inventoryOverview, query, category]);

  // Chart data
  const warehouseStock = useMemo(() => {
    return warehouses.map(wh => {
      const totalQty = stock
        .filter(s => Number(s.warehouseId) === Number(wh.id))
        .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      return { name: wh.name, stock: totalQty };
    });
  }, [warehouses, stock]);

  return (
    <>
      {/* Navigation */}
      <AppBar position="static">
        <Toolbar>
          <InventoryIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Inventory Management System
          </Typography>
          <Link href="/" passHref>
            <Button color="inherit" sx={{ borderBottom: '2px solid #ab47bc' }}>
              Dashboard
            </Button>
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
            <Button color="inherit">Transfers</Button>
          </Link>
          <Link href="/alerts" passHref>
            <Button color="inherit">Alerts</Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {/* Loading / Error */}
        {loading && (
          <Box display="flex" justifyContent="center" my={6}>
            <CircularProgress />
          </Box>
        )}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* KPI cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CategoryIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">Total Products</Typography>
                    </Box>
                    <Typography variant="h3">{products.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WarehouseIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">Warehouses</Typography>
                    </Box>
                    <Typography variant="h3">{warehouses.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <InventoryIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">Total Inventory Value</Typography>
                    </Box>
                    <Typography variant="h3">
                      ${Number.isFinite(totalInventoryValue) ? totalInventoryValue.toFixed(2) : '0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Chart */}
            <Typography variant="h5" gutterBottom>
              Stock per Warehouse
            </Typography>
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={warehouseStock}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="stock" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Search products"
                size="small"
                value={query}
                onChange={e => setQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                label="Category"
                size="small"
                value={category}
                onChange={e => setCategory(e.target.value)}
                sx={{ minWidth: 160 }}
              >
                {categories.map(c => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Inventory table */}
            <Typography variant="h5" gutterBottom>
              Inventory Overview
            </Typography>

            {/* Compact padding on small screens + horizontal scroll */}
            <Box
              sx={{
                '& .MuiTableCell-root': { py: { xs: 0.75, sm: 1 } },
              }}
            >
              <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>SKU</strong></TableCell>
                      <TableCell><strong>Product Name</strong></TableCell>
                      <TableCell><strong>Category</strong></TableCell>
                      <TableCell align="right"><strong>Total Stock</strong></TableCell>
                      <TableCell align="right"><strong>Reorder Point</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInventory.map(item => (
                      <TableRow
                        key={item.id}
                        sx={{ backgroundColor: item.isLowStock ? '#fff3e0' : 'inherit' }}
                      >
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.sku}</TableCell>
                        <TableCell sx={{ minWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.category}</TableCell>
                        <TableCell align="right">{item.totalQuantity}</TableCell>
                        <TableCell align="right">{item.reorderPoint}</TableCell>
                        <TableCell>
                          {item.isLowStock ? (
                            <Typography color="warning.main" fontWeight="bold">
                              Low Stock
                            </Typography>
                          ) : (
                            <Typography color="success.main">In Stock</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInventory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography color="text.secondary">
                            No matching products.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
