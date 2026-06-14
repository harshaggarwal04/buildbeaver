"use client"

import React, { useEffect, useState } from 'react'
import { BookOpen, Settings, Moon, Sun, LogOut, BookA } from 'lucide-react'
import { FaGithub } from "react-icons/fa";
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSubItem, SidebarSeparator } from './ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import Link from 'next/link'
import Logout from '@/modules/auth/components/logout'


export const AppSidebar = () => {

    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();

    useEffect(() => {
        setMounted(true);
    }, [])


    const navigationItems = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: BookOpen
        },

        {
            title: "Repository",
            url: "/dashboard/repository",
            icon: FaGithub
        },

        {
            title: "Reviews",
            url: "/dashboard/reviews",
            icon: BookOpen
        },

        {
            title: "Subsciption",
            url: "/dashboard/subsciption",
            icon: BookOpen
        },

        {
            title: "Settings",
            url: "/dashboard/settings",
            icon: Settings
        },

    ]

    const isActive = (url: string) => {
        return pathname === url || pathname.startsWith(url + '/dashboard')
    }

    if (!mounted || !session) return null

    const user = session.user;
    const userName = user.name || "GUEST";
    const userEmail = user.email || "";
    const userInitials = userName.split(" ").map((n) => n[0]).join("").toUpperCase();

    return (
        <Sidebar>
            <SidebarHeader className="border-b">
                <div className="flex flex-col gap-4 px-2 py-6">
                    <div className="flex items-center gap-4 px-3 py-4 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
                            <FaGithub className="w-6 h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-sidebar-foreground tracking-wide">
                                Connected Account
                            </p>

                            <p className="text-sm font-medium text-sidebar-foreground/90">
                                @{userName}
                            </p>
                        </div>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-6">
                <div className="mb-2">
                    <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/60">
                        Menu
                    </p>
                </div>

                <SidebarMenu className="gap-1">
                    {navigationItems.map((item) => (
                        <SidebarMenuSubItem key={item.url}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive(item.url)}
                                className="h-11 rounded-lg"
                            >
                                <Link href={item.url}>
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuSubItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t px-3 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.image ?? ""} alt={userName} />
                                        <AvatarFallback>
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="truncate text-sm font-medium">
                                            {userName}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {userEmail}
                                        </p>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                side="top"
                                className="w-56"
                            >
                                <DropdownMenuItem
                                    onClick={() =>
                                        setTheme(theme === "dark" ? "light" : "dark")
                                    }
                                >
                                    {theme === "dark" ? (
                                        <>
                                            <Sun className="mr-2 h-4 w-4" />
                                            Light Mode
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="mr-2 h-4 w-4" />
                                            Dark Mode
                                        </>
                                    )}
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <div className="flex items-center cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <Logout>Logout</Logout>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );


}

