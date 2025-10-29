// src/pages/admin/UserProfiles.jsx

import React, { useState, useEffect } from 'react';
import styles from '../../assets/css/UserProfiles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

// MOCK DATA
const initialUsers = [
  { _id: '1', username: 'Jiril Zala', email: 'jiril.zala@example.com', role: 'admin', userType: 'individual' },
  { _id: '2', username: 'Jane Smith', email: 'jane.smith@example.com', role: 'member', userType: 'individual' },
  { _id: '3', username: 'Community Food Bank', email: 'contact@foodbank.org', role: 'member', userType: 'organization' },
  { _id: '4', username: 'John Doe', email: 'john.doe@example.com', role: 'member', userType: 'individual' },
];
// END MOCK DATA

export default function UserProfiles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null for new user, object for editing
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setUsers(initialUsers);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- CRUD HANDLERS ---
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = (userData) => {
    setLoading(true);
    setTimeout(() => {
      if (editingUser) { // Update existing user
        setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...userData } : u));
      } else { // Add new user
        const newUser = { _id: Date.now().toString(), ...userData };
        setUsers([newUser, ...users]);
      }
      setIsModalOpen(false);
      setLoading(false);
    }, 500);
  };

  const confirmDeleteUser = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      setLoading(false);
    }, 500);
  };

  // Main render
  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>User Management</h1>
            <p className="mt-1 text-sm text-gray-600">Add, edit, or remove user profiles.</p>
          </div>
          <button onClick={handleOpenAddModal} className={styles.refreshButton}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add User
          </button>
        </div>
        
        {error && <div className="text-red-600 mb-4 p-2 bg-red-50 rounded">{error}</div>}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.th}>Username</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>User Type</th>
                <th className={`${styles.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {users.map((u) => (
                <tr key={u._id} className={styles.tr}>
                  <td className={`${styles.td} ${styles.tdUsername}`}>{u.username}</td>
                  <td className={`${styles.td} ${styles.tdEmail}`}>{u.email}</td>
                  <td className={styles.td}>
                    <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleMember}`}>{u.role}</span>
                  </td>
                  <td className={`${styles.td} ${styles.tdEmail}`}>{u.userType}</td>
                  <td className={`${styles.td} ${styles.actionsContainer}`}>
                    <button onClick={() => handleOpenEditModal(u)} className={`${styles.actionButton} ${styles.editButton}`} title="Edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleOpenDeleteModal(u)} className={`${styles.actionButton} ${styles.deleteButton}`} title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <UserFormModal 
          user={editingUser} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveUser} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal 
          user={userToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteUser}
        />
      )}
    </>
  );
}

// --- MODAL COMPONENTS (kept in the same file for simplicity) ---

function UserFormModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'member',
    userType: user?.userType || 'individual',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{user ? 'Edit User' : 'Add New User'}</h2>
            <button type="button" onClick={onClose}>&times;</button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              <div>
                <label className={styles.formLabel}>Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className={styles.formInput} required />
              </div>
              <div>
                <label className={styles.formLabel}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.formInput} required />
              </div>
              <div>
                <label className={styles.formLabel}>Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className={styles.formInput}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>User Type</label>
                <select name="userType" value={formData.userType} onChange={handleChange} className={styles.formInput}>
                  <option value="individual">Individual</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" className={styles.saveButton}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ user, onClose, onConfirm }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Confirm Deletion</h2>
          <button type="button" onClick={onClose}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <p>Are you sure you want to delete the user <strong>{user?.username}</strong>? This action cannot be undone.</p>
        </div>
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
          <button type="button" onClick={onConfirm} className={styles.confirmDeleteButton}>Delete</button>
        </div>
      </div>
    </div>
  );
}