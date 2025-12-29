'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Skill {
    skillId?: string;
    skillName: string;
    proficiencyLevel: string;
}

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function SkillSelector() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [interests, setInterests] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await fetch('/api/profile/skills');
            if (res.ok) {
                const data = await res.json();
                setSkills(data.data.skills || []);
                setInterests(data.data.interests || []);
            }
        } catch (error) {
            console.error('Failed to fetch skills', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = () => {
        if (!newSkill.trim()) return;
        if (skills.some(s => s.skillName.toLowerCase() === newSkill.toLowerCase())) return;

        setSkills([...skills, {
            skillName: newSkill,
            proficiencyLevel: 'Beginner'
        }]);
        setNewSkill('');
    };

    const removeSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const updateProficiency = (index: number, value: number[]) => {
        const levelIndex = Math.floor((value[0] / 100) * (PROFICIENCY_LEVELS.length - 1));
        const newSkills = [...skills];
        newSkills[index].proficiencyLevel = PROFICIENCY_LEVELS[levelIndex];
        setSkills(newSkills);
    };

    const getSliderValue = (level: string) => {
        const index = PROFICIENCY_LEVELS.indexOf(level);
        return index === -1 ? 0 : (index / (PROFICIENCY_LEVELS.length - 1)) * 100;
    };

    const handleAddInterest = () => {
        if (!newInterest.trim()) return;
        if (interests.includes(newInterest.trim())) return;
        setInterests([...interests, newInterest.trim()]);
        setNewInterest('');
    };

    const removeInterest = (interest: string) => {
        setInterests(interests.filter(i => i !== interest));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/profile/skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills, interests })
            });
            // Optionally show success message
        } catch (error) {
            console.error('Failed to save skills', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading skills...</div>;

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Skills & Interests</CardTitle>
                <CardDescription>Add your technical skills and career interests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Skills Section */}
                <div className="space-y-4">
                    <Label>My Skills</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a skill (e.g. React, Python)"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                        />
                        <Button onClick={handleAddSkill} type="button" variant="secondary">Add</Button>
                    </div>

                    <div className="space-y-4 mt-4">
                        {skills.map((skill, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium">{skill.skillName}</div>
                                    <div className="text-sm text-gray-500">{skill.proficiencyLevel}</div>
                                </div>
                                <div className="w-32">
                                    <Slider
                                        defaultValue={[getSliderValue(skill.proficiencyLevel)]}
                                        max={100}
                                        step={33}
                                        onValueChange={(val) => updateProficiency(index, val)}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSkill(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ×
                                </Button>
                            </div>
                        ))}
                        {skills.length === 0 && <p className="text-sm text-gray-500">No skills added yet.</p>}
                    </div>
                </div>

                {/* Interests Section */}
                <div className="space-y-4">
                    <Label>Interests</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add an interest (e.g. Data Science)"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                        />
                        <Button onClick={handleAddInterest} type="button" variant="secondary">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {interests.map((interest, index) => (
                            <Badge key={index} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                {interest}
                                <button
                                    onClick={() => removeInterest(interest)}
                                    className="hover:bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center ml-1"
                                >
                                    ×
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>

            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Skills'}
                </Button>
            </CardFooter>
        </Card>
    );
}
