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
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faUser, 
  faEnvelope, 
  faKey, 
  faShield, 
  faUsers,
  faTimes,
  faSave
} from '@fortawesome/free-solid-svg-icons';

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

      {/* Add/Edit Modal - Modern Design */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={editingUser ? faEdit : faUser} className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={styles.modalTitle}>{editingUser ? 'Edit User' : 'Create New User'}</h2>
                  <p className="text-sm text-gray-500">
                    {editingUser ? 'Update user information' : 'Add a new user to the system'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className={styles.modalBody}>
                <div className="space-y-6">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-2 text-gray-400" />
                      Username
                    </label>
                    <input 
                      type="text" 
                      name="username" 
                      value={formData.username} 
                      onChange={handleChange} 
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter username"
                      required 
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2 text-gray-400" />
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter email address"
                      required 
                    />
                  </div>

                  {/* Password Field - Only for new users */}
                  {!editingUser && (
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <FontAwesomeIcon icon={faKey} className="w-4 h-4 mr-2 text-gray-400" />
                        Password
                      </label>
                      <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Leave blank for auto-generated password"
                      />
                      <p className="text-xs text-gray-500">
                        If left blank, a random password will be generated and emailed to the user.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Role Field */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <FontAwesomeIcon icon={faShield} className="w-4 h-4 mr-2 text-gray-400" />
                        Role
                      </label>
                      <select 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* User Type Field */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <FontAwesomeIcon icon={faUsers} className="w-4 h-4 mr-2 text-gray-400" />
                        User Type
                      </label>
                      <select 
                        name="userType" 
                        value={formData.userType} 
                        onChange={handleChange} 
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="individual">Individual</option>
                        <option value="organization">Organization</option>
                        <option value="company">Company</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faSave} className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Modern Design */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faTrash} className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={styles.modalTitle}>Confirm Deletion</h2>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faTrash} className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete the user <strong className="text-gray-900">"{userToDelete?.username}"</strong>? 
                  This will permanently remove all their data from the system.
                </p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                type="button" 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center"
              >
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDeleteUser} 
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
                {loading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}