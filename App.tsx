import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, BloodGroup, Page, AuthPage } from './types';
import { DISTRICTS } from './constants';
import { generateThankYouMessage } from './services/geminiService';
import { userStore } from './store';

const LOGGED_IN_USER_ID_KEY = 'khan-blood-link-logged-in-user-id';

// --- Reusable Icon Components ---
const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
);
const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
);
const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
);
const MessageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>
);
const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
);
const Spinner: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
);
const AiSparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 8a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8ZM8 7h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" /><path d="M11.5 14.5a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 1 0v2a.5.5 0 0 1-.5.5ZM10 11.5a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 1 0v1a.5.5 0 0 1-.5.5ZM14 11.5a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 1 0v1a.5.5 0 0 1-.5.5Z" /><path d="M4 8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2H5v2a1 1 0 0 1-1 1Zm16 0a1 1 0 0 0 1-1V5h-2a1 1 0 1 0 0-2h3a1 1 0 0 0 1 1v3a1 1 0 0 0-1 1ZM4 16a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 1 0 0-2H5v-2a1 1 0 0 0-1-1Zm15 1a1 1 0 0 1 1 1v2h-2a1 1 0 1 1 0 2h3a1 1 0 0 1 1-1v-3a1 1 0 0 1-1-1Z" /></svg>
);


// --- Reusable UI Components ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}
const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
    const baseClasses = "px-4 py-2 rounded-md font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
    const variantClasses = {
        primary: 'bg-brand-red-600 hover:bg-brand-red-700 focus:ring-brand-red-500',
        secondary: 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500',
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    };
    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}
const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, label }) => {
    return (
        <div className="flex items-center">
             <label className="flex items-center cursor-pointer">
                {label && <span className="mr-3 text-sm font-medium text-gray-900">{label}</span>}
                <div className="relative">
                    <input type="checkbox" className="sr-only" checked={enabled} onChange={() => onChange(!enabled)} />
                    <div className={`block w-14 h-8 rounded-full transition ${enabled ? 'bg-brand-red-600' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'translate-x-6' : ''}`}></div>
                </div>
            </label>
        </div>
    );
};

// --- App Specific Components (defined outside App to avoid re-creation) ---
interface DonorCardProps {
  donor: User;
  onContact: (donor: User) => void;
  onCall: (donor: User) => void;
}
const DonorCard: React.FC<DonorCardProps> = ({ donor, onContact, onCall }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{donor.fullName}</h3>
          <p className="text-slate-500">{donor.district}</p>
        </div>
        <div className="flex-shrink-0 w-20 h-20 bg-brand-red-100 text-brand-red-700 rounded-full flex items-center justify-center text-3xl font-extrabold">
          {donor.bloodGroup}
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
         <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            donor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
          <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${donor.isActive ? 'text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
          {donor.isActive ? 'Active' : 'Inactive'}
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={() => onCall(donor)} variant="secondary" className="!px-3 !py-1.5 !text-sm">
                <PhoneIcon className="w-4 h-4 mr-1"/>
                Call
            </Button>
            <Button onClick={() => onContact(donor)} className="!px-3 !py-1.5 !text-sm">
                <MessageIcon className="w-4 h-4 mr-1"/>
                Message
            </Button>
        </div>
      </div>
    </div>
  );
};


interface FilterBarProps {
    bloodGroupFilter: string;
    setBloodGroupFilter: (value: string) => void;
    districtFilter: string;
    setDistrictFilter: (value: string) => void;
    showActiveOnly: boolean;
    setShowActiveOnly: (value: boolean) => void;
    bloodGroups: string[];
    districts: string[];
}
const FilterBar: React.FC<FilterBarProps> = ({
    bloodGroupFilter, setBloodGroupFilter,
    districtFilter, setDistrictFilter,
    showActiveOnly, setShowActiveOnly,
    bloodGroups, districts
}) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8 sticky top-20 z-10 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1 lg:col-span-1">
                    <label htmlFor="bloodGroup" className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                    <select id="bloodGroup" value={bloodGroupFilter} onChange={(e) => setBloodGroupFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-brand-red-500 focus:border-brand-red-500 text-slate-900">
                        <option value="">All Groups</option>
                        {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                </div>
                <div className="md:col-span-1 lg:col-span-1">
                    <label htmlFor="district" className="block text-sm font-medium text-slate-700 mb-1">District / City</label>
                    <select id="district" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-brand-red-500 focus:border-brand-red-500 text-slate-900">
                        <option value="">All Districts</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                 <div className="md:col-span-1 lg:col-span-2 flex md:justify-end items-center pt-5">
                    <Toggle enabled={showActiveOnly} onChange={setShowActiveOnly} label="Show Active Donors Only"/>
                </div>
            </div>
        </div>
    );
};

