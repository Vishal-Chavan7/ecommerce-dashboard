import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const VariantsListLayer = () => {
  const navigate = useNavigate();
  const [variants, setVariants] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  // Filters
  const [selectedProduct, setSelectedProduct] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchVariants();
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedProduct) params.productId = selectedProduct;

      const response = await api.get('/admin/variants', { params });
      setVariants(response.data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast.error('Failed to load variants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await api.put(`/admin/variants/${id}`, { status: !currentStatus });
      toast.success('Status updated successfully');
      fetchVariants();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/variants/${deleteModal.id}`);
      toast.success('Variant deleted successfully');
      setDeleteModal({ show: false, id: null });
      fetchVariants();
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Failed to delete variant');
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.title : 'Unknown Product';
  };

  const filteredVariants = variants.filter(variant => {
    const matchesSearch = searchTerm === '' ||
      variant.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatAttributes = (attributes) => {
    if (!attributes || attributes.length === 0) return '-';
    return attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ');
  };

  return (
    <div className="card">
      <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="icon-field">
            <input
              type="text"
              className="form-control form-control-sm w-auto"
              placeholder="Search by SKU or Barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="icon">
              <Icon icon="ion:search-outline" />
            </span>
          </div>
          <select
            className="form-select form-select-sm w-auto"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">All Products</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.title}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary-600 btn-sm px-20 py-11 d-flex align-items-center gap-2"
          onClick={() => navigate('/add-variant')}
        >
          <Icon icon="ic:baseline-plus" className="text-xl" />
          Add Variant
        </button>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary-600" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredVariants.length === 0 ? (
          <div className="text-center py-5">
            <Icon icon="solar:inbox-line-bold-duotone" className="text-64 text-primary-light mb-16" />
            <p className="text-secondary-light">No variants found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">SKU</th>
                  <th scope="col">Attributes</th>
                  <th scope="col">Price</th>
                  <th scope="col">Compare Price</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Barcode</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVariants.map((variant) => (
                  <tr key={variant._id}>
                    <td>
                      <span className="text-sm text-secondary-light">
                        {getProductName(variant.productId)}
                      </span>
                    </td>
                    <td>
                      <span className="badge text-sm fw-semibold text-primary-600 bg-primary-100 px-20 py-9 radius-4">
                        {variant.sku}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-secondary-light">
                        {formatAttributes(variant.attributes)}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm fw-medium text-secondary-light">
                        ${variant.price?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td>
                      {variant.compareAtPrice ? (
                        <span className="text-sm text-secondary-light text-decoration-line-through">
                          ${variant.compareAtPrice.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm text-secondary-light">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge text-sm fw-semibold px-20 py-9 radius-4 ${variant.stock > 10
                          ? 'text-success-600 bg-success-100'
                          : variant.stock > 0
                            ? 'text-warning-600 bg-warning-100'
                            : 'text-danger-600 bg-danger-100'
                        }`}>
                        {variant.stock || 0}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-secondary-light">
                        {variant.barcode || '-'}
                      </span>
                    </td>
                    <td>
                      <div className="form-switch switch-primary d-flex align-items-center gap-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={variant.status}
                          onChange={() => handleStatusToggle(variant._id, variant.status)}
                        />
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center gap-2 justify-content-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary-600"
                          onClick={() => navigate(`/edit-variant/${variant._id}`)}
                          title="Edit"
                        >
                          <Icon icon="lucide:edit" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger-600"
                          onClick={() => setDeleteModal({ show: true, id: variant._id })}
                          title="Delete"
                        >
                          <Icon icon="fluent:delete-24-regular" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteModal({ show: false, id: null })}
                />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this variant? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary-600"
                  onClick={() => setDeleteModal({ show: false, id: null })}
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

export default VariantsListLayer;
