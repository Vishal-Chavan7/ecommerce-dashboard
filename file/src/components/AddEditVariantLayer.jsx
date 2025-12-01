import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const AddEditVariantLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [availableAttributes, setAvailableAttributes] = useState([]);

  const [formData, setFormData] = useState({
    productId: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    stock: '',
    barcode: '',
    status: true,
  });

  const [attributes, setAttributes] = useState([{ name: '', value: '', isManual: false }]);

  useEffect(() => {
    fetchProducts();
    fetchAttributes();
    if (isEditMode) {
      fetchVariant();
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const fetchAttributes = async () => {
    try {
      const response = await api.get('/admin/attributes');
      setAvailableAttributes(response.data || []);
    } catch (error) {
      console.error('Error fetching attributes:', error);
    }
  };

  const fetchVariant = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/variants/${id}`);
      const variant = response.data;

      setFormData({
        productId: variant.productId || '',
        sku: variant.sku || '',
        price: variant.price || '',
        compareAtPrice: variant.compareAtPrice || '',
        stock: variant.stock || '',
        barcode: variant.barcode || '',
        status: variant.status,
      });

      if (variant.attributes && variant.attributes.length > 0) {
        setAttributes(variant.attributes);
      }
    } catch (error) {
      console.error('Error fetching variant:', error);
      toast.error('Failed to load variant details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSkuChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, sku: value }));
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: '', value: '', isManual: false }]);
  };

  const handleAttributeNameSelect = (index, selectedName) => {
    const newAttributes = [...attributes];
    if (selectedName === 'manual') {
      newAttributes[index] = { name: '', value: '', isManual: true };
    } else {
      newAttributes[index] = { name: selectedName, value: '', isManual: false };
    }
    setAttributes(newAttributes);
  };

  const getAvailableValues = (attributeName) => {
    const attr = availableAttributes.find(a => a.name === attributeName);
    return attr?.values || [];
  };

  const handleRemoveAttribute = (index) => {
    if (attributes.length > 1) {
      const newAttributes = attributes.filter((_, i) => i !== index);
      setAttributes(newAttributes);
    } else {
      toast.warning('At least one attribute is required');
    }
  };

  const validateForm = () => {
    if (!formData.productId) {
      toast.error('Please select a product');
      return false;
    }
    if (!formData.sku.trim()) {
      toast.error('SKU is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return false;
    }
    if (formData.stock && parseFloat(formData.stock) < 0) {
      toast.error('Stock cannot be negative');
      return false;
    }

    // Validate attributes
    const validAttributes = attributes.filter(attr => attr.name.trim() && attr.value.trim());
    if (validAttributes.length === 0) {
      toast.error('At least one attribute with name and value is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Filter out empty attributes
      const validAttributes = attributes.filter(attr => attr.name.trim() && attr.value.trim());

      const payload = {
        ...formData,
        attributes: validAttributes,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        stock: formData.stock ? parseInt(formData.stock) : 0,
      };

      if (isEditMode) {
        await api.put(`/admin/variants/${id}`, payload);
        toast.success('Variant updated successfully');
      } else {
        await api.post('/admin/variants', payload);
        toast.success('Variant created successfully');
      }

      navigate('/variants-list');
    } catch (error) {
      console.error('Error saving variant:', error);
      const message = error.response?.data?.message || 'Failed to save variant';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary-600" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">{isEditMode ? 'Edit' : 'Add'} Product Variant</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row gy-3">
            {/* Product Selection */}
            <div className="col-12">
              <label className="form-label">Product <span className="text-danger">*</span></label>
              <select
                className="form-select"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                disabled={isEditMode}
                required
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.title}
                  </option>
                ))}
              </select>
              {isEditMode && (
                <small className="text-muted">Product cannot be changed after creation</small>
              )}
            </div>

            {/* SKU */}
            <div className="col-md-6">
              <label className="form-label">SKU <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="sku"
                value={formData.sku}
                onChange={handleSkuChange}
                placeholder="e.g., SAMS23-BLUE-128"
                required
              />
              <small className="text-muted">Unique identifier for this variant</small>
            </div>

            {/* Barcode */}
            <div className="col-md-6">
              <label className="form-label">Barcode</label>
              <input
                type="text"
                className="form-control"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                placeholder="e.g., 8991234567890"
              />
            </div>

            {/* Dynamic Attributes Section */}
            <div className="col-12">
              <label className="form-label d-flex align-items-center justify-content-between">
                <span>Attributes <span className="text-danger">*</span></span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary-600 d-flex align-items-center gap-1"
                  onClick={handleAddAttribute}
                >
                  <Icon icon="ic:baseline-plus" />
                  Add Attribute
                </button>
              </label>

              <div className="border rounded-3 p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {attributes.map((attr, index) => (
                  <div key={index} className="row g-2 mb-3">
                    <div className="col-5">
                      {attr.isManual ? (
                        <input
                          type="text"
                          className="form-control form-control-sm p-1"
                          placeholder="Name (e.g., Color)"
                          value={attr.name}
                          onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                        />
                      ) : (
                        <select
                          className="form-select form-select-sm p-1"
                          value={attr.name}
                          onChange={(e) => handleAttributeNameSelect(index, e.target.value)}
                        >
                          <option value="">Select Attribute</option>
                          {availableAttributes.map(availAttr => (
                            <option key={availAttr._id} value={availAttr.name}>
                              {availAttr.name}
                            </option>
                          ))}
                          <option value="manual">✏️ Manual Entry</option>
                        </select>
                      )}
                    </div>
                    <div className="col-5">
                      {attr.isManual || !attr.name ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Value (e.g., Blue)"
                          value={attr.value}
                          onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        />
                      ) : (
                        <select
                          className="form-select form-select-sm p-1"
                          value={attr.value}
                          onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        >
                          <option value="">Select Value</option>
                          {getAvailableValues(attr.name).map((val, i) => (
                            <option key={i} value={val.label}>
                              {val.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="col-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger-600 w-100"
                        onClick={() => handleRemoveAttribute(index)}
                        disabled={attributes.length === 1}
                      >
                        <Icon icon="fluent:delete-24-regular" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <small className="text-muted">
                Select from created attributes or choose "Manual Entry" to add custom attributes. Example: Color = Blue, Storage = 128GB
              </small>
            </div>

            {/* Price */}
            <div className="col-md-6">
              <label className="form-label">Price <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Compare At Price */}
            <div className="col-md-6">
              <label className="form-label">Compare At Price</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className="form-control"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <small className="text-muted">Original price before discount</small>
            </div>

            {/* Stock */}
            <div className="col-md-6">
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                className="form-control"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            {/* Status */}
            <div className="col-md-6">
              <label className="form-label d-block">Status</label>
              <div className="form-switch switch-primary d-flex align-items-center gap-3 mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                />
                <label className="form-check-label">
                  {formData.status ? 'Active' : 'Inactive'}
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="col-12">
              <div className="d-flex align-items-center gap-3">
                <button
                  type="submit"
                  className="btn btn-primary-600 px-20"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    <>{isEditMode ? 'Update' : 'Create'} Variant</>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary-600 px-20"
                  onClick={() => navigate('/variants-list')}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditVariantLayer;
