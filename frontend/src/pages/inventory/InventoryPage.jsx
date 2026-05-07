import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { exportInventoryCsv } from '../../services/exportService.js';
import {
  getInventorySummary,
  getItems,
  updateStock,
} from '../../services/inventoryService.js';

export default function InventoryPage() {
  const { user } = useAuth();
  const canManageInventory =
    user?.roles?.includes('Admin') || user?.roles?.includes('Inventory Manager');

  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    lowStockCount: 0,
    totalQuantity: 0,
  });
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItemId, setEditingItemId] = useState('');
  const [editForm, setEditForm] = useState({ quantity: '', threshold: '' });
  const [updatingId, setUpdatingId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const loadData = async () => {
        try {
          setIsLoading(true);
          setError('');
          const [itemsData, summaryData] = await Promise.all([
            getItems({
              search: search.trim() || undefined,
              lowStock: lowStockOnly ? 'true' : undefined,
            }),
            getInventorySummary(),
          ]);
          setItems(itemsData);
          setSummary(summaryData || { totalItems: 0, lowStockCount: 0, totalQuantity: 0 });
        } catch (requestError) {
          const message =
            requestError?.response?.data?.message || 'Unable to load inventory data.';
          setError(message);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, lowStockOnly]);

  const startEdit = (item) => {
    setEditingItemId(item._id);
    setEditForm({
      quantity: String(item.quantity ?? 0),
      threshold: String(item.threshold ?? 0),
    });
  };

  const handleUpdate = async (itemId) => {
    const quantity = Number(editForm.quantity);
    const threshold = Number(editForm.threshold);

    if (!Number.isFinite(quantity) || quantity < 0) {
      setError('Quantity must be a non-negative number.');
      return;
    }
    if (!Number.isFinite(threshold) || threshold < 0) {
      setError('Threshold must be a non-negative number.');
      return;
    }

    try {
      setUpdatingId(itemId);
      setError('');
      await updateStock(itemId, { quantity, threshold });
      const [itemsData, summaryData] = await Promise.all([
        getItems({
          search: search.trim() || undefined,
          lowStock: lowStockOnly ? 'true' : undefined,
        }),
        getInventorySummary(),
      ]);
      setItems(itemsData);
      setSummary(summaryData || { totalItems: 0, lowStockCount: 0, totalQuantity: 0 });
      setEditingItemId('');
      setEditForm({ quantity: '', threshold: '' });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to update stock item.';
      setError(message);
    } finally {
      setUpdatingId('');
    }
  };

  const stockStatusLabel = useMemo(
    () => ({
      true: { text: 'Low Stock', className: 'status-badge status-low-stock' },
      false: { text: 'In Stock', className: 'status-badge status-in-stock' },
    }),
    []
  );

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError('');
      await exportInventoryCsv();
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to export inventory CSV.';
      setError(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Inventory</h2>
          <p className="page-subtitle">
            Monitor stock levels, identify shortages, and maintain operational readiness.
          </p>
        </div>
        <div className="page-actions">
          {canManageInventory ? (
            <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          ) : null}
          {canManageInventory ? (
            <Link to="/inventory/add">
              <Button>Add Inventory Item</Button>
            </Link>
          ) : null}
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="kpi-grid inventory-kpi-grid">
        <Card className="kpi-card">
          <p className="kpi-label">Total Items</p>
          <h3 className="kpi-value">{summary.totalItems}</h3>
          <p className="kpi-change">Inventory records</p>
        </Card>
        <Card className="kpi-card">
          <p className="kpi-label">Low Stock Items</p>
          <h3 className="kpi-value">{summary.lowStockCount}</h3>
          <p className="kpi-change">Items below threshold</p>
        </Card>
        <Card className="kpi-card">
          <p className="kpi-label">Total Quantity</p>
          <h3 className="kpi-value">{summary.totalQuantity}</h3>
          <p className="kpi-change">Aggregate units on hand</p>
        </Card>
      </section>

      <Card className="filter-card">
        <div className="inventory-filter-grid">
          <Input
            id="inventory-search"
            name="inventory-search"
            label="Search item"
            placeholder="Search by item name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="form-field inventory-checkbox-field">
            <label className="form-label" htmlFor="inventory-low-stock-toggle">
              Show only low stock
            </label>
            <label className="inventory-checkbox">
              <input
                id="inventory-low-stock-toggle"
                type="checkbox"
                checked={lowStockOnly}
                onChange={(event) => setLowStockOnly(event.target.checked)}
              />
              <span>Low stock only</span>
            </label>
          </div>
        </div>
      </Card>

      <Card className="departments-card">
        {isLoading ? (
          <p className="muted-copy">Loading inventory items...</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No inventory items found</p>
            <p className="empty-subtitle">
              Add items or adjust filters to view available stock records.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>Supplier</th>
                  {canManageInventory ? <th className="actions-col">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td data-label="Item" className="cell-strong">
                      {item.itemName}
                    </td>
                    <td data-label="Quantity">{item.quantity}</td>
                    <td data-label="Threshold">{item.threshold}</td>
                    <td data-label="Status">
                      <span
                        className={stockStatusLabel[String(item.isLowStock)].className}
                      >
                        {stockStatusLabel[String(item.isLowStock)].text}
                      </span>
                    </td>
                    <td data-label="Supplier">
                      {item.supplierId?.name ? (
                        <span className="inventory-supplier">
                          {item.supplierId.name}
                          <small>{item.supplierId.email}</small>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    {canManageInventory ? (
                      <td data-label="Actions" className="actions-col">
                        {editingItemId === item._id ? (
                          <div className="inventory-inline-edit">
                            <input
                              className="input input-compact"
                              type="number"
                              min="0"
                              value={editForm.quantity}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  quantity: event.target.value,
                                }))
                              }
                              placeholder="Qty"
                            />
                            <input
                              className="input input-compact"
                              type="number"
                              min="0"
                              value={editForm.threshold}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  threshold: event.target.value,
                                }))
                              }
                              placeholder="Threshold"
                            />
                            <Button
                              className="btn-small"
                              onClick={() => handleUpdate(item._id)}
                              disabled={updatingId === item._id}
                            >
                              {updatingId === item._id ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              variant="secondary"
                              className="btn-small"
                              onClick={() => setEditingItemId('')}
                              disabled={updatingId === item._id}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="secondary"
                            className="btn-small"
                            onClick={() => startEdit(item)}
                          >
                            Update Stock
                          </Button>
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
