'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ProfileEditor({ profile, onUpdate }: any) {
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        education: {
            institution: profile?.education?.institution || '',
            level: profile?.education?.level || '',
            fieldOfStudy: profile?.education?.fieldOfStudy || ''
        }
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert('Profile updated successfully');
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Institution</label>
                <Input
                    value={formData.education.institution}
                    onChange={(e) => setFormData({
                        ...formData,
                        education: { ...formData.education, institution: e.target.value }
                    })}
                    placeholder="University Name"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Level</label>
                    <Input
                        value={formData.education.level}
                        onChange={(e) => setFormData({
                            ...formData,
                            education: { ...formData.education, level: e.target.value }
                        })}
                        placeholder="Bachelor's, Master's, etc."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Field of Study</label>
                    <Input
                        value={formData.education.fieldOfStudy}
                        onChange={(e) => setFormData({
                            ...formData,
                            education: { ...formData.education, fieldOfStudy: e.target.value }
                        })}
                        placeholder="Computer Science"
                    />
                </div>
            </div>
            <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
            </Button>
        </form>
    );
}