interface ContactModalProps {
    donor: User | null;
    onClose: () => void;
    onSend: (message: string) => void;
}
const ContactModal: React.FC<ContactModalProps> = ({ donor, onClose, onSend }) => {
    const [message, setMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (donor) {
            setMessage(`Hi ${donor.fullName}, I am in need of your help. `);
        } else {
            setMessage('');
        }
    }, [donor]);

    if (!donor) return null;

    const handleGenerateClick = async () => {
        setIsGenerating(true);
        const generatedMessage = await generateThankYouMessage(donor.fullName);
        setMessage(generatedMessage);
        setIsGenerating(false);
    };

    const handleSend = () => {
        onSend(message);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-slate-800">
                    <CloseIcon className="w-6 h-6"/>
                </button>
                <h2 className="text-2xl font-bold mb-2 text-slate-800">Contact {donor.fullName}</h2>
                <p className="mb-4 text-slate-600">
                    Your message will be sent via your device's SMS app to <span className="font-semibold">{donor.phone}</span>.
                </p>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md h-32 focus:ring-brand-red-500 focus:border-brand-red-500 text-slate-900"
                    placeholder="Type your message here..."
                />
                <div className="mt-4 flex flex-col sm:flex-row justify-between gap-3">
                    <Button onClick={handleGenerateClick} variant="secondary" disabled={isGenerating}>
                        {isGenerating ? <Spinner/> : <AiSparklesIcon className="w-5 h-5"/>}
                        {isGenerating ? 'Generating...' : 'AI Thank You Note'}
                    </Button>
                    <Button onClick={handleSend} disabled={!message.trim()}>
                        Send Message
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>(() => userStore.getUsers());
    const [loggedInUser, setLoggedInUser] = useState<User | null>(() => {
        try {
            const userId = localStorage.getItem(LOGGED_IN_USER_ID_KEY);
            if (userId) {
                return userStore.findUserById(parseInt(userId, 10)) || null;
            }
        } catch (error) {
            console.error("Failed to load logged-in user from storage", error);
        }
        return null;
    });

    const [currentPage, setCurrentPage] = useState<Page>(Page.Directory);
    
    // Filters
    const [bloodGroupFilter, setBloodGroupFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    
    // Modal State
    const [contactDonor, setContactDonor] = useState<User | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        const handleStoreChange = () => {
            const allUsers = userStore.getUsers();
            setUsers([...allUsers]); 
        };
        const unsubscribe = userStore.subscribe(handleStoreChange);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if(notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleProfileUpdate = (updatedUser: User) => {
        userStore.updateUser(updatedUser);
        // If the updated user is the current logged in user, update the state
        if (loggedInUser && loggedInUser.id === updatedUser.id) {
            setLoggedInUser(updatedUser);
        }
        setCurrentPage(Page.Directory);
        setNotification("Profile updated successfully!");
    };
    
    const handleSendMessage = (messageText: string) => {
        if (!contactDonor) return;
        
        const url = `sms:${contactDonor.phone}?body=${encodeURIComponent(messageText)}`;
        window.location.href = url;
        setNotification(`Opening messaging app for ${contactDonor.fullName}`);
    };

    const handleCallDonor = (donor: User) => {
        setNotification(`Initiating call to ${donor.fullName}...`);
        window.location.href = `tel:${donor.phone}`;
    };

    const handleLogin = (user: User) => {
        try {
            localStorage.setItem(LOGGED_IN_USER_ID_KEY, user.id.toString());
            setLoggedInUser(user);
            setNotification(`Welcome back, ${user.fullName}!`);
        } catch (error) {
            console.error("Failed to save login session:", error);
            setNotification("Could not save your login session. You may be logged out on refresh.");
        }
    };

    const handleRegister = (newUser: Omit<User, 'id' | 'isActive'>) => {
        const userWithId = { ...newUser, id: Date.now(), isActive: true };
        userStore.addUser(userWithId);
        // After registration, log the user in
        try {
            localStorage.setItem(LOGGED_IN_USER_ID_KEY, userWithId.id.toString());
            setLoggedInUser(userWithId);
            setNotification("Registration successful! Welcome!");
        } catch (error) {
             console.error("Failed to save login session after registration:", error);
             setNotification("Registration successful, but couldn't save session.");
        }
    };

    const handleLogout = () => {
        try {
            localStorage.removeItem(LOGGED_IN_USER_ID_KEY);
        } catch (error) {
             console.error("Failed to clear login session:", error);
        }
        setLoggedInUser(null);
        setCurrentPage(Page.Directory);
        setNotification("You have been logged out.");
    };

    const filteredDonors = useMemo(() => {
        return users.filter(user => {
            if(user.id === loggedInUser?.id) return false; // Don't show self in directory
            if (showActiveOnly && !user.isActive) return false;
            if (bloodGroupFilter && user.bloodGroup !== bloodGroupFilter) return false;
            if (districtFilter && user.district !== districtFilter) return false;
            return true;
        });
    }, [users, bloodGroupFilter, districtFilter, showActiveOnly, loggedInUser]);

    const renderPage = () => {
        switch(currentPage) {
            case Page.Profile:
                return <ProfilePage user={loggedInUser} onSave={handleProfileUpdate} />;
            case Page.Directory:
            default:
                return <DirectoryPage donors={filteredDonors} onContact={setContactDonor} onCall={handleCallDonor} filters={{ bloodGroupFilter, setBloodGroupFilter, districtFilter, setDistrictFilter, showActiveOnly, setShowActiveOnly }} />;
        }
    };

    if (!loggedInUser) {
        return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
             {notification && (
                <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-down">
                    {notification}
                </div>
            )}
            <header className="bg-white shadow-md sticky top-0 z-20">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage(Page.Directory)}>
                                <span className="text-brand-red-600 text-2xl font-bold">🩸</span>
                                <span className="text-xl font-bold text-slate-800">KHAN BLOOD LINK</span>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <button onClick={() => setCurrentPage(Page.Directory)} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${currentPage === Page.Directory ? 'bg-brand-red-100 text-brand-red-700' : 'text-slate-600 hover:bg-slate-100'}`}><HomeIcon className="w-5 h-5"/> Directory</button>
                                <button onClick={() => setCurrentPage(Page.Profile)} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${currentPage === Page.Profile ? 'bg-brand-red-100 text-brand-red-700' : 'text-slate-600 hover:bg-slate-100'}`}><UserIcon className="w-5 h-5"/> Profile</button>
                                <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-1"><LogoutIcon className="w-5 h-5"/> Logout</button>
                            </div>
                        </div>
                         <div className="md:hidden">
                             <button onClick={handleLogout} className="p-2 rounded-md text-slate-600 hover:bg-slate-100"><LogoutIcon className="w-6 h-6"/></button>
                        </div>
                    </div>
                </nav>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderPage()}
            </main>
            <ContactModal donor={contactDonor} onClose={() => setContactDonor(null)} onSend={handleSendMessage} />
        </div>
    );
};


