import React from 'react';
import { Outlet } from 'react-router-dom';
import { RoleBasedLayout } from '../../components/RoleBasedLayout';

export const BuilderOutlet = () => {
    return (
        <RoleBasedLayout>
            <Outlet />
        </RoleBasedLayout>
    );
};
