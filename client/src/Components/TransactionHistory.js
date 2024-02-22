import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';


const TransactionHistory = () => {
  const [transactionHistory, setTransactionHistory] = useState([]);
  const token = Cookies.get('token');

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/transaction_history`, {
          headers: {
            Authorization: token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transaction history');
        }

        const data = await response.json();
        setTransactionHistory(data.transactionHistory);
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      }
    };

    fetchTransactionHistory();
  }, [token]);

  return (
    <div className="transaction-history-container">
      <h2>Transaction History</h2>
      <table className="transaction-history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {transactionHistory.map((transaction, index) => (
            <tr key={index}>
              <td>{new Date(transaction.createdAt).toLocaleString()}</td>
              <td>{transaction.transactionType}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