// --- Page Components ---

const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 shadow-sm focus:outline-none focus:ring-brand-red-500 focus:border-brand-red-500";
const selectClass = "mt-1 block w-full p-2 border border-slate-300 rounded-md text-slate-900 shadow-sm focus:ring-brand-red-500 focus:border-brand-red-500";


interface LoginPageProps {
    onLogin: (user: User) => void;
    onRegister: (user: Omit<User, 'id' | 'isActive'>) => void;
}
const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
    const [authPage, setAuthPage] = useState<AuthPage>(AuthPage.Login);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        bloodGroup: BloodGroup.APositive,
        phone: '',
        district: DISTRICTS.find(d => d === "Dhaka") || DISTRICTS[0],
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setError(null);
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (authPage === AuthPage.Login) {
            if (!formData.email || !formData.password) {
                 setError("Please enter both email and password.");
                 return;
            }
            const user = userStore.findUserByCredentials(formData.email, formData.password);
            if (user) {
                onLogin(user);
            } else {
                setError("Invalid email or password.");
            }
        } else { // Register
            if (userStore.emailExists(formData.email)) {
                setError("An account with this email already exists.");
                return;
            }
            if(!formData.fullName || !formData.email || !formData.password || !formData.phone) {
                setError("Please fill all required fields.");
                return;
            }
            onRegister(formData as Omit<User, 'id' | 'isActive'>);
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
             <div className="flex-shrink-0 flex items-center gap-2 mb-8">
                <span className="text-brand-red-600 text-4xl font-bold">🩸</span>
                <span className="text-3xl font-bold text-slate-800">KHAN BLOOD LINK</span>
            </div>
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border">
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">{authPage === AuthPage.Login ? 'Welcome Back!' : 'Create Your Account'}</h2>
                <p className="text-slate-500 text-center mb-6">{authPage === AuthPage.Login ? 'Sign in to find a donor' : 'Join our community of lifesavers'}</p>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {authPage === AuthPage.Register && (
                         <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className={inputClass}/>
                        </div>
                    )}
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={inputClass}/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required className={inputClass}/>
                    </div>
                     {authPage === AuthPage.Register && (
                         <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">Blood Group</label>
                                    <select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className={selectClass}>
                                        {Object.values(BloodGroup).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={inputClass}/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="district" className="block text-sm font-medium text-gray-700">District / City</label>
                                <select id="district" name="district" value={formData.district} onChange={handleChange} className={selectClass}>
                                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                         </>
                    )}
                    <Button type="submit" className="w-full !py-3 !text-base !mt-6">
                        {authPage === AuthPage.Login ? 'Login' : 'Create Account'}
                    </Button>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={() => { setAuthPage(authPage === AuthPage.Login ? AuthPage.Register : AuthPage.Login); setError(null); }} className="text-sm text-brand-red-600 hover:text-brand-red-800 font-medium">
                        {authPage === AuthPage.Login ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};


interface DirectoryPageProps {
    donors: User[];
    onContact: (donor: User) => void;
    onCall: (donor: User) => void;
    filters: Omit<FilterBarProps, 'bloodGroups' | 'districts'>;
}
const DirectoryPage: React.FC<DirectoryPageProps> = ({ donors, onContact, onCall, filters }) => {
    return (
        <>
            <FilterBar {...filters} bloodGroups={Object.values(BloodGroup)} districts={DISTRICTS} />
            {donors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donors.map(donor => <DonorCard key={donor.id} donor={donor} onContact={onContact} onCall={onCall} />)}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border">
                    <h3 className="text-xl font-semibold text-slate-700">No Donors Found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your filters or checking back later. New donors are joining daily!</p>
                </div>
            )}
        </>
    );
};

interface ProfilePageProps {
    user: User | null;
    onSave: (user: User) => void;
}
const ProfilePage: React.FC<ProfilePageProps> = ({ user, onSave }) => {
    const [formData, setFormData] = useState<User | null>(user);

    useEffect(() => {
        setFormData(user);
    }, [user]);

    if (!formData) return <div>Loading profile...</div>;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => {
            if (!prevData) return null;
            return { ...prevData, [name]: value };
        });
    };

    const handleToggle = (isActive: boolean) => {
        setFormData(prevData => {
            if (!prevData) return null;
            return { ...prevData, isActive };
        });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md border">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Edit Your Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className={inputClass}/>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (cannot be changed)</label>
                    <input type="email" name="email" id="email" value={formData.email} disabled className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm text-slate-500"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">Blood Group</label>
                        <select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className={selectClass}>
                            {Object.values(BloodGroup).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClass}/>
                    </div>
                </div>
                <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">District / City</label>
                    <select id="district" name="district" value={formData.district} onChange={handleChange} className={selectClass}>
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700">Donor Status</label>
                     <p className="text-xs text-slate-500 mb-2">Set to 'Active' to appear in search results.</p>
                     <Toggle enabled={formData.isActive} onChange={handleToggle} />
                </div>
                <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </div>
    );
};

export default App;