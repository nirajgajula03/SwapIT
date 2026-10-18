import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ItemsPage from './pages/ItemsPage';
import SwapsPage from './pages/SwapsPage';
import WalletPage from './pages/WalletPage';
import RepairAssistantPage from './pages/RepairAssistantPage';
import ProfilePage from './pages/ProfilePage';
import UploadItemPage from './pages/UploadItemPage';
import { useAuth } from './contexts/AuthContext';
import MessagesPage from './pages/MessagesPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PaymentGatewayPage from './pages/PaymentGatewayPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

const App: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#EFEFDE] dark:bg-[#001845]">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#2A67C9]"></div>
            </div>
        );
    }
    
    return (
        <Routes>
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/home" replace />} />
            <Route path="/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to="/home" replace />} />
            
            <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<HomePage />} />
                <Route path="items" element={<ItemsPage />} />
                <Route path="items/new" element={<UploadItemPage />} />
                <Route path="swaps" element={<SwapsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="messages/:conversationId" element={<MessagesPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="repair-assistant" element={<RepairAssistantPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="payment-gateway" element={<PaymentGatewayPage />} />
                <Route path="payment-success" element={<PaymentSuccessPage />} />
            </Route>
            
            <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
        </Routes>
    );
};

export default App;