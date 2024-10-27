import { useEffect, useState } from 'react';
import { motoko_project_backend } from 'declarations/motoko_project_backend';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [inStockFilter, setInStockFilter] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Ürünü düzenlemek için state

  const categories = [
    "Electronic",
    "Garden",
    "Clothes",
    "Shoe",
    "Game",
    "Furniture",
    "Kitchenware",
    "Others"
  ];

  const fetchProducts = async () => {
    const productList = await motoko_project_backend.getAllProducts();
    setProducts(productList);
    setFilteredProducts(productList);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async () => {
    if (price < 0) {
      alert("Price cannot be negative.");
      return;
    }
    
    const productId = await motoko_project_backend.addProduct(name, price, description, selectedCategory);
    console.log("Product added with ID:", productId);
    resetForm();
    fetchProducts();
  };

  const resetForm = () => {
    setName('');
    setPrice(0);
    setDescription('');
    setSelectedCategory('');
    setEditingProduct(null);
  };

  const updateProduct = async (id) => {
    if (price < 0) {
      alert("Price cannot be negative.");
      return;
    }

    const success = await motoko_project_backend.updateProduct(id, name, price, description, selectedCategory, inStockFilter);
    if (success) {
      resetForm();
      fetchProducts();
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setSelectedCategory(product.category);
  };

  const updateStock = async (id, newStockStatus) => {
    const success = await motoko_project_backend.updateStockStatus(id, newStockStatus);
    if (success) fetchProducts();
  };

  const deleteProduct = async (id) => {
    const success = await motoko_project_backend.deleteProduct(id, true);
    if (success) fetchProducts();
  };

  const searchProducts = async (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (term) {
      const results = await motoko_project_backend.searchProductByName(term);
      setFilteredProducts(results);
    } else {
      setFilteredProducts(products);
    }
  };

  const filterProducts = async () => {
    const results = await motoko_project_backend.filterProducts(selectedCategory, inStockFilter);
    setFilteredProducts(results);
  };

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, inStockFilter]);

  return (
    <div className="product-management">
      <h1>Product Management</h1>
      
      <div>
        <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value))}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <button onClick={editingProduct ? () => updateProduct(editingProduct.id) : addProduct}>
          {editingProduct ? "Update Product" : "Add Product"}
        </button>
      </div>

      <h2>Filter Products</h2>
      <input
        type="text"
        placeholder="Search by product name"
        value={searchTerm}
        onChange={searchProducts}
      />
      <div className="filter-section">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={inStockFilter}
            onChange={() => setInStockFilter(!inStockFilter)}
          />
          Only show in-stock products
        </label>
      </div>

      <h2>Products</h2>
      <ul>
        {filteredProducts.map((product) => (
            
          <li key={product.id}>
            <strong>{product.name}</strong> - <span className="product-price">$ {product.price.toString()}</span>
            <p>{product.description}</p>
            <p>Status: {product.inStock ? "In Stock" : "Out of Stock"}</p>
            <p>Category: {product.category}</p>
            <p>Product Id: {product.id.toString()}</p>
            <button onClick={() => startEdit(product)}>Edit</button>
            <button onClick={() => deleteProduct(product.id)}>Delete</button>
            <button 
                className="toggle-status-button" 
                onClick={() => updateStock(product.id, !product.inStock)}
            >
                Toggle Stock Status
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductManagement;
