'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProfileForm from '@/components/dashboard/ProfileForm';
import SkillSelector from '@/components/dashboard/SkillSelector';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header Skeleton */}
                    <div className="h-20 w-1/3 bg-muted rounded-xl animate-pulse" />

                    {/* Bento Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 h-[400px] bg-muted/50 rounded-xl animate-pulse" />
                        <div className="h-[400px] bg-muted/50 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <AnimatedSection>
                    <div className="mb-8">
                        <h1 className="text-4xl font-heading font-bold text-foreground">
                            Welcome back, <span className="text-primary">{session.user?.name || 'Explorer'}</span>
                        </h1>
                        <p className="mt-2 text-muted-foreground text-lg">
                            Manage your profile and track your growth.
                        </p>
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area - 2 Columns */}
                    <div className="lg:col-span-2 space-y-8">
                        <AnimatedSection delay={0.1}>
                            <GlassCard className="p-8">
                                <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
                                <ProfileForm />
                            </GlassCard>
                        </AnimatedSection>
                    </div>

                    {/* Sidebar Area - 1 Column */}
                    <div className="space-y-8">
                        <AnimatedSection delay={0.2}>
                            <GlassCard className="p-8 h-full bg-secondary/30 border-secondary">
                                <h2 className="text-2xl font-bold mb-6">Your Skills</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Select your proficiencies to get better recommendations.
                                </p>
                                <SkillSelector />
                            </GlassCard>
                        </AnimatedSection>
                    </div>
                </div>
            </div>
        </div>
    );
}
