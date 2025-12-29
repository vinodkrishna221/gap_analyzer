'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfileForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        education: {
            level: '',
            institution: '',
            fieldOfStudy: '',
            graduationYear: new Date().getFullYear()
        }
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                if (data.data?.profile) {
                    setFormData({
                        name: data.data.profile.name || '',
                        education: {
                            level: data.data.profile.education?.level || '',
                            institution: data.data.profile.education?.institution || '',
                            fieldOfStudy: data.data.profile.education?.fieldOfStudy || '',
                            graduationYear: data.data.profile.education?.graduationYear || new Date().getFullYear()
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your personal details and educational background.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {message && (
                        <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="level">Education Level</Label>
                            <Select
                                value={formData.education.level}
                                onValueChange={(val) => setFormData({
                                    ...formData,
                                    education: { ...formData.education, level: val }
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High School">High School</SelectItem>
                                    <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                                    <SelectItem value="Master's">Master's</SelectItem>
                                    <SelectItem value="PhD">PhD</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year">Graduation Year</Label>
                            <Input
                                id="year"
                                type="number"
                                value={formData.education.graduationYear}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    education: { ...formData.education, graduationYear: parseInt(e.target.value) }
                                })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="institution">Institution / University</Label>
                        <Input
                            id="institution"
                            value={formData.education.institution}
                            onChange={(e) => setFormData({
                                ...formData,
                                education: { ...formData.education, institution: e.target.value }
                            })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="field">Field of Study</Label>
                        <Input
                            id="field"
                            value={formData.education.fieldOfStudy}
                            onChange={(e) => setFormData({
                                ...formData,
                                education: { ...formData.education, fieldOfStudy: e.target.value }
                            })}
                        />
                    </div>

                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
