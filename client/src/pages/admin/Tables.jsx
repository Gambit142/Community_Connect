// src/pages/admin/Tables.jsx

import React, { useState } from 'react';
import styles from '../../assets/css/AdminTables.module.css';

// MOCK DATA
const mockData = [
  { id: 'TXN123', item: 'Event Ticket', amount: 25.00, user: 'john.doe@example.com', date: '2025-10-24', status: 'Completed' },
  { id: 'TXN124', item: 'Workshop Fee', amount: 50.00, user: 'jane.smith@example.com', date: '2025-10-23', status: 'Completed' },
  { id: 'TXN125', item: 'Donation', amount: 10.00, user: 'sam.wilson@example.com', date: '2025-10-22', status: 'Processing' },
  { id: 'TXN126', item: 'Event Ticket', amount: 25.00, user: 'alex.jones@example.com', date: '2025-10-21', status: 'Cancelled' },
  { id: 'TXN127', item: 'Resource Purchase', amount: 5.50, user: 'chris.green@example.com', date: '2025-10-20', status: 'Completed' },
];
// END MOCK DATA

const StatusBadge = ({ status }) => {
  const statusClasses = {
    Completed: styles.statusCompleted,
    Processing: styles.statusProcessing,
    Cancelled: styles.statusCancelled,
  };
  return <span className={`${styles.statusBadge} ${statusClasses[status] || ''}`}>{status}</span>;
};

export default function Tables() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5; // Mock total pages for pagination

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Data Tables</h1>
        <p className={styles.subtitle}>Example of a styled data table with pagination.</p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.th}>Transaction ID</th>
              <th className={styles.th}>Item</th>
              <th className={styles.th}>Amount</th>
              <th className={styles.th}>User</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {mockData.map((item) => (
              <tr key={item.id} className={styles.tr}>
                <td className={`${styles.td} ${styles.tdPrimary}`}>{item.id}</td>
                <td className={`${styles.td} ${styles.tdSecondary}`}>{item.item}</td>
                <td className={`${styles.td} ${styles.tdSecondary}`}>${item.amount.toFixed(2)}</td>
                <td className={`${styles.td} ${styles.tdSecondary}`}>{item.user}</td>
                <td className={`${styles.td} ${styles.tdSecondary}`}>{item.date}</td>
                <td className={styles.td}><StatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.paginationContainer}>
        <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`${styles.paginationButton} ${styles.paginationButtonInactive}`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`${styles.paginationButton} ${styles.paginationButtonInactive}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}