import React, { useState, useEffect } from 'react';
import { getAllCoursesCategories, createCourseCategory, updateCourseCategory, deleteCourseCategory } from '../../../api/CourseCategoryApi';
import './CategoryManager.css';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    is_active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getAllCoursesCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Error loading categories: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      setIsLoading(true);
      if (editingCategory) {
        await updateCourseCategory(editingCategory.id, formData);
        alert('Category updated successfully!');
      } else {
        await createCourseCategory(formData);
        alert('Category created successfully!');
      }
      
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      is_active: true
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      slug: '',
      is_active: true
    });
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug || '',
      is_active: category.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteCourseCategory(categoryId);
      alert('Category deleted successfully!');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="category-manager">
      <div className="category-manager-header">
        <h2>Manage Categories</h2>
        <p>Organize your courses with categories for better navigation and discovery</p>
        
        {!showForm && (
          <button 
            className="add-category-btn"
            onClick={handleAddCategory}
            disabled={isLoading}
          >
            + Add New Category
          </button>
        )}
      </div>

      {/* Category Form - Only shown when adding/editing */}
      {showForm && (
        <div className="category-form-section">
          <div className="form-header">
            <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
            <button 
              className="close-form-btn"
              onClick={resetForm}
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter category name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug">Slug</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="URL-friendly slug (auto-generated if empty)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter category description"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
              </button>
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List - Always visible */}
      <div className="categories-list-section">
        <div className="section-header">
          <h3>Existing Categories ({categories.length})</h3>
          {categories.length > 0 && !showForm && (
            <button 
              className="add-category-btn secondary"
              onClick={handleAddCategory}
            >
              + Add Another
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h4>No categories yet</h4>
            <p>Create your first category to organize your courses</p>
            <button 
              className="primary-action"
              onClick={handleAddCategory}
            >
              Create First Category
            </button>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map(category => (
              <div key={category.id} className="category-card">
                <div className="category-info">
                  <h4>{category.name}</h4>
                  {category.description && (
                    <p>{category.description}</p>
                  )}
                  <div className="category-meta">
                    <span className={`status ${category.is_active ? 'active' : 'inactive'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {category.slug && (
                      <span className="slug">/{category.slug}</span>
                    )}
                  </div>
                </div>
                <div className="category-actions">
                  <button 
                    onClick={() => handleEdit(category)}
                    className="edit-btn"
                    title="Edit category"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(category.id)}
                    className="delete-btn"
                    title="Delete category"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;