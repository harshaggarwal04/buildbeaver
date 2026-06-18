"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getConnectedRepositories, disconnectRepository, disconnectAllRepositories } from '../actions';
import { toast } from 'sonner';


import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ExternalLink, Trash2, AlertTriangle } from 'lucide-react';


export function RepositoryList() {
    const queryClient = useQueryClient();

    const [disconnectAllOpen, setDisconnectedAllOpen] = useState(false);

    const { data: repositories, isLoading } = useQuery({
        queryKey: ['connected-repositories'],
        queryFn: async () => await getConnectedRepositories(),
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false
    });

    const disconnectMutation = useMutation({
        mutationFn: async (repositoryId: string) => {
            return await disconnectRepository(repositoryId);
        },

        onSuccess: (result) => {
            if (result?.success) {
                queryClient.invalidateQueries({ queryKey: ["connected-repositories"] })
                queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
                toast.success("Repository disconnected successfully");
            } else {
                toast.error(result?.error || "failed to disconnect repository");
            }
        },


    })


    const disconnectAllMutation = useMutation({
        mutationFn: async () => {
            return await disconnectAllRepositories();
        },

        onSuccess: (result) => {
            if (result?.success) {
                queryClient.invalidateQueries({ queryKey: ["connected-repositories"] })
                queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
                toast.success(`Disconnected ${result.count} repositories successfully`);
                setDisconnectedAllOpen(false)
            } else {
                toast.error(result?.error || "failed to disconnect repository");
            }
        },


    });


    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Connected Repositories</CardTitle>
                    <CardDescription>
                        Manage repositories connected to BuildBeavern
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
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Connected Repositories</CardTitle>
                        <CardDescription>
                            Manage repositories connected to BuildBeaver
                        </CardDescription>
                    </div>

                    {repositories && repositories.length > 0 && (
                        <Button
                            variant="destructive"
                            onClick={() => setDisconnectedAllOpen(true)}
                            disabled={disconnectAllMutation.isPending}
                        >
                            Disconnect All
                        </Button>
                    )}
                </CardHeader>

                <CardContent>
                    {!repositories || repositories.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No repositories connected yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {repositories.map((repo) => (
                                <div
                                    key={repo.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">
                                                {repo.name}
                                            </h3>

                                            <Badge variant="secondary">
                                                Connected
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {repo.fullName}
                                        </p>

                                        <a
                                            href={repo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                        >
                                            View Repository
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                disabled={disconnectMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>

                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Disconnect Repository
                                                </AlertDialogTitle>

                                                <AlertDialogDescription>
                                                    Are you sure you want to disconnect{" "}
                                                    <strong>{repo.name}</strong>?
                                                    This will remove webhook integration
                                                    and stop code reviews.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>

                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>

                                                <AlertDialogAction
                                                    onClick={() =>
                                                        disconnectMutation.mutate(
                                                            repo.id
                                                        )
                                                    }
                                                >
                                                    Disconnect
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog
                open={disconnectAllOpen}
                onOpenChange={setDisconnectedAllOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Disconnect All Repositories
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            This action cannot be undone. All connected repositories
                            will be disconnected and their GitHub webhooks will be
                            removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={() => disconnectAllMutation.mutate()}
                        >
                            Disconnect All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

