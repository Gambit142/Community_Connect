// src/pages/admin/Events.jsx

import React, { useState, useEffect } from 'react';
import styles from '../../assets/css/AdminEvents.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

// MOCK DATA
const initialEvents = [
  { _id: '1', title: 'Community Garden Workshop', category: 'Workshop', dateTime: '2025-11-05T14:00', isFeatured: true, description: 'A hands-on workshop about urban gardening.', image: null },
  { _id: '2', title: 'Neighborhood Cleanup Day', category: 'Volunteer', dateTime: '2025-11-12T09:00', isFeatured: false, description: 'Join us to clean up our local parks.', image: null },
  { _id: '3', title: 'Local Farmers Market', category: 'Market', dateTime: '2025-11-15T11:00', isFeatured: true, description: 'Fresh produce from local farmers.', image: null },
];
// END MOCK DATA

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEvents(initialEvents);
      setLoading(false);
    }, 500);
  }, []);

  // --- CRUD HANDLERS ---
  const handleSaveEvent = (eventData) => {
    setLoading(true);
    setTimeout(() => {
      if (editingEvent) {
        setEvents(events.map(e => e._id === editingEvent._id ? { ...e, ...eventData } : e));
      } else {
        setEvents([{ _id: Date.now().toString(), ...eventData }, ...events]);
      }
      setIsModalOpen(false);
      setLoading(false);
    }, 500);
  };

  const confirmDeleteEvent = () => {
    setLoading(true);
    setTimeout(() => {
      setEvents(events.filter(e => e._id !== eventToDelete._id));
      setIsDeleteModalOpen(false);
      setLoading(false);
    }, 500);
  };

  const formatDate = (dateTime) => new Date(dateTime).toLocaleString();

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Events Management</h1>
            <p className="mt-1 text-sm text-gray-600">Create, edit, or delete community events.</p>
          </div>
          <button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className={styles.addButton}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Event
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.th}>Event Title</th>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Date & Time</th>
                <th className={styles.th}>Featured</th>
                <th className={`${styles.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {events.map((event) => (
                <tr key={event._id} className={styles.tr}>
                  <td className={`${styles.td} ${styles.tdTitle}`}>{event.title}</td>
                  <td className={`${styles.td} ${styles.tdText}`}>{event.category}</td>
                  <td className={`${styles.td} ${styles.tdText}`}>{formatDate(event.dateTime)}</td>
                  <td className={`${styles.td} ${styles.tdText}`}>{event.isFeatured ? 'Yes' : 'No'}</td>
                  <td className={`${styles.td} ${styles.actionsContainer}`}>
                    <button onClick={() => { setEditingEvent(event); setIsModalOpen(true); }} className={`${styles.actionButton} ${styles.editButton}`} title="Edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => { setEventToDelete(event); setIsDeleteModalOpen(true); }} className={`${styles.actionButton} ${styles.deleteButton}`} title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <EventFormModal event={editingEvent} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} />}
      {isDeleteModalOpen && <DeleteConfirmModal event={eventToDelete} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeleteEvent} />}
    </>
  );
}

// --- MODAL COMPONENTS ---

function EventFormModal({ event, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    category: event?.category || 'Workshop',
    dateTime: event?.dateTime || '',
    isFeatured: event?.isFeatured || false,
    description: event?.description || '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
            <h2 className={styles.modalTitle}>{event ? 'Edit Event' : 'Add New Event'}</h2>
            <button type="button" onClick={onClose}>&times;</button>
          </div>
          <div className={styles.modalBody}>
            <div>
              <label className={styles.formLabel}>Event Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className={styles.formInput} required />
            </div>
            <div>
              <label className={styles.formLabel}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className={styles.formTextarea} rows="3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={styles.formLabel}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className={styles.formSelect}>
                  <option>Workshop</option>
                  <option>Volunteer</option>
                  <option>Market</option>
                  <option>Social</option>
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>Date and Time</label>
                <input type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleChange} className={styles.formInput} required />
              </div>
            </div>
            <div>
              <label className={styles.formLabel}>Event Image</label>
              <input type="file" name="image" onChange={handleChange} className={styles.formInput} accept="image/*" />
            </div>
            <div className={styles.toggleContainer}>
              <span className={styles.toggleLabel}>Feature this event?</span>
              <label className={styles.toggleSwitch} style={{ backgroundColor: formData.isFeatured ? '#05213C' : '#ccc' }}>
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="hidden" />
                <span className={styles.toggleCircle} style={{ transform: formData.isFeatured ? 'translateX(20px)' : 'translateX(0)' }} />
              </label>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" className={styles.saveButton}>Save Event</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ event, onClose, onConfirm }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Confirm Deletion</h2>
          <button type="button" onClick={onClose}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <p>Are you sure you want to delete the event <strong>{event?.title}</strong>? This action cannot be undone.</p>
        </div>
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
          <button type="button" onClick={onConfirm} className={styles.confirmDeleteButton}>Delete</button>
        </div>
      </div>
    </div>
  );
}