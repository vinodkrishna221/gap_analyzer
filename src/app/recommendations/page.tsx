'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function RecommendationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [selectedCareer, setSelectedCareer] = useState<any>(null);
    const [learningPaths, setLearningPaths] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState<'recommendations' | 'learning'>('recommendations');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchRecommendations();
        }
    }, [status]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/recommendations/careers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            if (data.success) {
                setRecommendations(data.data.recommendations);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLearningPath = async (career: any) => {
        setSelectedCareer(career);
        setLoading(true);

        try {
            const res = await fetch('/api/recommendations/learning-paths', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ missingSkills: career.missingSkills })
            });

            const data = await res.json();
            if (data.success) {
                setLearningPaths(data.data.learningPaths);
                setStage('learning');
            }
        } catch (error) {
            alert('Error generating learning path');
        } finally {
            setLoading(false);
        }
    };

    if (loading && recommendations.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div>Analyzing careers and generating recommendations...</div>
                </div>
            </div>
        );
    }

    if (stage === 'recommendations') {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">Career Recommendations</h1>
                    <p className="text-gray-600 mb-8">
                        Based on your skills and interests, here are the best career matches for you.
                    </p>

                    <div className="space-y-6">
                        {recommendations.map((rec, idx) => (
                            <Card key={idx} className="p-6 hover:shadow-lg transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold">{rec.careerName}</h2>
                                            <Badge variant="outline" className="text-lg">
                                                {rec.matchScore}% Match
                                            </Badge>
                                        </div>
                                        <p className="text-gray-700 mb-3">{rec.description}</p>

                                        {/* AI Reasoning */}
                                        <div className="bg-blue-50 p-3 rounded mb-4">
                                            <p className="text-sm text-gray-700">{rec.reasoning}</p>
                                        </div>

                                        {/* Salary & Growth */}
                                        <div className="flex gap-6 text-sm mb-4">
                                            {rec.salaryRange && (
                                                <div>
                                                    <span className="text-gray-600">Entry Salary:</span>
                                                    <span className="font-medium ml-2">
                                                        ${rec.salaryRange.min?.toLocaleString()} - ${rec.salaryRange.max?.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {rec.growthOutlook && (
                                                <div>
                                                    <span className="text-gray-600">Growth:</span>
                                                    <Badge
                                                        className="ml-2"
                                                        variant={rec.growthOutlook === 'High Growth' ? 'default' : 'outline'}
                                                    >
                                                        {rec.growthOutlook}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-6">
                                        <Progress value={rec.matchScore} className="w-24 mb-2" />
                                    </div>
                                </div>

                                {/* Skills Breakdown */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-green-600 text-sm mb-2">
                                            ✓ Your Matching Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-1">
                                            {rec.matchingSkills?.map((skill: string, i: number) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-red-600 text-sm mb-2">
                                            ✗ Skills to Learn
                                        </h3>
                                        <div className="flex flex-wrap gap-1">
                                            {rec.missingSkills?.map((skill: string, i: number) => (
                                                <Badge key={i} variant="destructive" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={() => getLearningPath(rec)}
                                    disabled={rec.missingSkills?.length === 0}
                                >
                                    {rec.missingSkills?.length === 0
                                        ? 'You\'re Ready!'
                                        : 'Get Personalized Learning Path →'
                                    }
                                </Button>
                            </Card>
                        ))}
                    </div>

                    {recommendations.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600 mb-4">No recommendations yet.</p>
                            <Button onClick={() => router.push('/dashboard')}>
                                Add Skills to Get Started
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Learning Path Stage
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Your Learning Path</h1>
                        <p className="text-gray-600 mt-2">
                            For: <span className="font-semibold">{selectedCareer?.careerName}</span>
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => setStage('recommendations')}>
                        ← Back to Recommendations
                    </Button>
                </div>

                <div className="space-y-8">
                    {learningPaths.map((path, idx) => (
                        <Card key={idx} className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold mb-2">{path.skill}</h2>

                                    {/* AI Learning Strategy */}
                                    <div className="bg-blue-50 p-4 rounded mb-4">
                                        <h3 className="font-bold text-sm mb-2">📚 Learning Strategy</h3>
                                        <p className="text-gray-700">{path.strategy}</p>
                                    </div>

                                    {/* Learning Resources */}
                                    <h3 className="font-bold mb-3">Recommended Resources</h3>
                                    <div className="space-y-3">
                                        {path.resources.map((resource: any, rIdx: number) => (
                                            <div key={rIdx} className="flex items-center justify-between p-3 bg-white border rounded hover:shadow transition">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium">{resource.title}</h4>
                                                        {resource.isFree && (
                                                            <Badge variant="outline" className="text-xs">FREE</Badge>
                                                        )}
                                                        <Badge variant="secondary" className="text-xs">
                                                            {resource.difficulty}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {resource.provider} • {resource.type} • {resource.duration}
                                                        {resource.rating && ` • ⭐ ${resource.rating}/5`}
                                                    </div>
                                                </div>
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button size="sm">Start →</Button>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <Card className="p-6 mt-8 bg-green-50 border-green-200">
                    <h3 className="font-bold text-lg mb-2">🎯 Next Steps</h3>
                    <ul className="space-y-2 text-gray-700">
                        <li>1. Start with the first skill and complete at least one beginner course</li>
                        <li>2. Build a project to practice each skill as you learn</li>
                        <li>3. Track your progress in your profile</li>
                        <li>4. Re-analyze your skill gap every month to see improvement</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}
