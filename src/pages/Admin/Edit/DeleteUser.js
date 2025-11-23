import React, { useState } from "react";
import { deleteUser } from "../../../api/UsersApi";
import "../css/DeleteUser.css";

const DeleteUser = ({ user, onUserDeleted, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        if (!user || !user.id) {
            setError("Cannot delete user: User information is missing");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await deleteUser(user.id);

            if (onUserDeleted) {
                onUserDeleted(user.id);
            }

        } catch (err) {
            console.error("Error deleting user:", err);
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.detail ||
                err.message ||
                "Failed to delete user";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="delete-modal-overlay">
            <div className="delete-modal">
                <div className="delete-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#dc2626" strokeWidth="2" />
                        <path d="M12 8V12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                        <path d="M12 16H12.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="delete-title">
                    <h3>Delete User?</h3>
                    <p>This action cannot be undone. Are you sure you want to delete this user?</p>
                </div>

                <div className="user-info">
                    <div className="username">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                </div>

                {error && (
                    <div style={{
                        color: '#dc2626',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        background: '#fef2f2',
                        borderRadius: '4px'
                    }}>
                        {error}
                    </div>
                )}

                <div className="modal-actions">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="btn-delete"
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete User"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-cancel"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteUser;