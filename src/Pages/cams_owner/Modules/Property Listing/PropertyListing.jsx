import React, { useState, useEffect } from 'react';
import {fetchPropertiesListingTable,updatePropertyStatus,deleteProperty} from '../../../../../Api/api';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import PropertyForm from '../../../../Component/PropertyForm/PropertyForm';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import Filter from '../../../../Component/Filter/Filter';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import Alert from '../../../../Component/Alert/Alert';
import { FaEye} from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';


const PropertyListing = () => {
    const [properties, setProperties] = useState([]);
    const [searchKey, setSearchKey] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('');


    useEffect(() => {
        fetchProperties();
    }, []);

    const displayToast = (type, message) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const fetchProperties = async () => {
        try {
            const propertyData = await fetchPropertiesListingTable();
            const validProperties = (propertyData?.properties || []).filter(
                (property) => property.propertyid !== undefined
            );
            setProperties(validProperties);
        } catch (error) {
            console.error('Failed to fetch property details', error);
            displayToast('error', 'Failed to load properties. Please try again.');
        }
    };

    const handleAction = (action, property) => {
        if (action === 'view') {
            setSelectedProperty({
                propertyname: property.propertyname || 'N/A',
                propertyprice: property.propertyprice || 'N/A',
                propertylocation: property.propertylocation || 'N/A',
                propertyguestpaxno: property.propertyguestpaxno || 'N/A',
                propertystatus: property.propertystatus || 'N/A',
                propertybedtype: property.propertybedtype || 'N/A',
                propertydescription: property.propertydescription || 'N/A',
                images: property.propertyimage || [],
                username:property.username || 'N/A',
            });
        } 
    };

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
                { value: 'Pending', label: 'Pending' },
                { value: 'Available', label: 'Available' },
                { value: 'Unavailable', label: 'Unavailable' },
            ],
        },
    ];

    const displayLabels = {
        propertyname: "Property Name",
        propertyprice: "Property Price",
        propertylocation: "Property Location",
        propertyguestpaxno: "Guest Capacity",
        propertystatus: "Property Status",
        propertybedtype: "Bed Type",
        propertydescription: "Description",
        images: "Images",
        username: "Operator Name"
    };

    const filteredProperties = properties.filter(
        (property) =>
            (appliedFilters.status === 'All' || (property.propertystatus ?? 'Pending').toLowerCase() === appliedFilters.status.toLowerCase()) &&
            (
                (property.propertyid?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertyname?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertylocation?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertyprice?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertystatus?.toLowerCase().includes(searchKey.toLowerCase()) || '')
            )
    );

    const propertyDropdownItems = [
        { label: 'View Details', icon: <FaEye />, action: 'view' },
    ];

    const columns = [
        { header: 'ID', accessor: 'propertyid' },
        {
            header: 'Image',
            accessor: 'propertyimage',
            render: (property) => (
                property.propertyimage && property.propertyimage.length > 0 ? (
                    <img
                        src={`data:image/jpeg;base64,${property.propertyimage[0]}`}
                        alt={property.propertyname}
                        style={{ width: 80, height: 80 }}
                    />
                ) : (
                    <span>No Image</span>
                )
            )
        },
        { header: 'Name', accessor: 'propertyname' },
        { header: 'Price', accessor: 'propertyprice' },
        { header: 'Location', accessor: 'propertylocation' },
        {
            header: 'Status',
            accessor: 'propertystatus',
            render: (property) => (
              <span className={`property-status ${(property.propertystatus ?? 'Pending').toLowerCase()}`}>
                {property.propertystatus || 'Pending'}
              </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (property) => (
                <ActionDropdown
                    items={propertyDropdownItems}
                    onAction={(action) => handleAction(action, property)}
                />
            )
        }
    ];

    return (
        <div>
            <div className="header-container">
                <h1 className="dashboard-page-title">Property Listings</h1>
                <SearchBar value={searchKey} onChange={(newValue) => setSearchKey(newValue)} placeholder="Search properties..." />
            </div>

            <Filter filters={filters} onApplyFilters={handleApplyFilters} />

            <PaginatedTable
                data={filteredProperties}
                columns={columns}
                rowKey="propertyid"
              
            />

            <Modal
                isOpen={!!selectedProperty}
                title={`${selectedProperty?.propertyname}`}
                data={selectedProperty || {}}
                labels={displayLabels}
                onClose={() => setSelectedProperty(null)}
            />


            
            {showToast && <Toast type={toastType} message={toastMessage} />}
        </div>
    );
};

export default PropertyListing;
