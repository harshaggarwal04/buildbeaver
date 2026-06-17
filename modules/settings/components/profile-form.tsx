"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile } from '../actions';
import { toast } from 'sonner';


export function ProfileForm() {

    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const { data: profile, isLoading } = useQuery({
        queryKey: ["user-profile"],
        queryFn: async () => await getUserProfile(),
        staleTime: 1000 * 5 * 60,
        refetchOnWindowFocus: false
    })

    useEffect(() => {
        if (profile) {
            setName(profile.name || "")
            setEmail(profile.email || "")
        }
    })


    const updateMutation = useMutation({
        mutationFn: async (data: { name: string, email: string }) => {
            return await updateUserProfile(data)
        },
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ["user-profile"] })
                toast.success("Profile updated Successfully")
            }
        },
        onError: () => { toast.error("Failed to update profile") }
    })


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({ name, email })
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Profile Setting</CardTitle>
                    <CardDescription>
                        Manage your account information
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-muted rounded"></div>
                        <div className="h-10 bg-muted rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                    Manage your account information
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            disabled={updateMutation.isPending}

                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={updateMutation.isPending}

                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending
                            ? "Updating..."
                            : "Update Profile"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )








}
