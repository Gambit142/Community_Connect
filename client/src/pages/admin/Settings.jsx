// src/pages/admin/Settings.jsx

import React, { useState } from 'react';
import styles from '../../assets/css/AdminSettings.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faBell, faPalette, faUser } from '@fortawesome/free-solid-svg-icons'; // Added faUser icon

// MOCK DATA
const initialSettings = {
  // Profile
  adminUsername: 'Bonnie Green',
  adminEmail: 'bonnie.green@example.com',
  // General
  siteTitle: 'Community Connect',
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing scheduled maintenance. We should be back online shortly.',
  // Notifications
  emailNotifications: true,
  // Appearance
  timezone: 'America/Toronto',
  logo: null,
};
// END MOCK DATA

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile'); // Default to profile tab
  const [settings, setSettings] = useState(initialSettings);

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
      type="button" // Important to prevent form submission
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
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>Username</label>
                    <p className={styles.formHint}>Your admin display name.</p>
                  </div>
                  <div className={styles.formInputContainer}>
                    <input type="text" name="adminUsername" value={settings.adminUsername} onChange={handleChange} className={styles.formInput} />
                  </div>
                </div>
                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>Email Address</label>
                    <p className={styles.formHint}>Used for login and notifications.</p>
                  </div>
                  <div className={styles.formInputContainer}>
                    <input type="email" name="adminEmail" value={settings.adminEmail} onChange={handleChange} className={styles.formInput} />
                  </div>
                </div>
                <div className={styles.formSection}>
                  <div className={styles.formLabelContainer}>
                    <label className={styles.formLabel}>New Password</label>
                    <p className={styles.formHint}>Leave blank to keep your current password.</p>
                  </div>
                  <div className={styles.formInputContainer}>
                    <input type="password" name="newPassword" placeholder="••••••••" className={styles.formInput} />
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

            {/* Notifications Tab */}
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

            {/* Appearance Tab */}
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