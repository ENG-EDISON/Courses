import React, { useState, useEffect, useMemo } from 'react';
import {
    getAllMessages,
    deleteMessage,
    markAsRead,
    markAsResponded,
    bulkDeleteMessages,
    bulkMarkAsRead,
    bulkMarkAsResponded,
    getMessagesStats,
    getMessageById
} from '../api/ContactMessages';
import '../static/AdminMessagesList.css';

const AdminMessagesList = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMessages, setSelectedMessages] = useState(new Set());
    const [filters, setFilters] = useState({
        status: 'all',
        dateRange: 'all',
        search: ''
    });
    const [stats, setStats] = useState({});
    const [viewMode, setViewMode] = useState('table');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [bulkAction, setBulkAction] = useState('');

    // Add to useEffect for keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showDetailModal) {
                setShowDetailModal(false);
            }
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                fetchData();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showDetailModal]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [messagesResponse, statsResponse] = await Promise.all([
                getAllMessages(),
                getMessagesStats()
            ]);
            
            setMessages(messagesResponse?.data || []);
            setStats(statsResponse?.data || {});
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load messages. Please try again.');
            setMessages([]);
            setStats({});
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = useMemo(() => {
        if (!Array.isArray(messages)) return [];
        
        return messages.filter(message => {
            if (!message) return false;

            // Status filter
            if (filters.status === 'unread' && message.is_read) return false;
            if (filters.status === 'read' && !message.is_read) return false;
            if (filters.status === 'unresponded' && message.responded) return false;
            if (filters.status === 'responded' && !message.responded) return false;

            // Search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const name = message.customer_name || '';
                const email = message.customer_email || '';
                const subject = message.subject || '';
                const messagePreview = message.message_preview || '';
                
                return (
                    name.toLowerCase().includes(searchTerm) ||
                    email.toLowerCase().includes(searchTerm) ||
                    subject.toLowerCase().includes(searchTerm) ||
                    messagePreview.toLowerCase().includes(searchTerm)
                );
            }

            return true;
        });
    }, [messages, filters]);

    // Use message_preview from API response
    const getMessagePreview = (message) => {
        return message.message_preview || 'No message content';
    };

    const handleSelectMessage = (id) => {
        const newSelected = new Set(selectedMessages);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedMessages(newSelected);
    };

    const handleSelectAll = () => {
        if (!Array.isArray(filteredMessages)) return;
        
        if (selectedMessages.size === filteredMessages.length) {
            setSelectedMessages(new Set());
        } else {
            setSelectedMessages(new Set(filteredMessages.map(msg => msg?.id).filter(Boolean)));
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedMessages.size === 0) return;

        const ids = Array.from(selectedMessages);
        try {
            switch (bulkAction) {
                case 'mark-read':
                    await bulkMarkAsRead(ids);
                    break;
                case 'mark-responded':
                    await bulkMarkAsResponded(ids);
                    break;
                case 'delete':
                    if (!window.confirm(`Are you sure you want to delete ${ids.length} messages?`)) return;
                    await bulkDeleteMessages(ids);
                    break;
                default:
                    return;
            }
            
            // Small delay to ensure API processing
            await new Promise(resolve => setTimeout(resolve, 300));
            await fetchData();
            setSelectedMessages(new Set());
            setBulkAction('');
        } catch (error) {
            console.error('Error performing bulk action:', error);
            setError('Failed to perform bulk action.');
        }
    };

    const handleMessageAction = async (id, action, notes = '') => {
        try {
            switch (action) {
                case 'read':
                    await markAsRead(id);
                    break;
                case 'responded':
                    await markAsResponded(id, notes);
                    break;
                case 'delete':
                    if (!window.confirm('Are you sure you want to delete this message?')) return;
                    await deleteMessage(id);
                    break;
                default:
                    return;
            }
            
            // Small delay to ensure API processing
            await new Promise(resolve => setTimeout(resolve, 300));
            await fetchData();
            
            if (action === 'delete' && selectedMessage?.id === id) {
                setShowDetailModal(false);
            }
        } catch (error) {
            console.error('Error performing action:', error);
            setError('Failed to perform action.');
        }
    };

    const openMessageDetail = async (id) => {
        try {
            // First get the full message details by ID
            const messageResponse = await getMessageById(id);
            const fullMessage = messageResponse.data;
            
            if (!fullMessage) {
                setError('Message not found.');
                return;
            }
            
            setSelectedMessage(fullMessage);
            setShowDetailModal(true);
            
            // Mark as read if not already read
            if (!fullMessage.is_read) {
                await markAsRead(id);
                // Small delay before refreshing
                await new Promise(resolve => setTimeout(resolve, 300));
                await fetchData();
            }
        } catch (error) {
            console.error('Error opening message detail:', error);
            setError('Failed to open message details.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Unknown';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
            
            if (diffInHours < 1) return 'Just now';
            if (diffInHours < 24) return `${diffInHours}h ago`;
            if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
            return formatDate(dateString);
        } catch (error) {
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <div className="admin-messages-loading">
                <div className="loading-spinner"></div>
                <p>Loading messages...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <div className="error-content">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Messages</h3>
                    <p>{error}</p>
                    <button onClick={fetchData} className="btn-retry">
                        <i className="fas fa-redo"></i> Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-messages-container">
            {/* Header */}
            <div className="admin-header">
                <div className="header-left">
                    <h1>Contact Messages</h1>
                    <p>Manage and respond to customer inquiries</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchData}>
                        <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                    <div className="view-toggle">
                        <button 
                            className={viewMode === 'table' ? 'active' : ''}
                            onClick={() => setViewMode('table')}
                        >
                            <i className="fas fa-table"></i>
                        </button>
                        <button 
                            className={viewMode === 'card' ? 'active' : ''}
                            onClick={() => setViewMode('card')}
                        >
                            <i className="fas fa-th-large"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">
                        <i className="fas fa-inbox"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.total || 0}</h3>
                        <p>Total Messages</p>
                    </div>
                </div>
                <div className="stat-card unread">
                    <div className="stat-icon">
                        <i className="fas fa-envelope"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.unread || 0}</h3>
                        <p>Unread</p>
                    </div>
                </div>
                <div className="stat-card responded">
                    <div className="stat-icon">
                        <i className="fas fa-reply"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.responded || 0}</h3>
                        <p>Responded</p>
                    </div>
                </div>
                <div className="stat-card today">
                    <div className="stat-icon">
                        <i className="fas fa-calendar-day"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.today || 0}</h3>
                        <p>Today</p>
                    </div>
                </div>
            </div>

            {/* Filters and Bulk Actions */}
            <div className="toolbar">
                <div className="filters">
                    <select 
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="filter-select"
                    >
                        <option value="all">All Messages</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="unresponded">Unresponded</option>
                        <option value="responded">Responded</option>
                    </select>
                    
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="bulk-actions">
                    {selectedMessages.size > 0 && (
                        <>
                            <span className="selected-count">
                                {selectedMessages.size} selected
                            </span>
                            <select 
                                value={bulkAction}
                                onChange={(e) => setBulkAction(e.target.value)}
                                className="bulk-select"
                            >
                                <option value="">Bulk Actions</option>
                                <option value="mark-read">Mark as Read</option>
                                <option value="mark-responded">Mark as Responded</option>
                                <option value="delete">Delete</option>
                            </select>
                            <button 
                                onClick={handleBulkAction}
                                className="btn-apply"
                                disabled={!bulkAction}
                            >
                                Apply
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Messages List */}
            {viewMode === 'table' ? (
                <div className="messages-table-container">
                    <table className="messages-table">
                        <thead>
                            <tr>
                                <th className="select-column">
                                    <input
                                        type="checkbox"
                                        checked={selectedMessages.size === filteredMessages.length && filteredMessages.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Customer</th>
                                <th>Subject</th>
                                <th>Message Preview</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMessages.map(message => (
                                <tr 
                                    key={message.id} 
                                    className={`
                                        ${!message.is_read ? 'unread' : ''}
                                        ${selectedMessages.has(message.id) ? 'selected' : ''}
                                    `}
                                >
                                    <td className="select-column">
                                        <input
                                            type="checkbox"
                                            checked={selectedMessages.has(message.id)}
                                            onChange={() => handleSelectMessage(message.id)}
                                        />
                                    </td>
                                    <td className="customer-cell">
                                        <div className="customer-info">
                                            <div className="customer-name">
                                                {message.customer_name || 'Anonymous'}
                                            </div>
                                            <div className="customer-email">
                                                {message.customer_email || 'No email'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="subject-cell">
                                        {message.subject || 'No Subject'}
                                    </td>
                                    <td className="message-preview">
                                        {getMessagePreview(message)}
                                    </td>
                                    <td className="status-cell">
                                        <div className="status-badges">
                                            {!message.is_read && (
                                                <span className="badge badge-unread">New</span>
                                            )}
                                            {message.responded ? (
                                                <span className="badge badge-responded">Responded</span>
                                            ) : (
                                                <span className="badge badge-pending">Pending</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="date-cell">
                                        <div className="date-time">
                                            {formatDate(message.created_at)}
                                        </div>
                                        <div className="time-ago">
                                            {getTimeAgo(message.created_at)}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => openMessageDetail(message.id)}
                                                className="btn-action btn-view"
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            {!message.is_read && (
                                                <button
                                                    onClick={() => handleMessageAction(message.id, 'read')}
                                                    className="btn-action btn-mark-read"
                                                    title="Mark as Read"
                                                >
                                                    <i className="fas fa-envelope-open"></i>
                                                </button>
                                            )}
                                            {!message.responded && (
                                                <button
                                                    onClick={() => handleMessageAction(message.id, 'responded')}
                                                    className="btn-action btn-respond"
                                                    title="Mark as Responded"
                                                >
                                                    <i className="fas fa-reply"></i>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleMessageAction(message.id, 'delete')}
                                                className="btn-action btn-delete"
                                                title="Delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="messages-grid">
                    {filteredMessages.map(message => (
                        <div 
                            key={message.id} 
                            className={`
                                message-card 
                                ${!message.is_read ? 'unread' : ''}
                                ${selectedMessages.has(message.id) ? 'selected' : ''}
                            `}
                        >
                            <div className="card-header">
                                <input
                                    type="checkbox"
                                    checked={selectedMessages.has(message.id)}
                                    onChange={() => handleSelectMessage(message.id)}
                                />
                                <div className="customer-info">
                                    <div className="customer-name">
                                        {message.customer_name || 'Anonymous'}
                                    </div>
                                    <div className="customer-email">
                                        {message.customer_email || 'No email'}
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button
                                        onClick={() => openMessageDetail(message.id)}
                                        className="btn-action btn-view"
                                    >
                                        <i className="fas fa-eye"></i>
                                    </button>
                                    <button
                                        onClick={() => handleMessageAction(message.id, 'delete')}
                                        className="btn-action btn-delete"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="card-body">
                                <div className="card-subject">
                                    {message.subject || 'No Subject'}
                                </div>
                                <div className="card-message">
                                    {getMessagePreview(message)}
                                </div>
                            </div>
                            
                            <div className="card-footer">
                                <div className="status-badges">
                                    {!message.is_read && (
                                        <span className="badge badge-unread">New</span>
                                    )}
                                    {message.responded ? (
                                        <span className="badge badge-responded">Responded</span>
                                    ) : (
                                        <span className="badge badge-pending">Pending</span>
                                    )}
                                </div>
                                <div className="card-date">
                                    {getTimeAgo(message.created_at)}
                                </div>
                            </div>
                            
                            <div className="card-quick-actions">
                                {!message.is_read && (
                                    <button
                                        onClick={() => handleMessageAction(message.id, 'read')}
                                        className="btn-quick-action"
                                    >
                                        <i className="fas fa-envelope-open"></i> Mark Read
                                    </button>
                                )}
                                {!message.responded && (
                                    <button
                                        onClick={() => handleMessageAction(message.id, 'responded')}
                                        className="btn-quick-action"
                                    >
                                        <i className="fas fa-reply"></i> Respond
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredMessages.length === 0 && (
                <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <h3>No messages found</h3>
                    <p>There are no messages matching your current filters.</p>
                </div>
            )}

            {/* Message Detail Modal */}
            {showDetailModal && selectedMessage && (
                <MessageDetailModal
                    message={selectedMessage}
                    onClose={() => setShowDetailModal(false)}
                    onAction={handleMessageAction}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
};

// Modal Component
const MessageDetailModal = ({ message, onClose, onAction, formatDate }) => {
    const [responseNotes, setResponseNotes] = useState(message.response_notes || '');

    const handleSaveResponse = async () => {
        await onAction(message.id, 'responded', responseNotes);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Message Details</h2>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="message-meta">
                        <div className="meta-row">
                            <strong>From:</strong>
                            <span>{message.customer_name || 'Anonymous'} ({message.customer_email || 'No email'})</span>
                        </div>
                        <div className="meta-row">
                            <strong>Date:</strong>
                            <span>{formatDate(message.created_at)}</span>
                        </div>
                        {message.subject && (
                            <div className="meta-row">
                                <strong>Subject:</strong>
                                <span>{message.subject}</span>
                            </div>
                        )}
                        <div className="meta-row">
                            <strong>Status:</strong>
                            <div className="status-badges">
                                {!message.is_read && <span className="badge badge-unread">New</span>}
                                {message.responded ? (
                                    <span className="badge badge-responded">Responded</span>
                                ) : (
                                    <span className="badge badge-pending">Pending Response</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="message-content">
                        <h3>Message</h3>
                        <div className="content-text">
                            {message.message || message.message_preview || 'No message content'}
                        </div>
                    </div>

                    <div className="response-section">
                        <h3>Response Notes</h3>
                        <textarea
                            value={responseNotes}
                            onChange={(e) => setResponseNotes(e.target.value)}
                            placeholder="Add internal notes about how this was responded to..."
                            rows="4"
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="footer-actions">
                        {!message.responded && (
                            <button
                                onClick={handleSaveResponse}
                                className="btn-primary"
                                disabled={!responseNotes.trim()}
                            >
                                <i className="fas fa-check"></i> Mark as Responded
                            </button>
                        )}
                        {!message.is_read && (
                            <button
                                onClick={() => onAction(message.id, 'read')}
                                className="btn-secondary"
                            >
                                <i className="fas fa-envelope-open"></i> Mark as Read
                            </button>
                        )}
                        <button
                            onClick={() => onAction(message.id, 'delete')}
                            className="btn-danger"
                        >
                            <i className="fas fa-trash"></i> Delete Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMessagesList;