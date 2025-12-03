import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
};

const UnifiedProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [activeTab, setActiveTab] = useState('info');
    const [activeSection, setActiveSection] = useState('information');
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [availableAttributes, setAvailableAttributes] = useState([]);
    const [categorySearch, setCategorySearch] = useState('');

    // Product Info State
    const [productData, setProductData] = useState({
        title: '',
        slug: '',
        description: '',
        brandId: '',
        categoryIds: [],
        type: 'simple',
        sku: '',
        thumbnail: '',
        status: true,
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    // Variants State
    const [variants, setVariants] = useState([{
        sku: '',
        price: '',
        compareAtPrice: '',
        stock: '',
        barcode: '',
        image: null,
        imagePreview: '',
        attributes: [{ name: '', value: '', isManual: false }],
        status: true
    }]);

    // Gallery State
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // SEO State
    const [seoData, setSeoData] = useState({
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        seoSlug: '',
        canonicalUrl: ''
    });

    // Product Pricing State (for simple products)
    const [pricingData, setPricingData] = useState({
        basePrice: '',
        discountType: 'flat',
        discountValue: '',
        finalPrice: '',
        currency: 'INR',
        status: true
    });

    // Product Stock State (for simple products)
    const [stockData, setStockData] = useState({
        productId: '',
        variantId: '',
        type: 'in',
        quantity: '',
        source: 'manual',
        note: ''
    });

    // Variant Generation State
    const [selectedAttributes, setSelectedAttributes] = useState([]);
    const [showVariantGenerator, setShowVariantGenerator] = useState(false);
    const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
    const [expandedVariant, setExpandedVariant] = useState(null);

    // Product Attributes State (selected attributes to display)
    const [productAttributes, setProductAttributes] = useState([]);
    const [showAttributeModal, setShowAttributeModal] = useState(false);
    const [attributeValueSearches, setAttributeValueSearches] = useState({});
    const [selectedAttributeValues, setSelectedAttributeValues] = useState({});

    // Attribute Form State
    const [attributeLoading, setAttributeLoading] = useState(false);
    const [attributeFormData, setAttributeFormData] = useState({
        name: '',
        slug: '',
        type: 'select',
        isFilter: true,
        status: true
    });
    const [attributeValues, setAttributeValues] = useState([{ id: '', label: '' }]);

    useEffect(() => {
        fetchBrands();
        fetchCategories();
        fetchAttributes();
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchBrands = async () => {
        try {
            const response = await api.get('/admin/brands');
            setBrands(response.data.filter(b => b.status));
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to load brands');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories');
            setCategories(response.data.filter(c => c.status));
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
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

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/products/${id}`);
            const product = response.data;
            setProductData({
                title: product.title || '',
                slug: product.slug || '',
                description: product.description || '',
                brandId: product.brandId || '',
                categoryIds: product.categoryIds?.map(cat => cat._id) || [],
                type: product.type || 'simple',
                sku: product.sku || '',
                thumbnail: product.thumbnail || '',
                status: product.status,
                tags: product.tags || []
            });

            if (product.thumbnail) {
                setThumbnailPreview(getImageUrl(product.thumbnail));
            }

            // Fetch SEO data for this product
            try {
                const seoResponse = await api.get(`/admin/seo?productId=${id}`);
                if (seoResponse.data && seoResponse.data.length > 0) {
                    const seo = seoResponse.data[0];
                    setSeoData({
                        metaTitle: seo.metaTitle || '',
                        metaDescription: seo.metaDescription || '',
                        keywords: Array.isArray(seo.keywords) ? seo.keywords.join(', ') : '',
                        seoSlug: seo.slug || '',
                        canonicalUrl: seo.canonicalUrl || ''
                    });
                }
            } catch (seoError) {
                console.log('No SEO data found for this product');
            }

            // Fetch Pricing data for simple products
            if (product.type === 'simple') {
                try {
                    const pricingResponse = await api.get(`/admin/pricing?productId=${id}`);
                    if (pricingResponse.data && pricingResponse.data.length > 0) {
                        const pricing = pricingResponse.data[0];
                        setPricingData({
                            basePrice: pricing.basePrice || '',
                            discountType: pricing.discountType || 'flat',
                            discountValue: pricing.discountValue || '',
                            finalPrice: pricing.finalPrice || '',
                            currency: pricing.currency || 'INR',
                            status: pricing.status !== undefined ? pricing.status : true
                        });
                    }
                } catch (pricingError) {
                    console.log('No pricing data found for this product');
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product');
            navigate('/products-list');
        } finally {
            setLoading(false);
        }
    };

    // Product Info Handlers
    const handleProductChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCategoryToggle = (categoryId) => {
        setProductData(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId]
        }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !productData.tags.includes(tagInput.trim())) {
            setProductData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setProductData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // Attribute Form Handlers
    const handleAttributeNameChange = (e) => {
        setAttributeFormData({ ...attributeFormData, name: e.target.value });
    };

    const handleAttributeSlugChange = (e) => {
        const slug = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
        setAttributeFormData({ ...attributeFormData, slug });
    };

    const handleAddAttributeValue = () => {
        setAttributeValues([...attributeValues, { id: '', label: '' }]);
    };

    const handleRemoveAttributeValue = (index) => {
        if (attributeValues.length > 1) {
            setAttributeValues(attributeValues.filter((_, i) => i !== index));
        }
    };

    const handleAttributeValueChange = (index, field, value) => {
        const newValues = [...attributeValues];
        newValues[index][field] = value;
        if (field === 'label') {
            newValues[index].id = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        setAttributeValues(newValues);
    };

    const handleAttributeSubmit = async () => {
        if (!attributeFormData.name.trim()) {
            toast.error('Attribute name is required');
            return;
        }
        if (!attributeFormData.slug.trim()) {
            toast.error('Slug is required');
            return;
        }
        if ((attributeFormData.type === 'select' || attributeFormData.type === 'multiselect')) {
            const validValues = attributeValues.filter(v => v.label.trim() && v.id.trim());
            if (validValues.length === 0) {
                toast.error('At least one value is required for select/multiselect types');
                return;
            }
            const ids = validValues.map(v => v.id);
            if (new Set(ids).size !== ids.length) {
                toast.error('Value IDs must be unique');
                return;
            }
        }
        const validValues = attributeValues.filter(v => v.label.trim() && v.id.trim());
        const payload = {
            ...attributeFormData,
            values: (attributeFormData.type === 'select' || attributeFormData.type === 'multiselect') ? validValues : []
        };
        try {
            setAttributeLoading(true);
            await api.post('/admin/attributes', payload);
            toast.success('Attribute created successfully');
            // Reset form
            setAttributeFormData({
                name: '',
                slug: '',
                type: 'select',
                isFilter: true,
                status: true
            });
            setAttributeValues([{ id: '', label: '' }]);
            // Refresh attributes list
            fetchAttributes();
        } catch (error) {
            console.error('Error saving attribute:', error);
            toast.error(error.response?.data?.message || 'Failed to save attribute');
        } finally {
            setAttributeLoading(false);
        }
    };

    // Variant Handlers
    const handleAddVariant = () => {
        setVariants([...variants, {
            sku: '',
            price: '',
            compareAtPrice: '',
            stock: '',
            barcode: '',
            image: null,
            imagePreview: '',
            attributes: [{ name: '', value: '', isManual: false }],
            status: true
        }]);
    };

    const handleRemoveVariant = (index) => {
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index));
        } else {
            toast.warning('At least one variant is required');
        }
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const handleVariantImageChange = (index, file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newVariants = [...variants];
                newVariants[index].image = file;
                newVariants[index].imagePreview = reader.result;
                setVariants(newVariants);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveVariantImage = (index) => {
        const newVariants = [...variants];
        newVariants[index].image = null;
        newVariants[index].imagePreview = '';
        setVariants(newVariants);
    };

    const handleAddAttribute = (variantIndex) => {
        const newVariants = [...variants];
        newVariants[variantIndex].attributes.push({ name: '', value: '', isManual: false });
        setVariants(newVariants);
    };

    const handleRemoveAttribute = (variantIndex, attrIndex) => {
        const newVariants = [...variants];
        if (newVariants[variantIndex].attributes.length > 1) {
            newVariants[variantIndex].attributes = newVariants[variantIndex].attributes.filter((_, i) => i !== attrIndex);
            setVariants(newVariants);
        }
    };

    const handleAttributeChange = (variantIndex, attrIndex, field, value) => {
        const newVariants = [...variants];
        newVariants[variantIndex].attributes[attrIndex][field] = value;
        setVariants(newVariants);
    };

    const handleAttributeNameSelect = (variantIndex, attrIndex, selectedName) => {
        const newVariants = [...variants];
        if (selectedName === 'manual') {
            newVariants[variantIndex].attributes[attrIndex] = { name: '', value: '', isManual: true };
        } else {
            newVariants[variantIndex].attributes[attrIndex] = { name: selectedName, value: '', isManual: false };
        }
        setVariants(newVariants);
    };

    const getAvailableValues = (attributeName) => {
        const attr = availableAttributes.find(a => a.name === attributeName);
        return attr?.values || [];
    };

    // Gallery Handlers
    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        setGalleryImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGalleryPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveGalleryImage = (index) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // SEO Handlers
    const handleSeoChange = (e) => {
        const { name, value } = e.target;
        setSeoData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSeoSlugChange = (e) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
        setSeoData(prev => ({
            ...prev,
            seoSlug: value
        }));
    };

    // Pricing Handlers
    const handlePricingChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPricingData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Auto-calculate final price when base price or discount changes
            if (name === 'basePrice' || name === 'discountType' || name === 'discountValue') {
                const basePrice = parseFloat(name === 'basePrice' ? value : updated.basePrice) || 0;
                const discountValue = parseFloat(name === 'discountValue' ? value : updated.discountValue) || 0;
                const discountType = name === 'discountType' ? value : updated.discountType;

                let finalPrice = basePrice;
                if (discountValue > 0) {
                    if (discountType === 'percent') {
                        finalPrice = basePrice - (basePrice * discountValue / 100);
                    } else {
                        finalPrice = basePrice - discountValue;
                    }
                }
                updated.finalPrice = Math.max(0, finalPrice).toFixed(2);
            }

            return updated;
        });
    };

    // Stock Handlers
    const handleStockChange = (e) => {
        const { name, value } = e.target;
        setStockData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Variant Generation Functions
    const cartesianProduct = (arrays) => {
        if (arrays.length === 0) return [[]];

        const [first, ...rest] = arrays;
        const restProduct = cartesianProduct(rest);

        const result = [];
        for (const item of first) {
            for (const combo of restProduct) {
                result.push([item, ...combo]);
            }
        }

        return result;
    };

    const handleAttributeSelection = (attributeId, attributeName) => {
        const isSelected = selectedAttributes.some(attr => attr.attributeId === attributeId);
        const attribute = availableAttributes.find(a => a._id === attributeId);

        if (isSelected) {
            // Deselect attribute
            setSelectedAttributes(prev => prev.filter(attr => attr.attributeId !== attributeId));
        } else {
            // Select attribute with all its values automatically
            const allValues = attribute?.values?.map(v => ({ id: v.id, label: v.label })) || [];
            setSelectedAttributes(prev => [...prev, {
                attributeId,
                name: attributeName,
                selectedValues: allValues
            }]);
        }
    };

    const generateVariantsFromAttributes = () => {
        if (selectedAttributes.length === 0) {
            toast.warning('Please select at least one attribute');
            return;
        }

        const hasEmptyValues = selectedAttributes.some(attr => attr.selectedValues.length === 0);
        if (hasEmptyValues) {
            toast.warning('Please select values for all selected attributes');
            return;
        }

        const attrArrays = selectedAttributes.map(attr =>
            attr.selectedValues.map(val => ({
                name: attr.name,
                value: val.label
            }))
        );

        const cartesianProduct = (arr) => {
            return arr.reduce((acc, curr) => {
                return acc.flatMap(x => curr.map(y => [...x, y]));
            }, [[]]);
        };

        const combinations = cartesianProduct(attrArrays);

        const newVariants = combinations.map(combo => ({
            sku: '',
            price: '',
            compareAtPrice: '',
            stock: '',
            barcode: '',
            image: null,
            imagePreview: '',
            attributes: combo,
            status: true
        }));

        setVariants(newVariants);
        setShowVariantGenerator(false);
        toast.success(`Generated ${newVariants.length} variants!`);
    };

    const handleAttributeValueSelection = (attributeId, valueId, valueLabel) => {
        setSelectedAttributes(prev => prev.map(attr => {
            if (attr.attributeId === attributeId) {
                const isValueSelected = attr.selectedValues.some(v => v.id === valueId);

                if (isValueSelected) {
                    return {
                        ...attr,
                        selectedValues: attr.selectedValues.filter(v => v.id !== valueId)
                    };
                } else {
                    return {
                        ...attr,
                        selectedValues: [...attr.selectedValues, { id: valueId, label: valueLabel }]
                    };
                }
            }
            return attr;
        }));
    };

    const clearGeneratedVariants = () => {
        setVariants([{
            sku: '',
            price: '',
            compareAtPrice: '',
            stock: '',
            barcode: '',
            image: null,
            imagePreview: '',
            attributes: [{ name: '', value: '', isManual: false }],
            status: true
        }]);
        setSelectedAttributes([]);
        toast.info('Variants cleared');
    };

    // Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!productData.title.trim()) {
            toast.error('Product title is required');
            setActiveTab('info');
            return;
        }

        if (!productData.slug.trim()) {
            toast.error('Product slug is required');
            setActiveTab('info');
            return;
        }

        if (!productData.brandId) {
            toast.error('Please select a brand');
            setActiveTab('info');
            return;
        }

        if (productData.categoryIds.length === 0) {
            toast.error('Please select at least one category');
            setActiveTab('info');
            return;
        }

        if (!productData.sku.trim()) {
            toast.error('Product SKU is required');
            setActiveTab('info');
            return;
        }

        // Validate pricing for simple products
        if (productData.type === 'simple') {
            if (!pricingData.basePrice || parseFloat(pricingData.basePrice) <= 0) {
                toast.error('Base price is required for simple products');
                return;
            }
        }

        setLoading(true);

        try {
            // Step 1: Create/Update Product
            const productFormData = new FormData();
            productFormData.append('title', productData.title);
            productFormData.append('slug', productData.slug);
            productFormData.append('description', productData.description);
            productFormData.append('brandId', productData.brandId);
            productFormData.append('categoryIds', JSON.stringify(productData.categoryIds));
            productFormData.append('type', productData.type);
            productFormData.append('sku', productData.sku);
            productFormData.append('status', productData.status);

            console.log('Tags before stringify:', productData.tags);
            console.log('Tags length:', productData.tags.length);
            productFormData.append('tags', JSON.stringify(productData.tags));
            console.log('Tags after stringify:', JSON.stringify(productData.tags));

            if (thumbnailFile) {
                productFormData.append('thumbnail', thumbnailFile);
            }

            let productId;
            if (isEditMode) {
                await api.put(`/admin/products/${id}`, productFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                productId = id;
                console.log('Product updated, ID:', productId);
            } else {
                const productResponse = await api.post('/admin/products', productFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                productId = productResponse.data._id;
                console.log('Product created, ID:', productId);
            }

            // Step 2: Create/Update Variants (for both new and edited products)
            if (variants.length > 0 && variants[0].sku.trim()) {
                console.log('Creating/Updating variants, total:', variants.length);
                for (const variant of variants) {
                    console.log('Processing variant:', variant.sku, 'Has image:', !!variant.image, 'Has ID:', !!variant._id);
                    if (variant.sku.trim()) {
                        // Check if variant has an ID (existing variant to update)
                        const isExistingVariant = variant._id && isEditMode;

                        // Use FormData if variant has an image
                        if (variant.image && typeof variant.image !== 'string') {
                            const variantFormData = new FormData();
                            variantFormData.append('productId', productId);
                            variantFormData.append('sku', variant.sku);
                            variantFormData.append('price', variant.price || 0);
                            variantFormData.append('compareAtPrice', variant.compareAtPrice || 0);
                            variantFormData.append('barcode', variant.barcode || '');
                            variantFormData.append('stock', variant.stock || 0);
                            variantFormData.append('attributes', JSON.stringify(variant.attributes.filter(attr => attr.name && attr.value)));
                            variantFormData.append('status', variant.status);
                            variantFormData.append('image', variant.image);

                            console.log('Sending variant with FormData:', {
                                method: isExistingVariant ? 'PUT' : 'POST',
                                productId,
                                sku: variant.sku,
                                price: variant.price || 0,
                                stock: variant.stock || 0,
                                attributes: variant.attributes.filter(attr => attr.name && attr.value)
                            });

                            if (isExistingVariant) {
                                const variantResponse = await api.put(`/admin/variants/${variant._id}`, variantFormData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                console.log('Variant updated response:', variantResponse.data);
                            } else {
                                const variantResponse = await api.post('/admin/variants', variantFormData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                console.log('Variant created response:', variantResponse.data);
                            }
                        } else {
                            // Use JSON if no new image
                            const variantData = {
                                productId: productId,
                                sku: variant.sku,
                                price: variant.price || 0,
                                compareAtPrice: variant.compareAtPrice || 0,
                                stock: variant.stock || 0,
                                barcode: variant.barcode || '',
                                attributes: variant.attributes.filter(attr => attr.name && attr.value),
                                status: variant.status
                            };

                            console.log('Sending variant with JSON:', {
                                method: isExistingVariant ? 'PUT' : 'POST',
                                ...variantData
                            });

                            if (isExistingVariant) {
                                const variantResponse = await api.put(`/admin/variants/${variant._id}`, variantData);
                                console.log('Variant updated response:', variantResponse.data);
                            } else {
                                const variantResponse = await api.post('/admin/variants', variantData);
                                console.log('Variant created response:', variantResponse.data);
                            }
                        }

                        // Step 3: Create initial stock log for each variant (only for new variants)
                        if (!isExistingVariant && variant.stock && parseFloat(variant.stock) > 0) {
                            // Note: You'll need to get the created variant ID to create stock log
                            // This is a simplified version - you may need to adjust based on your backend
                        }
                    }
                }
                console.log('Variants created/updated successfully');
            }

            // Step 4: Upload Gallery Images
            if (!isEditMode && galleryImages.length > 0) {
                for (const image of galleryImages) {
                    const galleryFormData = new FormData();
                    galleryFormData.append('image', image);
                    galleryFormData.append('altText', productData.title);

                    await api.post(`/admin/gallery/product/${productId}`, galleryFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
                console.log('Gallery images uploaded successfully');
            }

            // Step 5: Save SEO Data
            if (seoData.metaTitle || seoData.metaDescription || seoData.seoSlug || seoData.keywords || seoData.canonicalUrl) {
                try {
                    const keywordsArray = seoData.keywords ? seoData.keywords.split(',').map(k => k.trim()).filter(k => k) : [];

                    // Use seoSlug if provided, otherwise fallback to product slug
                    const seoSlug = seoData.seoSlug || productData.slug;

                    if (!seoSlug) {
                        toast.warning('SEO slug is required. Using product slug as fallback.');
                    }

                    const seoPayload = {
                        productId: productId,
                        metaTitle: seoData.metaTitle || productData.title,
                        metaDescription: seoData.metaDescription,
                        keywords: keywordsArray,
                        slug: seoSlug,
                        canonicalUrl: seoData.canonicalUrl
                    };

                    if (isEditMode) {
                        // Check if SEO data exists for this product
                        const existingSeo = await api.get(`/admin/seo?productId=${productId}`);
                        if (existingSeo.data && existingSeo.data.length > 0) {
                            // Update existing SEO
                            await api.put(`/admin/seo/${existingSeo.data[0]._id}`, seoPayload);
                        } else {
                            // Create new SEO
                            await api.post('/admin/seo', seoPayload);
                        }
                    } else {
                        // Create new SEO for new product
                        await api.post('/admin/seo', seoPayload);
                    }
                    toast.success('SEO data saved successfully');
                } catch (seoError) {
                    console.error('Error saving SEO data:', seoError);
                    toast.error(seoError.response?.data?.message || 'Failed to save SEO data');
                }
            }

            // Step 6: Save Product Pricing (only for simple products)
            if (productData.type === 'simple' && pricingData.basePrice && parseFloat(pricingData.basePrice) > 0) {
                try {
                    const pricingPayload = {
                        productId: productId,
                        variantId: null, // Simple products don't have variants
                        basePrice: parseFloat(pricingData.basePrice),
                        discountType: pricingData.discountType,
                        discountValue: parseFloat(pricingData.discountValue) || 0,
                        finalPrice: parseFloat(pricingData.finalPrice),
                        currency: pricingData.currency,
                        status: pricingData.status
                    };

                    if (isEditMode) {
                        // Check if pricing exists for this product
                        const existingPricing = await api.get(`/admin/pricing?productId=${productId}`);
                        if (existingPricing.data && existingPricing.data.length > 0) {
                            // Update existing pricing
                            await api.put(`/admin/pricing/${existingPricing.data[0]._id}`, pricingPayload);
                        } else {
                            // Create new pricing
                            await api.post('/admin/pricing', pricingPayload);
                        }
                    } else {
                        // Create new pricing for new product
                        await api.post('/admin/pricing', pricingPayload);
                    }
                    toast.success('Product pricing saved successfully');
                } catch (pricingError) {
                    console.error('Error saving product pricing:', pricingError);
                    toast.error(pricingError.response?.data?.message || 'Failed to save product pricing');
                }
            }

            // Step 7: Create Initial Stock Log (only for simple products during creation)
            if (!isEditMode && productData.type === 'simple' && stockData.quantity && parseInt(stockData.quantity) > 0) {
                try {
                    console.log('Creating stock log with data:', {
                        productId: productId,
                        variantId: null,
                        type: stockData.type,
                        quantity: parseInt(stockData.quantity),
                        source: stockData.source,
                        note: stockData.note || 'Initial stock added during product creation'
                    });

                    const stockResponse = await api.post('/admin/stock-logs', {
                        productId: productId,
                        variantId: null,
                        type: stockData.type,
                        quantity: parseInt(stockData.quantity),
                        source: stockData.source,
                        note: stockData.note || 'Initial stock added during product creation'
                    });

                    console.log('Stock log created successfully:', stockResponse.data);
                    toast.success('Initial stock added successfully');
                } catch (stockError) {
                    console.error('Error adding initial stock:', stockError);
                    console.error('Error details:', stockError.response?.data);
                    toast.error(stockError.response?.data?.message || 'Failed to add initial stock');
                    // Don't stop the flow, but log the error
                }
            }

            // Show success message and navigate after a brief delay
            toast.success(`Product ${isEditMode ? 'updated' : 'created'} successfully!`);
            setTimeout(() => {
                navigate('/products-list');
            }, 1500);
        } catch (error) {
            console.error('Error saving product:', error);
            const errorMessage = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`;
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'info', label: 'Product Information', icon: 'mdi:information-outline' },
        { id: 'variants', label: 'Variants', icon: 'carbon:data-structured' },
        { id: 'gallery', label: 'Gallery', icon: 'solar:gallery-bold-duotone' },
        { id: 'stock', label: 'Stock Info', icon: 'mdi:package-variant-closed' }
    ];

    return (
        <div className="row gy-4">
            <div className="col-12">
                <div className="d-flex gap-3">
                    {/* Vertical Sidebar */}
                    <div className="bg-white rounded" style={{ width: '250px', minHeight: '100vh', position: 'sticky', top: '20px', alignSelf: 'flex-start' }}>
                        <div className="p-3 border-bottom">
                            <h6 className="mb-0 text-primary-600">Product Menu</h6>
                        </div>
                        <nav className="nav flex-column p-2">
                            <button
                                type="button"
                                className={`nav-link text-start d-flex align-items-center gap-2 rounded mb-1 ${activeSection === 'information' ? 'bg-primary-100 text-primary-600' : 'text-secondary-light'}`}
                                onClick={() => setActiveSection('information')}
                                style={{ border: 'none', background: activeSection === 'information' ? '' : 'transparent' }}
                            >
                                <Icon icon="mdi:information-outline" className="text-20" />
                                <span>General</span>
                            </button>
                            <button
                                type="button"
                                className={`nav-link text-start d-flex align-items-center gap-2 rounded mb-1 ${activeSection === 'attributes' ? 'bg-primary-100 text-primary-600' : 'text-secondary-light'}`}
                                onClick={() => setActiveSection('attributes')}
                                style={{ border: 'none', background: activeSection === 'attributes' ? '' : 'transparent' }}
                            >
                                <Icon icon="mdi:tag-multiple-outline" className="text-20" />
                                <span>Attributes</span>
                            </button>
                            <button
                                type="button"
                                className={`nav-link text-start d-flex align-items-center gap-2 rounded mb-1 ${activeSection === 'variants' ? 'bg-primary-100 text-primary-600' : 'text-secondary-light'}`}
                                onClick={() => setActiveSection('variants')}
                                style={{ border: 'none', background: activeSection === 'variants' ? '' : 'transparent' }}
                            >
                                <Icon icon="mdi:palette-outline" className="text-20" />
                                <span>Variants</span>
                            </button>
                            <button
                                type="button"
                                className={`nav-link text-start d-flex align-items-center gap-2 rounded mb-1 ${activeSection === 'pricing' ? 'bg-primary-100 text-primary-600' : 'text-secondary-light'}`}
                                onClick={() => setActiveSection('pricing')}
                                style={{ border: 'none', background: activeSection === 'pricing' ? '' : 'transparent' }}
                            >
                                <Icon icon="mdi:currency-usd" className="text-20" />
                                <span>Pricing</span>
                            </button>
                            <button
                                type="button"
                                className={`nav-link text-start d-flex align-items-center gap-2 rounded mb-1 ${activeSection === 'stock' ? 'bg-primary-100 text-primary-600' : 'text-secondary-light'}`}
                                onClick={() => setActiveSection('stock')}
                                style={{ border: 'none', background: activeSection === 'stock' ? '' : 'transparent' }}
                            >
                                <Icon icon="mdi:package-variant" className="text-20" />
                                <span>Stock</span>
                            </button>
                            <button
                                type="button"
                                className={`nav-link text-start d-flex align-items-center gap-2 rounded mb-1 ${activeSection === 'gallery' ? 'bg-primary-100 text-primary-600' : 'text-secondary-light'}`}
                                onClick={() => setActiveSection('gallery')}
                                style={{ border: 'none', background: activeSection === 'gallery' ? '' : 'transparent' }}
                            >
                                <Icon icon="mdi:image-multiple-outline" className="text-20" />
                                <span>Gallery</span>
                            </button>
                            <button
                                type="button"
                                className={`nav-link text-start d-flex align-items-center gap-2 rounded mb-1 ${activeSection === 'seo' ? 'bg-primary-100 text-primary-600' : 'text-secondary-light'}`}
                                onClick={() => setActiveSection('seo')}
                                style={{ border: 'none', background: activeSection === 'seo' ? '' : 'transparent' }}
                            >
                                <Icon icon="mdi:search-web" className="text-20" />
                                <span>SEO</span>
                            </button>
                            <button
                                type="button"
                                className={`nav-link text-start d-flex align-items-center gap-2 rounded mb-1 ${activeSection === 'summary' ? 'bg-primary-100 text-primary-600' : 'text-secondary-light'}`}
                                onClick={() => setActiveSection('summary')}
                                style={{ border: 'none', background: activeSection === 'summary' ? '' : 'transparent' }}
                            >
                                <Icon icon="mdi:chart-box-outline" className="text-20" />
                                <span>Summary</span>
                            </button>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div style={{ flex: 1 }}>
                        <form onSubmit={handleSubmit}>
                            {/* Product Information Section */}
                            {activeSection === 'information' && (
                                <div className="card mb-4">
                                    <div className="card-header d-flex align-items-center gap-2">
                                        <Icon icon="mdi:information-outline" className="text-24" />
                                        <h5 className="card-title mb-0">Product Information</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Product Title <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    value={productData.title}
                                                    onChange={handleProductChange}
                                                    placeholder="Enter product title"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Slug <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="slug"
                                                    value={productData.slug}
                                                    onChange={handleProductChange}
                                                    placeholder="product-slug"
                                                    required
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    name="description"
                                                    value={productData.description}
                                                    onChange={handleProductChange}
                                                    rows="4"
                                                    placeholder="Enter product description"
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Brand <span className="text-danger">*</span></label>
                                                <select
                                                    className="form-select"
                                                    name="brandId"
                                                    value={productData.brandId}
                                                    onChange={handleProductChange}
                                                    required
                                                >
                                                    <option value="">Select Brand</option>
                                                    {brands.map(brand => (
                                                        <option key={brand._id} value={brand._id}>{brand.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Product Type</label>
                                                <select
                                                    className="form-select"
                                                    name="type"
                                                    value={productData.type}
                                                    onChange={handleProductChange}
                                                >
                                                    <option value="simple">Simple</option>
                                                    <option value="variable">Variable</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">SKU <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="sku"
                                                    value={productData.sku}
                                                    onChange={handleProductChange}
                                                    placeholder="Enter SKU"
                                                    required
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label fw-semibold mb-3 d-flex align-items-center gap-2">
                                                    <Icon icon="mdi:folder-multiple-outline" style={{ fontSize: '18px' }} />
                                                    <span>Categories <span className="text-danger">*</span></span>
                                                </label>

                                                {/* Search input with improved design */}
                                                <div className="position-relative mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-lg ps-5"
                                                        placeholder="Search categories by name..."
                                                        value={categorySearch}
                                                        onChange={(e) => setCategorySearch(e.target.value)}
                                                        style={{
                                                            borderRadius: '10px',
                                                            border: '2px solid #e0e0e0',
                                                            transition: 'all 0.3s'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                                                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                                    />
                                                    <Icon
                                                        icon="mdi:magnify"
                                                        className="position-absolute text-muted"
                                                        style={{
                                                            left: '15px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            fontSize: '20px',
                                                            pointerEvents: 'none'
                                                        }}
                                                    />
                                                    {categorySearch && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-link position-absolute text-muted"
                                                            style={{
                                                                right: '10px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                padding: '0',
                                                                textDecoration: 'none'
                                                            }}
                                                            onClick={() => setCategorySearch('')}
                                                        >
                                                            <Icon icon="mdi:close-circle" style={{ fontSize: '20px' }} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Selected categories badges with improved design */}
                                                {productData.categoryIds.length > 0 && (
                                                    <div className="mb-3 p-3 bg-light rounded">
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <small className="text-muted fw-semibold">
                                                                <Icon icon="mdi:check-circle" className="me-1" />
                                                                Selected ({productData.categoryIds.length})
                                                            </small>
                                                            <button
                                                                type="button"
                                                                className="btn btn-link btn-sm text-danger p-0"
                                                                onClick={() => {
                                                                    setProductData(prev => ({
                                                                        ...prev,
                                                                        categoryIds: []
                                                                    }));
                                                                }}
                                                                style={{ textDecoration: 'none' }}
                                                            >
                                                                <Icon icon="mdi:delete-outline" className="me-1" />
                                                                Clear All
                                                            </button>
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {productData.categoryIds.map(catId => {
                                                                const category = categories.find(c => c._id === catId);
                                                                return category ? (
                                                                    <span
                                                                        key={catId}
                                                                        className="badge d-inline-flex align-items-center gap-2 py-2 px-3"
                                                                        style={{
                                                                            backgroundColor: '#0d6efd',
                                                                            borderRadius: '20px',
                                                                            fontSize: '13px',
                                                                            fontWeight: '500'
                                                                        }}
                                                                    >
                                                                        {category.name}
                                                                        <Icon
                                                                            icon="mdi:close-circle"
                                                                            style={{ cursor: 'pointer', fontSize: '16px' }}
                                                                            onClick={() => handleCategoryToggle(catId)}
                                                                        />
                                                                    </span>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Filterable category list with improved design */}
                                                <div
                                                    className="border rounded-3 p-3 bg-white"
                                                    style={{
                                                        maxHeight: '250px',
                                                        overflowY: 'auto',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                                    }}
                                                >
                                                    {categories
                                                        .filter(category =>
                                                            category.name.toLowerCase().includes(categorySearch.toLowerCase())
                                                        )
                                                        .map(category => (
                                                            <div
                                                                key={category._id}
                                                                className="form-check d-flex align-items-center p-2 rounded hover-bg-light mb-1"
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    transition: 'background-color 0.2s'
                                                                }}
                                                                onClick={() => handleCategoryToggle(category._id)}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id={`category-${category._id}`}
                                                                    checked={productData.categoryIds.includes(category._id)}
                                                                    onChange={() => { }}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                                <label
                                                                    className="form-check-label ms-2 flex-grow-1"
                                                                    htmlFor={`category-${category._id}`}
                                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                                >
                                                                    {category.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    {categories.filter(category =>
                                                        category.name.toLowerCase().includes(categorySearch.toLowerCase())
                                                    ).length === 0 && (
                                                            <div className="text-center py-4">
                                                                <Icon icon="mdi:folder-search-outline" className="text-muted mb-2" style={{ fontSize: '48px' }} />
                                                                <div className="text-muted">
                                                                    <strong>No categories found</strong>
                                                                    <p className="mb-0 small">Try adjusting your search terms</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Product Thumbnail</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    onChange={handleThumbnailChange}
                                                />
                                                {thumbnailPreview && (
                                                    <div className="mt-2">
                                                        <img src={thumbnailPreview} alt="Thumbnail Preview" style={{ width: '150px', height: '150px', objectFit: 'cover' }} className="rounded" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Tags</label>
                                                <div className="input-group mb-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                                        placeholder="Add tag and press Enter"
                                                    />
                                                    <button className="btn btn-primary" type="button" onClick={handleAddTag}>
                                                        <Icon icon="ic:baseline-plus" />
                                                    </button>
                                                </div>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {productData.tags.map((tag, index) => (
                                                        <span key={index} className="badge bg-primary-100 text-primary-600 d-flex align-items-center gap-1">
                                                            {tag}
                                                            <Icon icon="mdi:close" style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)} />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Status</label>
                                                <div className="form-switch switch-primary d-flex align-items-center gap-3">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        name="status"
                                                        checked={productData.status}
                                                        onChange={handleProductChange}
                                                    />
                                                    <label className="form-check-label text-secondary-light">
                                                        {productData.status ? 'Active' : 'Inactive'}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Product Attributes Section */}
                            {activeSection === 'attributes' && (
                                <div className='card'>
                                    <div className='card-header d-flex align-items-center justify-content-between'>
                                        <div className='d-flex align-items-center gap-2'>
                                            <Icon icon="mdi:tag-multiple-outline" className="text-24" />
                                            <h5 className='card-title mb-0'>Product Attributes</h5>
                                        </div>
                                        <button
                                            type='button'
                                            className='btn btn-sm btn-success d-flex align-items-center gap-2'
                                            onClick={() => setShowAttributeModal(true)}
                                        >
                                            <Icon icon='mdi:plus' />
                                            Create Attribute
                                        </button>
                                    </div>
                                    <div className='card-body'>
                                        {/* Attribute Creation Modal/Form */}
                                        {showAttributeModal && (
                                            <div className='mb-4 p-4 border rounded bg-light'>
                                                <div className='d-flex justify-content-between align-items-center mb-3'>
                                                    <h6 className='mb-0'>Create New Attribute</h6>
                                                    <button
                                                        type='button'
                                                        className='btn btn-sm btn-outline-secondary'
                                                        onClick={() => setShowAttributeModal(false)}
                                                    >
                                                        <Icon icon='mdi:close' />
                                                    </button>
                                                </div>

                                                <div className='row g-3 mb-3'>
                                                    <div className='col-md-6'>
                                                        <label className='form-label'>Attribute Name <span className='text-danger'>*</span></label>
                                                        <input
                                                            type='text'
                                                            className='form-control'
                                                            value={attributeFormData.name}
                                                            onChange={handleAttributeNameChange}
                                                            placeholder='e.g., Color, Size, Material'
                                                        />
                                                    </div>
                                                    <div className='col-md-6'>
                                                        <label className='form-label'>Slug <span className='text-danger'>*</span></label>
                                                        <input
                                                            type='text'
                                                            className='form-control'
                                                            value={attributeFormData.slug}
                                                            onChange={handleAttributeSlugChange}
                                                            placeholder='e.g., color, size'
                                                        />
                                                        <small className='text-muted'>Auto-generated from name</small>
                                                    </div>
                                                </div>

                                                {/* Attribute Values */}
                                                <div className='mb-3'>
                                                    <div className='d-flex justify-content-between align-items-center mb-2'>
                                                        <label className='form-label mb-0'>Attribute Values</label>
                                                        <button
                                                            type='button'
                                                            className='btn btn-sm btn-outline-primary'
                                                            onClick={handleAddAttributeValue}
                                                        >
                                                            <Icon icon='mdi:plus' className='me-1' />
                                                            Add Value
                                                        </button>
                                                    </div>
                                                    {attributeValues.map((value, index) => (
                                                        <div key={index} className='row g-2 mb-2'>
                                                            <div className='col-10'>
                                                                <input
                                                                    type='text'
                                                                    className='form-control'
                                                                    value={value.label}
                                                                    onChange={(e) => handleAttributeValueChange(index, 'label', e.target.value)}
                                                                    placeholder='e.g., Red, Large, Cotton'
                                                                />
                                                            </div>
                                                            <div className='col-2'>
                                                                <button
                                                                    type='button'
                                                                    className='btn btn-outline-danger w-100'
                                                                    onClick={() => handleRemoveAttributeValue(index)}
                                                                    disabled={attributeValues.length === 1}
                                                                >
                                                                    <Icon icon='mdi:delete' />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className='d-flex gap-2 justify-content-end'>
                                                    <button
                                                        type='button'
                                                        className='btn btn-secondary'
                                                        onClick={() => {
                                                            setShowAttributeModal(false);
                                                            setAttributeFormData({
                                                                name: '',
                                                                slug: '',
                                                                type: 'select',
                                                                isFilter: true,
                                                                status: true
                                                            });
                                                            setAttributeValues([{ id: '', label: '' }]);
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className='btn btn-success d-flex align-items-center gap-2'
                                                        onClick={async () => {
                                                            await handleAttributeSubmit();
                                                            setShowAttributeModal(false);
                                                        }}
                                                        disabled={attributeLoading}
                                                    >
                                                        {attributeLoading ? (
                                                            <>
                                                                <div className='spinner-border spinner-border-sm' role='status'>
                                                                    <span className='visually-hidden'>Loading...</span>
                                                                </div>
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Icon icon='mdi:content-save' />
                                                                Create Attribute
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Attribute Selector */}
                                        <div className='mb-4'>
                                            <label className='form-label'>Select Attributes</label>
                                            <select
                                                className='form-select'
                                                onChange={(e) => {
                                                    const attrId = e.target.value;
                                                    if (attrId && !productAttributes.find(a => a._id === attrId)) {
                                                        const attr = availableAttributes.find(a => a._id === attrId);
                                                        if (attr) {
                                                            setProductAttributes([...productAttributes, attr]);
                                                        }
                                                    }
                                                    e.target.value = '';
                                                }}
                                                value=''
                                            >
                                                <option value=''>Choose an attribute...</option>
                                                {availableAttributes.map(attr => (
                                                    <option
                                                        key={attr._id}
                                                        value={attr._id}
                                                        disabled={productAttributes.some(pa => pa._id === attr._id)}
                                                    >
                                                        {attr.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <small className='text-muted'>Select attributes from the dropdown to add them to this product</small>
                                        </div>

                                        {/* Display Selected Attributes */}
                                        {productAttributes.length > 0 && (
                                            <div className='mb-4'>
                                                <div className='d-flex align-items-center justify-content-between mb-4'>
                                                    <h6 className='mb-0 d-flex align-items-center gap-2'>
                                                        <Icon icon='mdi:checkbox-multiple-marked' className='text-primary' style={{ fontSize: '20px' }} />
                                                        Selected Attributes & Values
                                                    </h6>
                                                    <span className='badge bg-primary-subtle text-primary px-3 py-2'>
                                                        {productAttributes.length} Attribute{productAttributes.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <div className='d-flex flex-column gap-4'>
                                                    {productAttributes.map((attr) => (
                                                        <div
                                                            key={attr._id}
                                                            className='card border-0 shadow-sm'
                                                            style={{
                                                                borderRadius: '12px',
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            <div
                                                                className='card-header d-flex justify-content-between align-items-center py-3 px-4'
                                                                style={{
                                                                    backgroundColor: '#f8f9fa',
                                                                    borderBottom: '2px solid #e9ecef'
                                                                }}
                                                            >
                                                                <div className='d-flex align-items-center gap-3'>
                                                                    <div
                                                                        className='d-flex align-items-center justify-content-center'
                                                                        style={{
                                                                            width: '36px',
                                                                            height: '36px',
                                                                            backgroundColor: '#0d6efd',
                                                                            borderRadius: '8px'
                                                                        }}
                                                                    >
                                                                        <Icon icon='mdi:tag-outline' className='text-white' style={{ fontSize: '20px' }} />
                                                                    </div>
                                                                    <div>
                                                                        <h6 className='mb-0 fw-semibold'>{attr.name}</h6>
                                                                        <small className='text-muted'>
                                                                            {selectedAttributeValues[attr._id]?.length || 0} value{selectedAttributeValues[attr._id]?.length !== 1 ? 's' : ''} selected
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type='button'
                                                                    className='btn btn-sm btn-outline-danger d-flex align-items-center gap-2'
                                                                    onClick={() => {
                                                                        setProductAttributes(productAttributes.filter(a => a._id !== attr._id));
                                                                        const newSearches = { ...attributeValueSearches };
                                                                        delete newSearches[attr._id];
                                                                        setAttributeValueSearches(newSearches);
                                                                        const newSelected = { ...selectedAttributeValues };
                                                                        delete newSelected[attr._id];
                                                                        setSelectedAttributeValues(newSelected);
                                                                    }}
                                                                    style={{ borderRadius: '8px' }}
                                                                >
                                                                    <Icon icon='mdi:delete-outline' />
                                                                    Remove
                                                                </button>
                                                            </div>
                                                            <div className='card-body p-4'>
                                                                {/* Search input for values */}
                                                                <div className='position-relative mb-4'>
                                                                    <input
                                                                        type='text'
                                                                        className='form-control form-control-lg ps-5 pe-5'
                                                                        placeholder={`Search ${attr.name} values...`}
                                                                        value={attributeValueSearches[attr._id] || ''}
                                                                        onChange={(e) => {
                                                                            setAttributeValueSearches({
                                                                                ...attributeValueSearches,
                                                                                [attr._id]: e.target.value
                                                                            });
                                                                        }}
                                                                        style={{
                                                                            borderRadius: '10px',
                                                                            border: '2px solid #e0e0e0',
                                                                            transition: 'all 0.3s'
                                                                        }}
                                                                        onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                                                                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                                                    />
                                                                    <Icon
                                                                        icon='mdi:magnify'
                                                                        className='position-absolute text-muted'
                                                                        style={{
                                                                            left: '16px',
                                                                            top: '50%',
                                                                            transform: 'translateY(-50%)',
                                                                            fontSize: '20px',
                                                                            pointerEvents: 'none'
                                                                        }}
                                                                    />
                                                                    {attributeValueSearches[attr._id] && (
                                                                        <button
                                                                            type='button'
                                                                            className='btn btn-link position-absolute'
                                                                            style={{
                                                                                right: '10px',
                                                                                top: '50%',
                                                                                transform: 'translateY(-50%)',
                                                                                padding: '0',
                                                                                textDecoration: 'none'
                                                                            }}
                                                                            onClick={() => {
                                                                                const newSearches = { ...attributeValueSearches };
                                                                                delete newSearches[attr._id];
                                                                                setAttributeValueSearches(newSearches);
                                                                            }}
                                                                        >
                                                                            <Icon icon='mdi:close-circle' className='text-muted' style={{ fontSize: '20px' }} />
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Filtered values */}
                                                                <div
                                                                    className='rounded-3'
                                                                    style={{
                                                                        maxHeight: '280px',
                                                                        overflowY: 'auto',
                                                                        backgroundColor: '#f8f9fa',
                                                                        border: '1px solid #e9ecef'
                                                                    }}
                                                                >
                                                                    {/* Selected values summary */}
                                                                    {selectedAttributeValues[attr._id]?.length > 0 && (
                                                                        <div className='p-3 bg-white border-bottom'>
                                                                            <div className='d-flex align-items-center justify-content-between mb-3'>
                                                                                <small className='text-muted fw-semibold d-flex align-items-center gap-2'>
                                                                                    <Icon icon='mdi:check-circle' className='text-success' style={{ fontSize: '18px' }} />
                                                                                    Selected ({selectedAttributeValues[attr._id].length})
                                                                                </small>
                                                                                <button
                                                                                    type='button'
                                                                                    className='btn btn-link btn-sm text-danger p-0 d-flex align-items-center gap-1'
                                                                                    onClick={() => {
                                                                                        const newSelected = { ...selectedAttributeValues };
                                                                                        newSelected[attr._id] = [];
                                                                                        setSelectedAttributeValues(newSelected);
                                                                                    }}
                                                                                    style={{ textDecoration: 'none', fontSize: '13px' }}
                                                                                >
                                                                                    <Icon icon='mdi:close-circle-outline' style={{ fontSize: '16px' }} />
                                                                                    Clear All
                                                                                </button>
                                                                            </div>
                                                                            <div className='d-flex flex-wrap gap-2'>
                                                                                {selectedAttributeValues[attr._id].map((val, idx) => (
                                                                                    <span
                                                                                        key={idx}
                                                                                        className='badge d-inline-flex align-items-center gap-2 py-2 px-3'
                                                                                        style={{
                                                                                            backgroundColor: '#198754',
                                                                                            borderRadius: '20px',
                                                                                            fontSize: '13px',
                                                                                            fontWeight: '500',
                                                                                            transition: 'all 0.2s'
                                                                                        }}
                                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#146c43'}
                                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#198754'}
                                                                                    >
                                                                                        {val.label}
                                                                                        <Icon
                                                                                            icon='mdi:close-circle'
                                                                                            style={{ cursor: 'pointer', fontSize: '16px' }}
                                                                                            onClick={() => {
                                                                                                const newSelected = { ...selectedAttributeValues };
                                                                                                newSelected[attr._id] = newSelected[attr._id].filter(
                                                                                                    v => v.id !== val.id
                                                                                                );
                                                                                                setSelectedAttributeValues(newSelected);
                                                                                            }}
                                                                                        />
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Selectable values list */}
                                                                    <div className='p-3'>
                                                                        {attr.values &&
                                                                            attr.values
                                                                                .filter(val =>
                                                                                    val.label
                                                                                        .toLowerCase()
                                                                                        .includes(
                                                                                            (attributeValueSearches[attr._id] || '').toLowerCase()
                                                                                        )
                                                                                )
                                                                                .map((val, idx) => {
                                                                                    const isSelected = selectedAttributeValues[attr._id]?.some(
                                                                                        v => v.id === val.id
                                                                                    );
                                                                                    return (
                                                                                        <div
                                                                                            key={idx}
                                                                                            className='form-check p-3 mb-2 rounded-3'
                                                                                            style={{
                                                                                                cursor: 'pointer',
                                                                                                transition: 'all 0.2s',
                                                                                                border: isSelected ? '2px solid #198754' : '2px solid transparent',
                                                                                                backgroundColor: isSelected ? '#d1e7dd' : 'white'
                                                                                            }}
                                                                                            onClick={() => {
                                                                                                const newSelected = { ...selectedAttributeValues };
                                                                                                if (!newSelected[attr._id]) {
                                                                                                    newSelected[attr._id] = [];
                                                                                                }
                                                                                                if (isSelected) {
                                                                                                    newSelected[attr._id] = newSelected[
                                                                                                        attr._id
                                                                                                    ].filter(v => v.id !== val.id);
                                                                                                } else {
                                                                                                    newSelected[attr._id] = [
                                                                                                        ...newSelected[attr._id],
                                                                                                        val
                                                                                                    ];
                                                                                                }
                                                                                                setSelectedAttributeValues(newSelected);
                                                                                            }}
                                                                                            onMouseEnter={e => {
                                                                                                if (!isSelected) {
                                                                                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                                                                    e.currentTarget.style.borderColor = '#dee2e6';
                                                                                                }
                                                                                            }}
                                                                                            onMouseLeave={e => {
                                                                                                if (!isSelected) {
                                                                                                    e.currentTarget.style.backgroundColor = 'white';
                                                                                                    e.currentTarget.style.borderColor = 'transparent';
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <div className='d-flex align-items-center'>
                                                                                                <input
                                                                                                    className='form-check-input'
                                                                                                    type='checkbox'
                                                                                                    checked={isSelected}
                                                                                                    onChange={() => { }}
                                                                                                    style={{
                                                                                                        cursor: 'pointer',
                                                                                                        width: '20px',
                                                                                                        height: '20px'
                                                                                                    }}
                                                                                                />
                                                                                                <label
                                                                                                    className='form-check-label ms-3 fw-medium'
                                                                                                    style={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px' }}
                                                                                                >
                                                                                                    {val.label}
                                                                                                </label>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                        {attr.values &&
                                                                            attr.values.filter(val =>
                                                                                val.label
                                                                                    .toLowerCase()
                                                                                    .includes(
                                                                                        (attributeValueSearches[attr._id] || '').toLowerCase()
                                                                                    )
                                                                            ).length === 0 && (
                                                                                <div className='text-center py-5 text-muted'>
                                                                                    <Icon
                                                                                        icon='mdi:filter-off-outline'
                                                                                        style={{ fontSize: '48px', opacity: 0.5 }}
                                                                                    />
                                                                                    <div className='mt-3 fw-medium'>No values found</div>
                                                                                    <small>Try adjusting your search</small>
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Generate Variants Button */}
                                        {productAttributes.length > 0 && (
                                            <div className='d-flex justify-content-end'>
                                                <button
                                                    type='button'
                                                    className='btn btn-primary d-flex align-items-center gap-2'
                                                    onClick={async () => {
                                                        // Check if all attributes have selected values
                                                        const hasAllValues = productAttributes.every(
                                                            attr => selectedAttributeValues[attr._id]?.length > 0
                                                        );

                                                        if (!hasAllValues) {
                                                            toast.warning('Please select values for all attributes');
                                                            return;
                                                        }

                                                        // Select all attributes with their selected values
                                                        const selectedAttrs = productAttributes.map(attr => ({
                                                            attributeId: attr._id,
                                                            name: attr.name,
                                                            selectedValues: selectedAttributeValues[attr._id] || []
                                                        }));
                                                        setSelectedAttributes(selectedAttrs);

                                                        // Generate variants using cartesian product
                                                        const attrArrays = selectedAttrs.map(attr =>
                                                            attr.selectedValues.map(val => ({
                                                                name: attr.name,
                                                                value: val.label
                                                            }))
                                                        );

                                                        const cartesianProduct = (arr) => {
                                                            return arr.reduce((acc, curr) => {
                                                                return acc.flatMap(x => curr.map(y => [...x, y]));
                                                            }, [[]]);
                                                        };

                                                        const combinations = cartesianProduct(attrArrays);
                                                        const newVariants = combinations.map(combo => ({
                                                            sku: '',
                                                            price: '',
                                                            compareAtPrice: '',
                                                            stock: '',
                                                            barcode: '',
                                                            image: null,
                                                            imagePreview: '',
                                                            attributes: combo,
                                                            status: true
                                                        }));

                                                        setVariants(newVariants);
                                                        toast.success(`${newVariants.length} variants generated!`);

                                                        // Redirect to variants section
                                                        setActiveSection('variants');
                                                    }}
                                                >
                                                    <Icon icon='mdi:auto-fix' />
                                                    Generate Variants (
                                                    {productAttributes.reduce(
                                                        (total, attr) => total * (selectedAttributeValues[attr._id]?.length || 0),
                                                        productAttributes.length > 0 ? 1 : 0
                                                    )}{' '}
                                                    combinations)
                                                </button>
                                            </div>
                                        )}

                                        {productAttributes.length === 0 && (
                                            <div className='alert alert-info'>
                                                <Icon icon='mdi:information-outline' className='me-2' />
                                                No attributes selected. Choose attributes from the dropdown above to generate variants.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}


                            {/* Product Pricing Section - Only for Simple Products */}
                            {activeSection === 'pricing' && productData.type === 'simple' && (
                                <div className="card mb-4">
                                    <div className="card-header d-flex align-items-center gap-2">
                                        <Icon icon="solar:dollar-minimalistic-bold-duotone" className="text-24" />
                                        <h5 className="card-title mb-0">Product Pricing</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Base Price <span className="text-danger">*</span></label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="basePrice"
                                                    value={pricingData.basePrice}
                                                    onChange={handlePricingChange}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                                <small className="text-muted">Regular selling price</small>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Currency</label>
                                                <select
                                                    className="form-select"
                                                    name="currency"
                                                    value={pricingData.currency}
                                                    onChange={handlePricingChange}
                                                >
                                                    <option value="INR">INR (₹)</option>
                                                    <option value="USD">USD ($)</option>
                                                    <option value="EUR">EUR (€)</option>
                                                    <option value="GBP">GBP (£)</option>
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Discount Type</label>
                                                <select
                                                    className="form-select"
                                                    name="discountType"
                                                    value={pricingData.discountType}
                                                    onChange={handlePricingChange}
                                                >
                                                    <option value="flat">Flat Amount</option>
                                                    <option value="percent">Percentage</option>
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Discount Value</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="discountValue"
                                                    value={pricingData.discountValue}
                                                    onChange={handlePricingChange}
                                                    placeholder="0"
                                                    step="0.01"
                                                    min="0"
                                                />
                                                <small className="text-muted">
                                                    {pricingData.discountType === 'percent' ? 'Percentage discount (%)' : 'Flat discount amount'}
                                                </small>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Final Price</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light"
                                                    value={pricingData.finalPrice || '0.00'}
                                                    readOnly
                                                />
                                                <small className="text-muted">Auto-calculated</small>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-switch switch-primary d-flex align-items-center gap-3">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        name="status"
                                                        checked={pricingData.status}
                                                        onChange={handlePricingChange}
                                                    />
                                                    <label className="form-check-label text-secondary-light">
                                                        Pricing {pricingData.status ? 'Active' : 'Inactive'}
                                                    </label>
                                                </div>
                                            </div>
                                            {pricingData.basePrice && parseFloat(pricingData.basePrice) > 0 && (
                                                <div className="col-12">
                                                    <div className="alert alert-info d-flex align-items-center gap-2">
                                                        <Icon icon="solar:info-circle-bold" className="text-20" />
                                                        <div>
                                                            <strong>Price Summary:</strong> Base Price: {pricingData.currency} {pricingData.basePrice}
                                                            {pricingData.discountValue && parseFloat(pricingData.discountValue) > 0 && (
                                                                <> → Discount: {pricingData.discountValue}{pricingData.discountType === 'percent' ? '%' : ` ${pricingData.currency}`}</>
                                                            )}
                                                            {' '}→ Final Price: <strong>{pricingData.currency} {pricingData.finalPrice}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Product Stock Section - Only for Simple Products */}
                            {activeSection === 'stock' && productData.type === 'simple' && (
                                <div className="card mb-4">
                                    <div className="card-header d-flex align-items-center gap-2">
                                        <Icon icon="mdi:package-variant-closed" className="text-24" />
                                        <h5 className="card-title mb-0">Product Stock</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label">Type <span className="text-danger">*</span></label>
                                                <select
                                                    className="form-select"
                                                    name="type"
                                                    value={stockData.type}
                                                    onChange={handleStockChange}
                                                >
                                                    <option value="in">Stock In (Add)</option>
                                                    <option value="out">Stock Out (Remove)</option>
                                                </select>
                                                <small className="text-muted">For initial stock, use "Stock In"</small>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Quantity</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="quantity"
                                                    value={stockData.quantity}
                                                    onChange={handleStockChange}
                                                    placeholder="0"
                                                    min="1"
                                                />
                                                <small className="text-muted">Starting inventory quantity</small>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Source <span className="text-danger">*</span></label>
                                                <select
                                                    className="form-select"
                                                    name="source"
                                                    value={stockData.source}
                                                    onChange={handleStockChange}
                                                >
                                                    <option value="manual">Manual</option>
                                                    <option value="order">Order</option>
                                                    <option value="return">Return</option>
                                                </select>
                                                <small className="text-muted">Reason for stock change</small>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Note (Optional)</label>
                                                <textarea
                                                    className="form-control"
                                                    name="note"
                                                    value={stockData.note}
                                                    onChange={handleStockChange}
                                                    placeholder="e.g., Initial warehouse stock"
                                                    rows="2"
                                                />
                                            </div>
                                            {stockData.quantity && parseInt(stockData.quantity) > 0 && (
                                                <div className="col-12">
                                                    <div className="alert alert-success d-flex align-items-center gap-2">
                                                        <Icon icon="mdi:check-circle" className="text-20" />
                                                        <div>
                                                            <strong>Stock Summary:</strong> {stockData.quantity} units will be {stockData.type === 'in' ? 'added to' : 'removed from'} inventory.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="col-12">
                                                <div className="alert alert-info d-flex align-items-center gap-2">
                                                    <Icon icon="mdi:information-outline" className="text-20" />
                                                    <small>
                                                        For existing products, manage stock through the <strong>Stock Management</strong> page.
                                                        Initial stock is only set during product creation.
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Variants Section */}
                            {activeSection === 'variants' && (
                                <div className="card mb-4">
                                    <div className="card-header d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2">
                                            <Icon icon="carbon:data-structured" className="text-24" />
                                            <h5 className="card-title mb-0">Product Variants</h5>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button type="button" className="btn btn-sm btn-primary d-flex align-items-center" onClick={handleAddVariant}>
                                                <Icon icon="ic:baseline-plus" className="me-1" />
                                                Add Manual Variant
                                            </button>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        {/* Variants List */}
                                        <div className="mb-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                            <div className="list-group">
                                                {variants.map((variant, vIndex) => (
                                                    <div key={vIndex} className="mb-2">
                                                        <div
                                                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${expandedVariant === vIndex ? 'bg-light border-primary' : ''
                                                                }`}
                                                            onClick={() => setExpandedVariant(expandedVariant === vIndex ? null : vIndex)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <div>
                                                                <strong>Variant {vIndex + 1}</strong>
                                                                {variant.sku && <span className="ms-2 badge bg-secondary">{variant.sku}</span>}
                                                                {variant.attributes && variant.attributes.length > 0 && variant.attributes[0].name && (
                                                                    <div className="mt-1">
                                                                        <small className="text-muted">
                                                                            {variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(' • ')}
                                                                        </small>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2">
                                                                {variant.price && <span className="badge bg-success">₹{variant.price}</span>}
                                                                {variant.stock && <span className="badge bg-info">Stock: {variant.stock}</span>}
                                                                <Icon icon={expandedVariant === vIndex ? "mdi:chevron-up" : "mdi:chevron-down"} className="text-20" />
                                                            </div>
                                                        </div>

                                                        {/* Variant Form (shown only when expanded) */}
                                                        {expandedVariant === vIndex && (
                                                            <div className="border border-top-0 p-3 bg-light">
                                                                <div className="row g-3 mb-3">
                                                                    <div className="col-md-6">
                                                                        <label className="form-label">SKU</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            value={variant.sku}
                                                                            onChange={(e) => handleVariantChange(vIndex, 'sku', e.target.value)}
                                                                            placeholder="Variant SKU"
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <label className="form-label">Barcode</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            value={variant.barcode}
                                                                            onChange={(e) => handleVariantChange(vIndex, 'barcode', e.target.value)}
                                                                            placeholder="Barcode"
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <label className="form-label">Price</label>
                                                                        <input
                                                                            type="number"
                                                                            className="form-control"
                                                                            value={variant.price}
                                                                            onChange={(e) => handleVariantChange(vIndex, 'price', e.target.value)}
                                                                            placeholder="0.00"
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <label className="form-label">Compare Price</label>
                                                                        <input
                                                                            type="number"
                                                                            className="form-control"
                                                                            value={variant.compareAtPrice}
                                                                            onChange={(e) => handleVariantChange(vIndex, 'compareAtPrice', e.target.value)}
                                                                            placeholder="0.00"
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <label className="form-label">Initial Stock</label>
                                                                        <input
                                                                            type="number"
                                                                            className="form-control"
                                                                            value={variant.stock}
                                                                            onChange={(e) => handleVariantChange(vIndex, 'stock', e.target.value)}
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                    <div className="col-12">
                                                                        <label className="form-label">Variant Image</label>
                                                                        <input
                                                                            type="file"
                                                                            className="form-control"
                                                                            accept="image/*"
                                                                            onChange={(e) => handleVariantImageChange(vIndex, e.target.files[0])}
                                                                        />
                                                                        <small className="text-muted">Upload an image specific to this variant (e.g., showing the color/style)</small>
                                                                        {variant.imagePreview && (
                                                                            <div className="mt-2 position-relative d-inline-block">
                                                                                <img
                                                                                    src={variant.imagePreview}
                                                                                    alt={`Variant ${vIndex + 1}`}
                                                                                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                                                    className="rounded border"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center"
                                                                                    onClick={() => handleRemoveVariantImage(vIndex)}
                                                                                    style={{ padding: '2px 6px' }}
                                                                                >
                                                                                    <Icon icon="mdi:close" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="mb-3">
                                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                                        <label className="form-label mb-0">Attributes</label>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                                                                            onClick={() => handleAddAttribute(vIndex)}
                                                                        >
                                                                            <Icon icon="ic:baseline-plus" />
                                                                        </button>
                                                                    </div>

                                                                    {/* Generated attributes indicator */}
                                                                    {variant.attributes && variant.attributes.length > 0 && variant.attributes[0].name && !variant.attributes[0].hasOwnProperty('isManual') && (
                                                                        <div className="alert alert-success d-flex align-items-center gap-2 mb-2 py-2">
                                                                            <Icon icon="mdi:auto-fix" className="text-18" />
                                                                            <small>
                                                                                <strong>Auto-generated:</strong> {variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                                                                            </small>
                                                                        </div>
                                                                    )}

                                                                    {variant.attributes.map((attr, aIndex) => (
                                                                        <div key={aIndex} className="row g-2 mb-2">
                                                                            <div className="col-5">
                                                                                {attr.isManual ? (
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control form-control-sm p-1"
                                                                                        placeholder="Name (e.g., Color)"
                                                                                        value={attr.name}
                                                                                        onChange={(e) => handleAttributeChange(vIndex, aIndex, 'name', e.target.value)}
                                                                                    />
                                                                                ) : (
                                                                                    <select
                                                                                        className="form-select form-select-sm p-1"
                                                                                        value={attr.name}
                                                                                        onChange={(e) => handleAttributeNameSelect(vIndex, aIndex, e.target.value)}
                                                                                    >
                                                                                        <option value="">Select Attribute</option>
                                                                                        {availableAttributes.map(availAttr => (
                                                                                            <option key={availAttr._id} value={availAttr.name}>{availAttr.name}</option>
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
                                                                                        onChange={(e) => handleAttributeChange(vIndex, aIndex, 'value', e.target.value)}
                                                                                    />
                                                                                ) : (
                                                                                    <select
                                                                                        className="form-select form-select-sm p-1"
                                                                                        value={attr.value}
                                                                                        onChange={(e) => handleAttributeChange(vIndex, aIndex, 'value', e.target.value)}
                                                                                    >
                                                                                        <option value="">Select Value</option>
                                                                                        {getAvailableValues(attr.name).map((val, i) => (
                                                                                            <option key={i} value={val.label}>{val.label}</option>
                                                                                        ))}
                                                                                    </select>
                                                                                )}
                                                                            </div>
                                                                            <div className="col-2">
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                                                                                    onClick={() => handleRemoveAttribute(vIndex, aIndex)}
                                                                                >
                                                                                    <Icon icon="fluent:delete-24-regular" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {variants.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger d-flex align-items-center"
                                                                        onClick={() => handleRemoveVariant(vIndex)}
                                                                    >
                                                                        <Icon icon="fluent:delete-24-regular" className="me-1" />
                                                                        Remove Variant
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <small className="text-muted">
                                            Note: Variants are optional. Leave SKU empty if product has no variants.
                                        </small>
                                    </div>
                                </div>
                            )}

                            {/* Gallery Section */}
                            {activeSection === 'gallery' && (
                                <div className="card mb-4">
                                    <div className="card-header d-flex align-items-center gap-2">
                                        <Icon icon="solar:gallery-bold-duotone" className="text-24" />
                                        <h5 className="card-title mb-0">Product Gallery</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label">Upload Images</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                multiple
                                                onChange={handleGalleryChange}
                                            />
                                            <small className="text-muted">You can select multiple images</small>
                                        </div>
                                        {galleryPreviews.length > 0 && (
                                            <div className="row g-3">
                                                {galleryPreviews.map((preview, index) => (
                                                    <div className="col-md-3" key={index}>
                                                        <div className="position-relative">
                                                            <img
                                                                src={preview}
                                                                alt={`Gallery ${index + 1}`}
                                                                className="img-fluid rounded"
                                                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                                                                onClick={() => handleRemoveGalleryImage(index)}
                                                            >
                                                                <Icon icon="mdi:close" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {galleryPreviews.length === 0 && (
                                            <div className="text-center py-5 border rounded">
                                                <Icon icon="solar:gallery-bold-duotone" className="text-64 text-secondary-light mb-3" />
                                                <p className="text-secondary-light">No images uploaded yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* SEO Section */}
                            {activeSection === 'seo' && (
                                <div className="card mb-4">
                                    <div className="card-header d-flex align-items-center gap-2">
                                        <Icon icon="mdi:search-web" className="text-24" />
                                        <h5 className="card-title mb-0">SEO Information</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Meta Title</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="metaTitle"
                                                    value={seoData.metaTitle}
                                                    onChange={handleSeoChange}
                                                    placeholder="Enter meta title (recommended: 50-60 characters)"
                                                    maxLength="60"
                                                />
                                                <small className="text-muted">{seoData.metaTitle.length}/60 characters</small>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">SEO Slug</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="seoSlug"
                                                    value={seoData.seoSlug}
                                                    onChange={handleSeoSlugChange}
                                                    placeholder="seofriendlyslug123"
                                                />
                                                <small className="text-muted">Lowercase letters and numbers only</small>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Meta Description</label>
                                                <textarea
                                                    className="form-control"
                                                    name="metaDescription"
                                                    value={seoData.metaDescription}
                                                    onChange={handleSeoChange}
                                                    rows="3"
                                                    placeholder="Enter meta description (recommended: 150-160 characters)"
                                                    maxLength="160"
                                                />
                                                <small className="text-muted">{seoData.metaDescription.length}/160 characters</small>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Keywords</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="keywords"
                                                    value={seoData.keywords}
                                                    onChange={handleSeoChange}
                                                    placeholder="keyword1, keyword2, keyword3"
                                                />
                                                <small className="text-muted">Separate keywords with commas</small>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Canonical URL</label>
                                                <input
                                                    type="url"
                                                    className="form-control"
                                                    name="canonicalUrl"
                                                    value={seoData.canonicalUrl}
                                                    onChange={handleSeoChange}
                                                    placeholder="https://example.com/product"
                                                />
                                                <small className="text-muted">Optional: Specify the preferred URL</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stock Info Section */}
                            {activeSection === 'summary' && (
                                <div className="card mb-4">
                                    <div className="card-header d-flex align-items-center gap-2">
                                        <Icon icon="mdi:package-variant-closed" className="text-24" />
                                        <h5 className="card-title mb-0">Stock Summary</h5>
                                    </div>
                                    <div className="card-body">
                                        {productData.type === 'simple' ? (
                                            // Simple Product Stock Display
                                            <>
                                                <div className="alert alert-info">
                                                    <Icon icon="mdi:information-outline" className="me-2" />
                                                    Set initial stock quantity in the Product Stock section above. Stock management for existing products can be done from the Stock Management page.
                                                </div>
                                                {stockData.quantity && parseInt(stockData.quantity) > 0 ? (
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr>
                                                                    <th>Product SKU</th>
                                                                    <th>Type</th>
                                                                    <th>Quantity</th>
                                                                    <th>Source</th>
                                                                    <th>Note</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td><span className="badge bg-primary">{productData.sku || '-'}</span></td>
                                                                    <td><span className="badge bg-info">{stockData.type === 'in' ? 'Stock In' : 'Stock Out'}</span></td>
                                                                    <td><span className="badge bg-success">{stockData.quantity} units</span></td>
                                                                    <td><span className="badge bg-secondary">{stockData.source}</span></td>
                                                                    <td><small className="text-muted">{stockData.note || '-'}</small></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <Icon icon="mdi:package-variant-closed" className="text-48 text-secondary-light mb-2" />
                                                        <p className="text-secondary-light">No initial stock quantity set. Add stock in the Product Stock section above.</p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            // Variable Product Stock Display
                                            <>
                                                <div className="alert alert-info">
                                                    <Icon icon="mdi:information-outline" className="me-2" />
                                                    Initial stock quantities are set in the Variants section. Stock management for existing products can be done from the Stock Management page.
                                                </div>
                                                {variants.length > 0 && variants[0].sku ? (
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr>
                                                                    <th>Variant SKU</th>
                                                                    <th>Attributes</th>
                                                                    <th>Initial Stock</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {variants.map((variant, index) => (
                                                                    <tr key={index}>
                                                                        <td>{variant.sku || '-'}</td>
                                                                        <td>
                                                                            {variant.attributes
                                                                                .filter(attr => attr.name && attr.value)
                                                                                .map(attr => `${attr.name}: ${attr.value}`)
                                                                                .join(', ') || '-'}
                                                                        </td>
                                                                        <td>
                                                                            <span className="badge bg-primary">
                                                                                {variant.stock || 0} units
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <p className="text-secondary-light">No variants added yet. Add variants above.</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => navigate('/products-list')}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon="mdi:check" className="me-1" />
                                                    {isEditMode ? 'Update Product' : 'Create Product'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedProductForm;
