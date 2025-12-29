'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from 'lucide-react';

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export function SkillManager({ skills, interests, onUpdate }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedSkills, setSelectedSkills] = useState(skills);
    const [newInterest, setNewInterest] = useState('');
    const [currentInterests, setCurrentInterests] = useState(interests);
    const [saving, setSaving] = useState(false);

    const searchSkills = async (query: string) => {
        if (query.length < 2) return;
        try {
            const res = await fetch(`/api/skills/search?q=${query}`);
            const data = await res.json();
            if (data.success) setSearchResults(data.data.skills);
        } catch (e) {
            console.error("Failed to search skills", e);
        }
    };

    const addSkill = (skill: any) => {
        if (selectedSkills.find((s: any) => s.skillId === skill._id)) return;

        setSelectedSkills([...selectedSkills, {
            skillId: skill._id,
            skillName: skill.name,
            proficiencyLevel: 'Beginner',
            addedDate: new Date()
        }]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const updateSkillProficiency = (skillId: string, level: string) => {
        setSelectedSkills(selectedSkills.map((s: any) =>
            s.skillId === skillId ? { ...s, proficiencyLevel: level } : s
        ));
    };

    const removeSkill = (skillId: string) => {
        setSelectedSkills(selectedSkills.filter((s: any) => s.skillId !== skillId));
    };

    const addInterest = () => {
        if (newInterest && !currentInterests.includes(newInterest)) {
            setCurrentInterests([...currentInterests, newInterest]);
            setNewInterest('');
        }
    };

    const removeInterest = (interest: string) => {
        setCurrentInterests(currentInterests.filter((i: string) => i !== interest));
    };

    const saveSkills = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/profile/skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skills: selectedSkills,
                    interests: currentInterests
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('Skills saved successfully!');
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            alert('Error saving skills');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Skill Search */}
            <div>
                <label className="block text-sm font-medium mb-2">Add Skills</label>
                <div className="relative">
                    <Input
                        placeholder="Search for skills (e.g., JavaScript, Python...)"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            searchSkills(e.target.value);
                        }}
                    />
                    {searchResults.length > 0 && searchQuery.length >= 2 && (
                        <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-y-auto shadow-lg">
                            {searchResults.map((skill) => (
                                <div
                                    key={skill._id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => addSkill(skill)}
                                >
                                    <div className="font-medium">{skill.name}</div>
                                    <div className="text-xs text-gray-500">{skill.category} - {skill.subcategory}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Skills */}
            <div>
                <label className="block text-sm font-medium mb-2">Your Skills ({selectedSkills.length})</label>
                <div className="space-y-3">
                    {selectedSkills.map((skill: any) => (
                        <div key={skill.skillId} className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex-1">
                                <div className="font-medium">{skill.skillName}</div>
                            </div>
                            <Select
                                value={skill.proficiencyLevel}
                                onValueChange={(value) => updateSkillProficiency(skill.skillId, value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROFICIENCY_LEVELS.map(level => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSkill(skill.skillId)}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                    {selectedSkills.length === 0 && (
                        <div className="text-gray-500 text-center py-4">
                            No skills added yet. Search above to add skills.
                        </div>
                    )}
                </div>
            </div>

            {/* Interests */}
            <div>
                <label className="block text-sm font-medium mb-2">Interests</label>
                <div className="flex gap-2 mb-3">
                    <Input
                        placeholder="Add interest (e.g., Web Development, AI)"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    />
                    <Button onClick={addInterest}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {currentInterests.map((interest: string) => (
                        <Badge key={interest} className="px-3 py-1 gap-2">
                            {interest}
                            <button
                                onClick={() => removeInterest(interest)}
                                className="hover:text-red-200 focus:outline-none"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <Button
                onClick={saveSkills}
                disabled={saving}
                className="w-full"
            >
                {saving ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
    );
}
