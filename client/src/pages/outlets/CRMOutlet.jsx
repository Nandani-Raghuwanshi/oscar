import React from 'react';
import { Outlet } from 'react-router-dom';
import { RoleBasedLayout } from '../../components/RoleBasedLayout';

export const CRMOutlet = () => {
    return (
        <RoleBasedLayout>
            <Outlet />
        </RoleBasedLayout>
    );
};
