import React, { useState } from 'react';
import axios from 'axios';

const EmployeeOnboarding = () => {
    const [employeeData, setEmployeeData] = useState({ name: '', email: '', position: '' });

    const handleSubmit = async (event) => {
        event.preventDefault();
        await axios.post('/api/employees', employeeData);
        alert('Employee onboarded successfully');
    };

    return (
        <div>
            <h2>Employee Onboarding</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Employee Name"
                    value={employeeData.name}
                    onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Employee Email"
                    value={employeeData.email}
                    onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Position"
                    value={employeeData.position}
                    onChange={(e) => setEmployeeData({ ...employeeData, position: e.target.value })}
                />
                <button type="submit">Onboard Employee</button>
            </form>
        </div>
    );
};

export default EmployeeOnboarding;
