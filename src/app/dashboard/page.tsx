'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SkillManager } from '@/components/dashboard/SkillManager';
import { ProfileEditor } from '@/components/dashboard/ProfileEditor';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [skills, setSkills] = useState<any[]>([]);
    const [interests, setInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        try {
            const [profileRes, skillsRes] = await Promise.all([
                fetch('/api/profile'),
                fetch('/api/profile/skills')
            ]);

            const profileData = await profileRes.json();
            const skillsData = await skillsRes.json();

            if (profileData.success) setProfile(profileData.data.profile);
            if (skillsData.success) {
                setSkills(skillsData.data.skills);
                setInterests(skillsData.data.interests);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

                {/* Profile Section */}
                <Card className="p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                    <ProfileEditor profile={profile} onUpdate={fetchData} />
                </Card>

                {/* Skills Section */}
                <Card className="p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">My Skills</h2>
                    <SkillManager
                        skills={skills}
                        interests={interests}
                        onUpdate={fetchData}
                    />
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                        <div className="text-3xl font-bold text-blue-600">{skills.length}</div>
                        <div className="text-gray-600">Skills Added</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-3xl font-bold text-green-600">{interests.length}</div>
                        <div className="text-gray-600">Interests</div>
                    </Card>
                    <Card className="p-4 flex items-center justify-center">
                        <Button
                            className="w-full"
                            onClick={() => router.push('/analysis')}
                            disabled={skills.length === 0}
                        >
                            Analyze Skill Gap →
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
