import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  clearUserError,
  clearCurrentUser 
} from '../../store/admin/adminSlice.js';
import styles from '../../assets/css/UserProfiles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function UserProfiles() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users, userLoading: loading, userError: error } = useSelector((state) => state.admin);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'member',
    userType: 'individual',
  });

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearUserError());
    }
  }, [error, dispatch]);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'member',
      userType: 'individual',
    });
    setIsModalOpen(true);
  };

 const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      userType: user.userType,
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    const payload = {
      username: formData.username,
      email: formData.email,
      role: formData.role,
      userType: formData.userType,
    };

    if (!editingUser && formData.password) {
      payload.password = formData.password;
    }

    if (editingUser) {
      await dispatch(updateUser({ userId: editingUser._id, userData: payload }));
    } else {
      await dispatch(createUser(payload));
    }

    setIsModalOpen(false);
  };

  const confirmDeleteUser = async () => {
    await dispatch(deleteUser(userToDelete._id));
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

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

        <div className={styles.tableContainer}>
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading users...</div>
          ) : (
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdUsername}`}>{u.username}</td>
                      <td className={`${styles.td} ${styles.tdEmail}`}>{u.email}</td>
                      <td className={styles.td}>
                        <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleMember}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className={`${styles.td} ${styles.tdEmail}`}>{u.userType}</td>
                      <td className={`${styles.td} ${styles.actionsContainer}`}>
                        <button 
                          onClick={() => handleOpenEditModal(u)} 
                          className={`${styles.actionButton} ${styles.editButton}`} 
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          onClick={() => handleOpenDeleteModal(u)} 
                          className={`${styles.actionButton} ${styles.deleteButton}`} 
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <form onSubmit={handleSaveUser}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                <button type="button" onClick={() => setIsModalOpen(false)}>&times;</button>
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
                  {!editingUser && (
                    <div>
                      <label className={styles.formLabel}>Password</label>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} className={styles.formInput} placeholder="Leave blank for auto-generated" />
                    </div>
                  )}
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
                      <option value="company">Company</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>Cancel</button>
                <button type="submit" disabled={loading} className={styles.saveButton}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Confirm Deletion</h2>
              <button type="button" onClick={() => setIsDeleteModalOpen(false)}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete the user <strong>{userToDelete?.username}</strong>? This action cannot be undone.</p>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className={styles.cancelButton}>Cancel</button>
              <button type="button" onClick={confirmDeleteUser} disabled={loading} className={styles.confirmDeleteButton}>
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}