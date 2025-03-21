import React, { useState, useEffect } from 'react';
import { fetchAdministrators } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import { FaEye } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';
import './Administrator.css';

const Administrators = () => {
  const [users, setUsers] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
  const [selectedOperator, setSelectedOperator] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const operatorData = await fetchAdministrators();
        setUsers(operatorData);
      } catch (error) {
        console.error('Failed to fetch administrator details', error);
      }
    };
    fetchUsers();
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters({ status: selectedStatus });
  };

  const filters = [
    {
      name: 'status',
      label: 'Status',
      value: selectedStatus,
      onChange: setSelectedStatus,
      options: [
        { value: 'All', label: 'All Statuses' },
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
  ];

  const displayLabels = {
    userid: 'User ID',
    ufirstname: 'First Name',
    ulastname: 'Last Name',
    uemail: 'Email',
    uphoneno: 'Phone Number',
    uactivation: 'Status',
    ugender: 'Gender',
    ucountry: 'Country',
  };

  // Filter logic for both search key and status
  const filteredUsers = users.filter((user) => {
    const searchInFields =
      `${user.userid} ${user.ufirstname} ${user.ulastname} ${user.uemail} ${user.uphoneno} ${user.uactivation}`
        .toLowerCase()
        .includes(searchKey.toLowerCase());

    const statusFilter =
      appliedFilters.status === 'All' || user.uactivation === appliedFilters.status;

    return searchInFields && statusFilter;
  });

  const handleAction = (action, user) => {
    if (action === 'view') {
      const essentialFields = {
        userid: user.userid || 'N/A',
        ufirstname: user.ufirstname || 'N/A',
        ulastname: user.ulastname || 'N/A',
        uemail: user.uemail || 'N/A',
        uphoneno: user.uphoneno || 'N/A',
        uactivation: user.uactivation || 'N/A',
        ugender: user.ugender || 'N/A',
        ucountry: user.ucountry || 'N/A',
      };
      setSelectedOperator(essentialFields);
    }
  };

  const operatorDropdownItems = [
    { label: 'View Details', icon: <FaEye />, action: 'view' },
  ];

  const columns = [
    { header: 'ID', accessor: 'userid' },
    { header: 'First Name', accessor: 'ufirstname' },
    { header: 'Last Name', accessor: 'ulastname' },
    { header: 'Email', accessor: 'uemail' },
    { header: 'Phone', accessor: 'uphoneno' },
    {
      header: 'Status',
      accessor: 'uactivation',
      render: (user) => (
        <span className={`status-badge ${user.uactivation?.toLowerCase() || 'active'}`}>
          {user.uactivation || 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (operator) => (
        <ActionDropdown
          items={operatorDropdownItems}
          onAction={(action) => handleAction(action, operator)}
          onClose={() => {}}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="header-container">
        <h1 className="dashboard-page-title">Administrator Details</h1>
        <SearchBar
          value={searchKey}
          onChange={(newValue) => setSearchKey(newValue)}
          placeholder="Search administrators ..."
        />
      </div>

      <Filter filters={filters} onApplyFilters={handleApplyFilters} />

      <PaginatedTable
        data={filteredUsers}
        columns={columns}
        rowKey="userid"
        enableCheckbox={false}
      />

      <Modal
        isOpen={!!selectedOperator}
        title={`${selectedOperator?.ufirstname} ${selectedOperator?.ulastname}`}
        data={selectedOperator || {}}
        labels={displayLabels}
        onClose={() => setSelectedOperator(null)}
      />
    </div>
  );
};

export default Administrators;
