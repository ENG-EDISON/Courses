// components/CategorySelection.js
import React, { useState } from 'react';
import "./CategorySelection.css"

const CategorySelection = ({ categories, onSelect, loading, error, onAddCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [addingCategory, setAddingCategory] = useState(false);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!newCategory.name.trim()) errors.name = 'Category name is required';
    if (!newCategory.slug.trim()) errors.slug = 'Slug is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setAddingCategory(true);
    try {
      await onAddCategory(newCategory);
      setShowAddForm(false);
      setNewCategory({ name: '', slug: '', description: '', is_active: true });
      setFormErrors({});
    } catch (error) {
      console.error('Error adding category:', error);
      setFormErrors({ submit: error.response?.data?.message || 'Failed to create category' });
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSlugGenerate = (name) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setNewCategory(prev => ({ ...prev, slug }));
    if (formErrors.slug) {
      setFormErrors(prev => ({ ...prev, slug: '' }));
    }
  };

  const resetForm = () => {
    setNewCategory({ name: '', slug: '', description: '', is_active: true });
    setFormErrors({});
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="category-selection loading">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-selection error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="category-selection">
      <div className="selection-header">
        <h2>Select a Category</h2>
        <p>Choose a category to view and edit its courses</p>
        
        <div className="header-actions">
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
            disabled={showAddForm}
          >
            + Add New Category
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="add-category-form">
          <div className="form-header">
            <h3>Create New Category</h3>
            <button 
              onClick={resetForm}
              className="close-btn"
              disabled={addingCategory}
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleAddCategory}>
            <div className="form-row">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => {
                    setNewCategory(prev => ({ ...prev, name: e.target.value }));
                    handleSlugGenerate(e.target.value);
                  }}
                  className={formErrors.name ? 'error' : ''}
                  placeholder="Enter category name"
                  disabled={addingCategory}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label>Slug *</label>
                <input
                  type="text"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                  className={formErrors.slug ? 'error' : ''}
                  placeholder="category-slug"
                  disabled={addingCategory}
                />
                {formErrors.slug && <span className="error-text">{formErrors.slug}</span>}
                <div className="help-text">URL-friendly version of the name</div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional category description"
                rows={3}
                disabled={addingCategory}
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newCategory.is_active}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, is_active: e.target.checked }))}
                  disabled={addingCategory}
                />
                <span className="checkbox-custom"></span>
                Active (category will be visible to users)
              </label>
            </div>

            {formErrors.submit && (
              <div className="form-error">
                {formErrors.submit}
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                onClick={resetForm}
                className="btn btn-secondary"
                disabled={addingCategory}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={addingCategory}
              >
                {addingCategory ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="search-box">
        <input
          type="text"
          placeholder="Search categories by name or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="categories-grid">
        {filteredCategories.map(category => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => onSelect(category)}
          >
            <div className="category-icon">
              {category.image ? (
                <img src={category.image} alt={category.name} />
              ) : (
                <span className="default-icon">📁</span>
              )}
            </div>
            <div className="category-info">
              <h3 className="category-name">{category.name}</h3>
              <p className="category-slug">
                <strong>Slug:</strong> {category.slug}
              </p>
              {category.description && (
                <p className="category-description">
                  {category.description}
                </p>
              )}
              <div className="category-meta">
                <span className="category-id">ID: {category.id}</span>
                <span className={`status ${category.is_active ? 'active' : 'inactive'}`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="category-arrow">→</div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && categories.length > 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No categories found</h3>
          <p>Try adjusting your search terms</p>
        </div>
      )}

      {categories.length === 0 && !showAddForm && (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No categories available</h3>
          <p>Create your first category to organize your courses</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            + Create First Category
          </button>
        </div>
      )}
    </div>
  );
};

export default CategorySelection;