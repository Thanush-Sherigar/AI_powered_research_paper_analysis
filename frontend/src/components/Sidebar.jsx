import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar as ACESidebar, SidebarBody, SidebarLink } from './ui/sidebar';
import {
    LayoutDashboard,
    Files,
    GitCompare,
    Settings,
    LogOut,
    BookOpen,
    User,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    const links = [
        {
            label: "Dashboard",
            href: "/",
            icon: (
                <LayoutDashboard style={{ color: '#000000' }} className="dark:text-neutral-200 h-6 w-6 flex-shrink-0 stroke-[2.5]" />
            ),
        },
        {
            label: "Comparisons",
            href: "/compare",
            icon: (
                <GitCompare style={{ color: '#000000' }} className="dark:text-neutral-200 h-6 w-6 flex-shrink-0 stroke-[2.5]" />
            ),
        },
        {
            label: "My Library",
            href: "/library",
            icon: (
                <Files style={{ color: '#000000' }} className="dark:text-neutral-200 h-6 w-6 flex-shrink-0 stroke-[2.5]" />
            ),
        },
        {
            label: "Settings",
            href: "/settings",
            icon: (
                <Settings style={{ color: '#000000' }} className="dark:text-neutral-200 h-6 w-6 flex-shrink-0 stroke-[2.5]" />
            ),
        },
    ];

    const Logo = () => {
        return (
            <div className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20">
                <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ color: '#000000' }}
                    className="font-bold text-base dark:text-white whitespace-pre"
                >
                    Paper Reviewer
                </motion.span>
            </div>
        );
    };

    const LogoIcon = () => {
        return (
            <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
                <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
            </div>
        );
    };

    return (
        <ACESidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    {open ? <Logo /> : <LogoIcon />}
                    <div className="mt-8 flex flex-col gap-2">
                        {links.map((link, idx) => (
                            <SidebarLink key={idx} link={link} />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-start gap-2 group/sidebar py-2">
                        <div className="h-7 w-7 flex-shrink-0 rounded-full bg-black flex items-center justify-center border border-white/20">
                            <User style={{ color: '#FFFFFF' }} className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <motion.span
                                animate={{
                                    display: open ? "inline-block" : "none",
                                    opacity: open ? 1 : 0,
                                }}
                                style={{ color: '#000000' }}
                                className="dark:text-neutral-200 text-base font-bold whitespace-pre inline-block !p-0 !m-0"
                            >
                                {user?.name || 'Researcher'}
                            </motion.span>
                        </div>
                    </div>

                    <SidebarLink
                        link={{
                            label: "Logout",
                            href: "#",
                            icon: (
                                <LogOut style={{ color: '#000000' }} className="dark:text-neutral-200 h-6 w-6 flex-shrink-0 stroke-[2.5]" />
                            ),
                        }}
                        onClick={logout}
                    />
                </div>
            </SidebarBody>
        </ACESidebar>
    );
}
