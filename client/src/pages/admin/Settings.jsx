import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from '../../assets/css/AdminSettings.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog, 
  faBell, 
  faPalette, 
  faUser, 
  faSave, 
  faTimes,
  faShield,
  faEnvelope,
  faGlobe,
  faImage
} from '@fortawesome/free-solid-svg-icons';

// Get real logged-in user from Redux
const currentUser = (state) => state.profile.user || state.login.user;

export default function Settings() {
  const navigate = useNavigate();
  const user = useSelector(currentUser); // Real user data

  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    siteTitle: 'Community Connect',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. We should be back online shortly.',
    emailNotifications: true,
    timezone: 'America/Toronto',
    logo: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setSettings(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving settings:', settings);
    alert('Settings saved successfully! (Check console)');
  };

  const TabButton = ({ id, label, icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`${styles.tabButton} ${activeTab === id ? styles.tabButtonActive : styles.tabButtonInactive}`}
    >
      <FontAwesomeIcon icon={icon} className={styles.tabIcon} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-2">Manage your dashboard and application preferences</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.card}>
          <div className={styles.gridContainer}>
            {/* Tabs Navigation */}
            <nav className={styles.tabsNav}>
              <div className="space-y-1">
                <TabButton id="profile" label="Profile" icon={faUser} />
                <TabButton id="general" label="General" icon={faCog} />
                <TabButton id="notifications" label="Notifications" icon={faBell} />
                <TabButton id="appearance" label="Appearance" icon={faPalette} />
              </div>
              
              {/* User Info Card */}
              <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  {user?.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      alt={user.username} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {user?.username?.[0]?.toUpperCase() || 'A'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{user?.username || 'Admin'}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            </nav>

            {/* Form Content */}
            <div className={styles.contentContainer}>
              {/* Header */}
              <div className={styles.contentHeader}>
                <div>
                  <h1 className={styles.title}>
                    <FontAwesomeIcon 
                      icon={
                        activeTab === 'profile' ? faUser :
                        activeTab === 'general' ? faCog :
                        activeTab === 'notifications' ? faBell : faPalette
                      } 
                      className="w-6 h-6 mr-3" 
                    />
                    {activeTab === 'profile' && 'Profile Settings'}
                    {activeTab === 'general' && 'General Settings'}
                    {activeTab === 'notifications' && 'Notification Preferences'}
                    {activeTab === 'appearance' && 'Appearance Settings'}
                  </h1>
                  <p className={styles.subtitle}>
                    {activeTab === 'profile' && 'Manage your personal information and account settings'}
                    {activeTab === 'general' && 'Configure site-wide settings and preferences'}
                    {activeTab === 'notifications' && 'Control how and when you receive notifications'}
                    {activeTab === 'appearance' && 'Customize the look and feel of your dashboard'}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className={styles.formBody}>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <>
                    <div className={styles.formSection}>
                      <div className={styles.formLabelContainer}>
                        <label className={styles.formLabel}>
                          <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-2" />
                          Username
                        </label>
                        <p className={styles.formHint}>Your admin display name</p>
                      </div>
                      <div className={styles.formInputContainer}>
                        <input 
                          type="text" 
                          value={user?.username || 'Admin User'} 
                          className={styles.formInput} 
                          disabled 
                        />
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <div className={styles.formLabelContainer}>
                        <label className={styles.formLabel}>
                          <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
                          Email Address
                        </label>
                        <p className={styles.formHint}>Used for login and notifications</p>
                      </div>
                      <div className={styles.formInputContainer}>
                        <input 
                          type="email" 
                          value={user?.email || 'admin@communityconnect.com'} 
                          className={styles.formInput} 
                          disabled 
                        />
                      </div>
                    </div>

                    {/* Edit Profile Button */}
                    <div className={styles.formSection}>
                      <div className={styles.formLabelContainer}>
                        <label className={styles.formLabel}>Full Profile</label>
                        <p className={styles.formHint}>Edit your photo, bio, location, and more</p>
                      </div>
                      <div className={styles.formInputContainer}>
                        <button
                          type="button"
                          onClick={() => navigate('/admin/profile/edit')}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                        >
                          Edit Full Profile
                        </button>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <div className={styles.formLabelContainer}>
                        <label className={styles.formLabel}>
                          <FontAwesomeIcon icon={faShield} className="w-4 h-4 mr-2" />
                          New Password
                        </label>
                        <p className={styles.formHint}>Leave blank to keep your current password</p>
                      </div>
                      <div className={styles.formInputContainer}>
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          className={styles.formInput} 
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* General Tab */}
                {activeTab === 'general' && (
                  <>
                    <div className={styles.formSection}>
                      <div className={styles.formLabelContainer}>
                        <label className={styles.formLabel}>Site Title</label>
                        <p className={styles.formHint}>The public name of your community</p>
                      </div>
                      <div className={styles.formInputContainer}>
                        <input 
                          type="text" 
                          name="siteTitle" 
                          value={settings.siteTitle} 
                          onChange={handleChange} 
                          className={styles.formInput} 
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formSection}>
                      <div className={styles.formLabelContainer}>
                        <label className={styles.formLabel}>
                          <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-2" />
                          Maintenance Mode
                        </label>
                        <p className={styles.formHint}>Temporarily disable public access to the site</p>
                      </div>
                      <div className={`${styles.formInputContainer} ${styles.toggleContainer}`}>
                        <label className={`${styles.toggleSwitch} ${settings.maintenanceMode ? styles.toggleSwitchOn : ''}`}>
                          <input 
                            type="checkbox" 
                            name="maintenanceMode" 
                            checked={settings.maintenanceMode} 
                            onChange={handleChange} 
                            className="hidden" 
                          />
                          <span className={`${styles.toggleCircle} ${settings.maintenanceMode ? styles.toggleCircleOn : ''}`} />
                        </label>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          {settings.maintenanceMode ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.formSection}>
                      <div className={styles.formLabelContainer}>
                        <label className={styles.formLabel}>Maintenance Message</label>
                        <p className={styles.formHint}>Displayed to users when maintenance mode is active</p>
                      </div>
                      <div className={styles.formInputContainer}>
                        <textarea 
                          name="maintenanceMessage" 
                          value={settings.maintenanceMessage} 
                          onChange={handleChange} 
                          className={styles.formTextarea} 
                          rows="3" 
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <>
                    <div className={styles.formSection}>
                      <div className={styles.formLabelContainer}>
                        <label className={styles.formLabel}>
                          <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
                          Email Notifications
                        </label>
                        <p className={styles.formHint}>Receive emails for new user signups and pending posts</p>
                      </div>
                      <div className={`${styles.formInputContainer} ${styles.toggleContainer}`}>
                        <label className={`${styles.toggleSwitch} ${settings.emailNotifications ? styles.toggleSwitchOn : ''}`}>
                          <input 
                            type="checkbox" 
                            name="emailNotifications" 
                            checked={settings.emailNotifications} 
                            onChange={handleChange} 
                            className="hidden" 
                          />
                          <span className={`${styles.toggleCircle} ${settings.emailNotifications ? styles.toggleCircleOn : ''}`} />
                        </label>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          {settings.emailNotifications ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <>
                    <div className={styles.formSection}>
                      <div className={styles.formLabelContainer}>
                        <label className={styles.formLabel}>
                          <FontAwesomeIcon icon={faImage} className="w-4 h-4 mr-2" />
                          Site Logo
                        </label>
                        <p className={styles.formHint}>Upload a new logo for the header (PNG, JPG)</p>
                      </div>
                      <div className={styles.formInputContainer}>
                        <input 
                          type="file" 
                          name="logo" 
                          onChange={handleChange} 
                          className={styles.formInput} 
                          accept="image/png, image/jpeg" 
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formSection}>
                      <div className={styles.formLabelContainer}>
                        <label className={styles.formLabel}>
                          <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 mr-2" />
                          Timezone
                        </label>
                        <p className={styles.formHint}>Set the display timezone for dates and times</p>
                      </div>
                      <div className={styles.formInputContainer}>
                        <select 
                          name="timezone" 
                          value={settings.timezone} 
                          onChange={handleChange} 
                          className={styles.formSelect}
                        >
                          <option value="America/Toronto">Eastern Time (Toronto)</option>
                          <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                          <option value="America/New_York">Eastern Time (New York)</option>
                          <option value="Europe/London">Greenwich Mean Time (London)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className={styles.formFooter}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                >
                  <FontAwesomeIcon icon={faSave} className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}