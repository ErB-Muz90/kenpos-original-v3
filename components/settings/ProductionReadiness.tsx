import React from 'react';

interface ChecklistItemProps {
    title: string;
    description: string;
    status: 'Done' | 'In Progress' | 'Not Started';
}

const getStatusClasses = (status: ChecklistItemProps['status']) => {
    switch(status) {
        case 'Done': return 'bg-green-100 text-green-800';
        case 'In Progress': return 'bg-yellow-100 text-yellow-800';
        case 'Not Started':
        default: return 'bg-slate-100 text-slate-800';
    }
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ title, description, status }) => (
    <div className="flex items-start space-x-4 p-4 border-b border-slate-200">
        <div className={`mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusClasses(status)}`}>
            {status.replace(/([A-Z])/g, ' $1').trim()}
        </div>
        <div>
            <h4 className="font-semibold text-slate-800">{title}</h4>
            <p className="text-sm text-slate-600">{description}</p>
        </div>
    </div>
);


const ProductionReadiness: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-800">Ready for Production?</h3>
                <p className="text-sm text-blue-700 mt-1">
                    This application is a feature-rich, client-only prototype. To deploy it in a real-world, multi-user environment, several critical backend and security components must be implemented. This checklist outlines the necessary steps.
                </p>
            </div>
            
            <div className="border border-slate-200 rounded-lg">
                <ChecklistItem 
                    status="In Progress"
                    title="Client-Side Foundation (UI/UX & Offline Mode)"
                    description="The user interface, state management, and offline capabilities (using IndexedDB and Service Workers) are well-established."
                />
                 <ChecklistItem 
                    status="Not Started"
                    title="Backend Server"
                    description="A secure backend server (e.g., Node.js, Python, Go) is required to manage a central database, handle business logic, and process API requests from multiple POS clients."
                />
                 <ChecklistItem 
                    status="Not Started"
                    title="Secure User Authentication"
                    description="Implement a robust authentication system (e.g., JWT, OAuth2) on the backend. Client-side password storage must be avoided entirely. Handle user registration, login, and password resets securely."
                />
                 <ChecklistItem 
                    status="Not Started"
                    title="Central Database"
                    description="Set up a scalable database (e.g., PostgreSQL, MongoDB) on a server to act as the single source of truth for all data, ensuring consistency across all devices."
                />
                 <ChecklistItem 
                    status="Not Started"
                    title="API Development"
                    description="Create a comprehensive REST or GraphQL API to allow the frontend application to securely communicate with the backend server for all data operations (CRUD)."
                />
                 <ChecklistItem 
                    status="Not Started"
                    title="Real-time Data Sync"
                    description="Implement a synchronization mechanism (e.g., using WebSockets or periodic polling) to keep all connected clients updated with the latest data from the central database."
                />
                 <ChecklistItem 
                    status="Not Started"
                    title="Payment Gateway Integration"
                    description="Connect to payment providers like Safaricom's Daraja API on the backend. The backend will handle STK push requests and process callbacks securely."
                />
                 <ChecklistItem 
                    status="Not Started"
                    title="Server-Side Data Validation & Permissions"
                    description="All data and actions must be validated on the server. User role permissions must be enforced on the backend API to prevent unauthorized access or modifications."
                />
                 <ChecklistItem 
                    status="Not Started"
                    title="Automated Backups"
                    description="Establish a regular, automated backup strategy for the central database to prevent data loss."
                />
            </div>
        </div>
    );
};

export default ProductionReadiness;
