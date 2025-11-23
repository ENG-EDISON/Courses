import React, { useState, useEffect } from "react";
import { getAllUsers, deactivateUser, activateUser } from "../../api/UsersApi";
import AddUser from "./AddUser";
import EditUser from "./Edit/EditUser";
import DeleteUser from "./Edit/DeleteUser"; // Import the new component
import "./css/UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null); // New state for delete modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);   
    setError("");
    try {
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      setError("Failed to fetch users: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user update
  const handleUpdateUser = async (userId, updatedData) => {
    try {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updatedData } : user
      ));
      setEditingUser(null);
      return true;
    } catch (err) {
      setError("Failed to update user: " + (err.response?.data?.message || err.message));
      return false;
    }
  };

  // Handle create new user
  const handleCreateUser = async (userData) => {
    try {
      setUsers(prevUsers => [userData, ...prevUsers]);
      setShowAddUser(false);
      return true;
    } catch (err) {
      setError("Failed to create user: " + (err.response?.data?.message || err.message));
      return false;
    }
  };

  // Handle user deactivation
  const handleDeactivateUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (window.confirm(`Are you sure you want to deactivate ${user?.username}?`)) {
      try {
        await deactivateUser(userId);
        setUsers(users.map(user => 
          user.id === userId ? { ...user, is_active: false } : user
        ));
      } catch (err) {
        setError("Failed to deactivate user: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Handle user activation
  const handleActivateUser = async (userId) => {
    try {
      await activateUser(userId);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: true } : user
      ));
    } catch (err) {
      setError("Failed to activate user: " + (err.response?.data?.message || err.message));
    }
  };

  // Handle user deletion - Updated to use modal
  const handleDeleteUser = (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      setDeletingUser(userToDelete);
    }
  };

  // Handle successful user deletion
  const handleUserDeleted = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    setDeletingUser(null);
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || 
                         user.user_type === filterType;

    return matchesSearch && matchesFilter;
  });

  // User info component with avatar placeholder
  const UserInfo = ({ user }) => (
    <div className="um-user-info">
      {user.profile_picture_url ? (
        <img 
          src={user.profile_picture_url} 
          alt={user.username}
          className="um-user-avatar"
        />
      ) : (
        <div className="um-user-avatar-placeholder">
          {user.username?.charAt(0).toUpperCase()}
        </div>
      )}
      <span>{user.username}</span>
      {user.is_staff && (
        <span className="um-admin-badge" title="Administrator">👑</span>
      )}
    </div>
  );

  return (
    <div className="um-user-management">
      <div className="admin-page">
        <div className="content-section">
          <div className="um-content-header">
            <h2>👤 Users Management</h2>
            <div className="um-header-actions">
              <button 
                onClick={() => setShowAddUser(true)} 
                className="um-btn-add-user"
              >
                + Add User
              </button>
              <button onClick={fetchUsers} className="um-btn-refresh" disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {error && (
            <div className="um-error-message">
              {error}
              <button 
                type="button"
                onClick={() => setError("")} 
                className="um-close-error"
              >
                ×
              </button>
            </div>
          )}

          {/* Filters and Search */}
          <div className="um-user-filters">
            <div className="um-search-box">
              <input
                type="text"
                placeholder="Search users by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="um-filter-group">
              <label>Filter by type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="content-card">
            <h3>User Accounts ({filteredUsers.length})</h3>
            
            {loading ? (
              <div className="um-loading">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="um-no-data">No users found</div>
            ) : (
              <div className="um-users-table-container">
                <table className="um-users-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Name</th>
                      <th>User Type</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <UserInfo user={user} />
                        </td>
                        <td>{user.email}</td>
                        <td>
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : '-'
                          }
                        </td>
                        <td>
                          <span className={`um-user-type-badge ${user.user_type}`}>
                            {user.user_type_display || user.user_type}
                          </span>
                        </td>
                        <td>
                          <span className={`um-role-badge ${user.is_staff ? 'admin' : 'user'}`}>
                            {user.is_staff ? (user.is_superuser ? 'Super Admin' : 'Staff') : 'User'}
                          </span>
                        </td>
                        <td>
                          <span className={`um-status-badge ${user.is_active !== false ? 'active' : 'inactive'}`}>
                            {user.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="um-action-buttons">
                            <button 
                              onClick={() => setEditingUser(user)}
                              className="um-btn-edit"
                              title="Edit User"
                            >
                              Edit
                            </button>
                            
                            {user.is_active !== false ? (
                              <button 
                                onClick={() => handleDeactivateUser(user.id)}
                                className="um-btn-deactivate"
                                title="Deactivate User"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleActivateUser(user.id)}
                                className="um-btn-activate"
                                title="Activate User"
                              >
                                Activate
                              </button>
                            )}
                            
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="um-btn-delete"
                              title="Delete User"
                            >
                              Delete
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

          {/* User Statistics */}
          <div className="content-grid">
            <div className="content-card">
              <h3>User Statistics</h3>
              <div className="um-stats-grid">
                <div className="um-stat-item">
                  <span className="um-stat-number">{users.length}</span>
                  <span className="um-stat-label">Total Users</span>
                </div>
                <div className="um-stat-item">
                  <span className="um-stat-number">
                    {users.filter(u => u.user_type === 'instructor').length}
                  </span>
                  <span className="um-stat-label">Instructors</span>
                </div>
                <div className="um-stat-item">
                  <span className="um-stat-number">
                    {users.filter(u => u.user_type === 'student').length}
                  </span>
                  <span className="um-stat-label">Students</span>
                </div>
                <div className="um-stat-item">
                  <span className="um-stat-number">
                    {users.filter(u => u.is_staff).length}
                  </span>
                  <span className="um-stat-label">Admins</span>
                </div>
                <div className="um-stat-item">
                  <span className="um-stat-number">
                    {users.filter(u => u.is_active !== false).length}
                  </span>
                  <span className="um-stat-label">Active Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <EditUser
            user={editingUser}
            onSave={handleUpdateUser}
            onCancel={() => setEditingUser(null)}
          />
        )}

        {/* Add User Modal */}
        {showAddUser && (
          <AddUser
            onUserAdded={handleCreateUser}
            onCancel={() => setShowAddUser(false)}
          />
        )}

        {/* Delete User Modal */}
        {deletingUser && (
          <DeleteUser
            user={deletingUser}
            onUserDeleted={handleUserDeleted}
            onCancel={() => setDeletingUser(null)}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagement;