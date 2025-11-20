import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from '../../assets/css/AdminSettings.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faBell, faPalette, faUser } from '@fortawesome/free-solid-svg-icons';

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
    <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.gridContainer}>
        {/* Tabs Navigation */}
        <nav className={styles.tabsNav}>
          <TabButton id="profile" label="Profile" icon={faUser} />
          <TabButton id="general" label="General" icon={faCog} />
          <TabButton id="notifications" label="Notifications" icon={faBell} />
          <TabButton id="appearance" label="Appearance" icon={faPalette} />
        </nav>

        {/* Form Content */}
        <div className={styles.contentContainer}>
          {/* Header */}
          <div className={styles.contentHeader}>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Manage your dashboard and application settings.</p>
          </div>

          {/* Body */}
          <div className={styles.formBody}>
            {/* Profile Tab – Now shows REAL user + Edit Profile button */}
            {activeTab === 'profile' && (
              <>
                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>Username</label>
                    <p className={styles.formHint}>Your admin display name.</p>
                  </div>
                  <div className={styles.formInputContainer}>
                    <input 
                      type="text" 
                      value={user?.username || 'Bonnie Green'} 
                      className={styles.formInput} 
                      disabled 
                    />
                  </div>
                </div>

                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>Email Address</label>
                    <p className={styles.formHint}>Used for login and notifications.</p>
                  </div>
                  <div className={styles.formInputContainer}>
                    <input 
                      type="email" 
                      value={user?.email || 'bonnie.green@example.com'} 
                      className={styles.formInput} 
                      disabled 
                    />
                  </div>
                </div>

                {/* Real Edit Profile Button – takes you to full edit page */}
                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>Full Profile</label>
                    <p className={styles.formHint}>Edit your photo, bio, location, and more.</p>
                  </div>
                  <div className={styles.formInputContainer}>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/profile/edit')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Edit Full Profile
                    </button>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>New Password</label>
                    <p className={styles.formHint}>Leave blank to keep your current password.</p>
                  </div>
                  <div className={styles.formInputContainer}>
                    <input type="password" placeholder="••••••••" className={styles.formInput} />
                  </div>
                </div>
              </>
            )}

            {/* General, Notifications, Appearance tabs – 100% unchanged */}
            {activeTab === 'general' && (
              <>
                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>Site Title</label>
                    <p className={styles.formHint}>The public name of your community.</p>
                  </div>
                  <div className={styles.formInputContainer}>
                    <input type="text" name="siteTitle" value={settings.siteTitle} onChange={handleChange} className={styles.formInput} />
                  </div>
                </div>
                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>Maintenance Mode</label>
                    <p className={styles.formHint}>Temporarily disable public access to the site.</p>
                  </div>
                  <div className={`${styles.formInputContainer} ${styles.toggleContainer}`}>
                    <label className={styles.toggleSwitch} style={{ backgroundColor: settings.maintenanceMode ? '#05213C' : '#ccc' }}>
                      <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="hidden" />
                      <span className={styles.toggleCircle} style={{ transform: settings.maintenanceMode ? 'translateX(20px)' : 'translateX(0)' }} />
                    </label>
                  </div>
                </div>
                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>Maintenance Message</label>
                    <p className={styles.formHint}>Displayed to users when maintenance mode is active.</p>
                  </div>
                  <div className={styles.formInputContainer}>
                    <textarea name="maintenanceMessage" value={settings.maintenanceMessage} onChange={handleChange} className={styles.formTextarea} rows="3" />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>Email Notifications</label>
                    <p className={styles.formHint}>Receive emails for new user signups and pending posts.</p>
                  </div>
                  <div className={`${styles.formInputContainer} ${styles.toggleContainer}`}>
                    <label className={styles.toggleSwitch} style={{ backgroundColor: settings.emailNotifications ? '#05213C' : '#ccc' }}>
                      <input type="checkbox" name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} className="hidden" />
                      <span className={styles.toggleCircle} style={{ transform: settings.emailNotifications ? 'translateX(20px)' : 'translateX(0)' }} />
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'appearance' && (
              <>
                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>Site Logo</label>
                    <p className={styles.formHint}>Upload a new logo for the header (PNG, JPG).</p>
                  </div>
                  <div className={styles.formInputContainer}>
                    <input type="file" name="logo" onChange={handleChange} className={styles.formInput} accept="image/png, image/jpeg" />
                  </div>
                </div>
                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>Timezone</label>
                    <p className={styles.formHint}>Set the display timezone for dates and times.</p>
                  </div>
                  <div className={styles.formInputContainer}>
                    <select name="timezone" value={settings.timezone} onChange={handleChange} className={styles.formSelect}>
                      <option>America/Toronto</option>
                      <option>America/Vancouver</option>
                      <option>America/New_York</option>
                      <option>Europe/London</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className={styles.formFooter}>
            <button type="button" className={styles.cancelButton}>Cancel</button>
            <button type="submit" className={styles.saveButton}>Save Changes</button>
          </div>
        </div>
      </div>
    </form>
  );
}