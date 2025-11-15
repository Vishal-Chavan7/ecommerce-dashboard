import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const StockManagementLayer = () => {
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);

  // Filters
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSource, setFilterSource] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    variantId: '',
    type: 'in',
    quantity: '',
    source: 'manual',
    note: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchLogs();
  }, [selectedProduct, selectedVariant]);

  useEffect(() => {
    if (formData.productId) {
      fetchVariantsForProduct(formData.productId);
    } else {
      setVariants([]);
    }
  }, [formData.productId]);

  // Fetch all variants when edit modal opens (for showing variant dropdown)
  useEffect(() => {
    if (showEditModal && formData.productId) {
      fetchVariantsForProduct(formData.productId);
    }
  }, [showEditModal]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const fetchVariantsForProduct = async (productId) => {
    try {
      const response = await api.get(`/admin/variants?productId=${productId}`);
      setVariants(response.data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedProduct) params.productId = selectedProduct;
      if (selectedVariant) params.variantId = selectedVariant;

      const response = await api.get('/admin/stock-logs', { params });
      setLogs(response.data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load stock logs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLog = async (e) => {
    e.preventDefault();

    if (!formData.productId || !formData.quantity || formData.quantity <= 0) {
      toast.error('Please fill all required fields with valid data');
      return;
    }

    try {
      await api.post('/admin/stock-logs', {
        ...formData,
        quantity: parseInt(formData.quantity),
        variantId: formData.variantId || null,
      });
      toast.success('Stock log added successfully');
      setShowAddModal(false);
      setFormData({
        productId: '',
        variantId: '',
        type: 'in',
        quantity: '',
        source: 'manual',
        note: '',
      });
      fetchLogs();
    } catch (error) {
      console.error('Error adding log:', error);
      toast.error(error.response?.data?.message || 'Failed to add stock log');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/stock-logs/${deleteId}`);
      toast.success('Stock log deleted successfully');
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('Failed to delete stock log');
    }
  };

  const handleEdit = (log) => {
    setEditId(log._id);
    setFormData({
      productId: log.productId?._id || log.productId,
      variantId: log.variantId?._id || log.variantId || '',
      type: log.type,
      quantity: log.quantity,
      source: log.source,
      note: log.note || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.productId || !formData.quantity || formData.quantity <= 0) {
      toast.error('Please fill all required fields with valid data');
      return;
    }

    try {
      await api.put(`/admin/stock-logs/${editId}`, {
        ...formData,
        quantity: parseInt(formData.quantity),
        variantId: formData.variantId || null,
      });
      toast.success('Stock log updated successfully');
      setShowEditModal(false);
      setEditId(null);
      setFormData({
        productId: '',
        variantId: '',
        type: 'in',
        quantity: '',
        source: 'manual',
        note: '',
      });
      fetchLogs();
    } catch (error) {
      console.error('Error updating log:', error);
      toast.error(error.response?.data?.message || 'Failed to update stock log');
    }
  };

  const getProductName = (log) => {
    // If productId is populated (object), return title
    if (log.productId && typeof log.productId === 'object') {
      return log.productId.title || 'Unknown Product';
    }
    // Otherwise, look up in products array
    const product = products.find(p => p._id === log.productId);
    return product ? product.title : 'Unknown Product';
  };

  const getVariantSKU = (log) => {
    if (!log.variantId) return '-';
    // If variantId is populated (object), return sku
    if (typeof log.variantId === 'object') {
      return log.variantId.sku || 'N/A';
    }
    // Otherwise, look up in variants array
    const variant = variants.find(v => v._id === log.variantId);
    return variant ? variant.sku : 'N/A';
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === '' || log.type === filterType;
    const matchesSource = filterSource === '' || log.source === filterSource;
    return matchesType && matchesSource;
  });

  const calculateTotalStock = () => {
    return filteredLogs.reduce((total, log) => {
      return total + (log.type === 'in' ? log.quantity : -log.quantity);
    }, 0);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-3">Stock Management</h5>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <select
              className="form-select form-select-sm p-1 "
              style={{ minWidth: '150px', width: 'auto' }}
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setSelectedVariant('');
              }}
            >
              <option value="">All Products</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.title}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <select
                className="form-select form-select-sm  p-1"
                style={{ minWidth: '150px', width: 'auto' }}
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
              >
                <option value="">All Variants</option>
                {variants.map(variant => (
                  <option key={variant._id} value={variant._id}>
                    {variant.sku}
                  </option>
                ))}
              </select>
            )}
            <select
              className="form-select form-select-sm p-1"
              style={{ minWidth: '120px', width: 'auto' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
            <select
              className="form-select form-select-sm p-1"
              style={{ minWidth: '130px', width: 'auto' }}
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            >
              <option value="">All Sources</option>
              <option value="manual">Manual</option>
              <option value="order">Order</option>
              <option value="return">Return</option>
            </select>
          </div>
          <button
            className="btn btn-primary-600 d-flex align-items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <Icon icon="ic:baseline-plus" className="text-xl" />
            Add Stock Log
          </button>
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary-600" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-5">
            <Icon icon="solar:box-minimalistic-bold-duotone" className="text-64 text-primary-light mb-16" />
            <p className="text-secondary-light">No stock logs found</p>
          </div>
        ) : (
          <>
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <p className="text-sm text-secondary-light mb-0">
                <strong>Total Logs:</strong> {filteredLogs.length}
              </p>
              <p className="text-sm mb-0">
                <strong>Net Stock Change:</strong>{' '}
                <span className={`fw-bold ${calculateTotalStock() >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {calculateTotalStock() >= 0 ? '+' : ''}{calculateTotalStock()}
                </span>
              </p>
            </div>
            <div className="table-responsive">
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Variant SKU</th>
                    <th scope="col">Type</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Source</th>
                    <th scope="col">Note</th>
                    <th scope="col">Date</th>
                    <th scope="col" className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <span className="text-sm text-secondary-light">
                          {getProductName(log)}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-secondary-light">
                          {getVariantSKU(log)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-sm fw-semibold px-20 py-9 radius-4 ${log.type === 'in'
                          ? 'text-success-600 bg-success-100'
                          : 'text-danger-600 bg-danger-100'
                          }`}>
                          <Icon icon={log.type === 'in' ? 'ic:round-arrow-downward' : 'ic:round-arrow-upward'} className="me-1" />
                          {log.type === 'in' ? 'Stock In' : 'Stock Out'}
                        </span>
                      </td>
                      <td>
                        <span className={`text-sm fw-bold ${log.type === 'in' ? 'text-success-600' : 'text-danger-600'}`}>
                          {log.type === 'in' ? '+' : '-'}{log.quantity}
                        </span>
                      </td>
                      <td>
                        <span className="badge text-sm fw-semibold text-primary-600 bg-primary-100 px-20 py-9 radius-4">
                          {log.source}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-secondary-light">
                          {log.note || '-'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-secondary-light">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary-600 me-2"
                          onClick={() => handleEdit(log)}
                          title="Edit"
                        >
                          <Icon icon="lucide:edit" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger-600"
                          onClick={() => {
                            setDeleteId(log._id);
                            setShowDeleteModal(true);
                          }}
                          title="Delete"
                        >
                          <Icon icon="fluent:delete-24-regular" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Stock Log Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Stock Log</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      productId: '',
                      variantId: '',
                      type: 'in',
                      quantity: '',
                      source: 'manual',
                      note: '',
                    });
                  }}
                />
              </div>
              <form onSubmit={handleAddLog}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Product <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="productId"
                      value={formData.productId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.productId && variants.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Variant (Optional)</label>
                      <select
                        className="form-select"
                        name="variantId"
                        value={formData.variantId}
                        onChange={handleInputChange}
                      >
                        <option value="">No Variant (Base Product)</option>
                        {variants.map(variant => (
                          <option key={variant._id} value={variant._id}>
                            {variant.sku}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">
                      Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="in">Stock In (Add)</option>
                      <option value="out">Stock Out (Remove)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Quantity <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="Enter quantity"
                      min="1"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Source <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="manual">Manual Adjustment</option>
                      <option value="order">Order Fulfillment</option>
                      <option value="return">Product Return</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Note</label>
                    <textarea
                      className="form-control"
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Add optional note..."
                      rows="3"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary-600"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        productId: '',
                        variantId: '',
                        type: 'in',
                        quantity: '',
                        source: 'manual',
                        note: '',
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-600">
                    Add Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Stock Log Modal */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Stock Log</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditId(null);
                    setFormData({
                      productId: '',
                      variantId: '',
                      type: 'in',
                      quantity: '',
                      source: 'manual',
                      note: '',
                    });
                  }}
                />
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Product <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="productId"
                      value={formData.productId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.productId && variants.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Variant (Optional)</label>
                      <select
                        className="form-select"
                        name="variantId"
                        value={formData.variantId}
                        onChange={handleInputChange}
                      >
                        <option value="">No Variant (Base Product)</option>
                        {variants.map(variant => (
                          <option key={variant._id} value={variant._id}>
                            {variant.sku}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">
                      Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="in">Stock In (Add)</option>
                      <option value="out">Stock Out (Remove)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Quantity <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="Enter quantity"
                      min="1"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Source <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="manual">Manual Adjustment</option>
                      <option value="order">Order Fulfillment</option>
                      <option value="return">Product Return</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Note</label>
                    <textarea
                      className="form-control"
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Add optional note..."
                      rows="3"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary-600"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditId(null);
                      setFormData({
                        productId: '',
                        variantId: '',
                        type: 'in',
                        quantity: '',
                        source: 'manual',
                        note: '',
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-600">
                    Update Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this stock log? This action cannot be undone.</p>
                <div className="alert alert-warning d-flex align-items-center gap-2 mb-0">
                  <Icon icon="material-symbols:warning" className="text-warning-600 text-xl" />
                  <span className="text-sm">This will not restore the actual stock quantity.</span>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary-600"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger-600"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagementLayer;
