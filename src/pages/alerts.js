import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
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
  Chip,
  TextField,
  MenuItem,
} from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import InventoryIcon from '@mui/icons-material/Inventory';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setError('');
      setLoading(true);
      try {
        const res = await fetch('/api/alerts');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load alerts');
        setAlerts(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = ['All', 'critical', 'low', 'adequate', 'overstocked'];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alerts.filter(a => {
      const byCategory = filterCategory === 'All' || a.category === filterCategory;
      const bySearch = !q || (a.productName || '').toLowerCase().includes(q) || (a.sku || '').toLowerCase().includes(q);
      return byCategory && bySearch;
    });
  }, [alerts, filterCategory, search]);

  async function updateStatus(id, workflowStatus, comment) {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, workflowStatus, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update status');
      setAlerts(prev => prev.map(a => (a.id === id ? data : a)));
    } catch (e) {
      setError(e.message || 'Failed to update status');
    }
  }

  function statusChip(status) {
    const map = {
      NEW: { label: 'New', color: 'error' },
      ACKNOWLEDGED: { label: 'Acknowledged', color: 'warning' },
      ORDERED: { label: 'Ordered', color: 'info' },
      RESOLVED: { label: 'Resolved', color: 'success' },
    };
    const cfg = map[status] || { label: status, color: 'default' };
    return <Chip label={cfg.label} color={cfg.color} size="small" />;
  }

  function categoryChip(category) {
    const map = {
      critical: { label: 'Critical', color: 'error' },
      low: { label: 'Low', color: 'warning' },
      adequate: { label: 'Adequate', color: 'success' },
      overstocked: { label: 'Overstocked', color: 'info' },
    };
    const cfg = map[category] || { label: category, color: 'default' };
    return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" />;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <NotificationImportantIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Inventory Alerts
          </Typography>
          <Link href="/" passHref>
            <Button color="inherit">Dashboard</Button>
          </Link>
          <Link href="/transfers" passHref>
            <Button color="inherit">Transfers</Button>
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
          <Link href="/alerts" passHref>
            <Button color="inherit" sx={{ borderBottom: '2px solid #ab47bc' }}>
              Alerts
            </Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <NotificationImportantIcon color="error" />
          <Typography variant="h4">Low stock alert & reorder</Typography>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" my={6}>
            <CircularProgress />
          </Box>
        )}
        {error && !loading && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {!loading && !error && (
          <>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Search products"
                size="small"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <TextField
                select
                label="Category"
                size="small"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                sx={{ minWidth: 160 }}
              >
                {categories.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Alerts table */}
            <Paper>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>SKU</strong></TableCell>
                    <TableCell><strong>Product</strong></TableCell>
                    <TableCell align="right"><strong>Total stock</strong></TableCell>
                    <TableCell align="right"><strong>Reorder point</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Recommendation</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                    <TableCell><strong>Updated</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{a.sku}</TableCell>
                      <TableCell>{a.productName}</TableCell>
                      <TableCell align="right">{a.totalStock}</TableCell>
                      <TableCell align="right">{a.reorderPoint}</TableCell>
                      <TableCell>{categoryChip(a.category)}</TableCell>
                      <TableCell>
                        {a.recommendedQty > 0
                          ? `Order ${a.recommendedQty} — ${a.note}`
                          : a.note}
                      </TableCell>
                      <TableCell>{statusChip(a.workflowStatus)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => updateStatus(a.id, 'ACKNOWLEDGED')}
                            disabled={a.workflowStatus !== 'NEW'}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => updateStatus(a.id, 'ORDERED')}
                            disabled={!(a.workflowStatus === 'ACKNOWLEDGED' || a.workflowStatus === 'NEW')}
                          >
                            Mark Ordered
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => updateStatus(a.id, 'RESOLVED')}
                          >
                            Resolve
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(a.updatedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Typography color="text.secondary">No alerts.</Typography>
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