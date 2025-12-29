'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

export default function AnalysisPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [careers, setCareers] = useState<any[]>([]);
    const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState<'select' | 'results'>('select');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchCareers();
        }
    }, [status]);

    const fetchCareers = async () => {
        // Note: this endpoint is owned by Member 4
        try {
            const res = await fetch('/api/careers');
            const data = await res.json();
            if (data.success) setCareers(data.data.careers);
        } catch (e) {
            console.error("Failed to fetch careers", e);
        }
    };

    const runAnalysis = async () => {
        if (selectedCareers.length === 0) {
            alert('Please select at least one career');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/analysis/skill-gap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ careerIds: selectedCareers })
            });

            const data = await res.json();
            if (data.success) {
                setAnalyses(data.data.analyses);
                setStage('results');
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    if (stage === 'select') {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4">Analyze Your Skill Gap</h1>
                    <p className="text-gray-600 mb-8">
                        Select up to 3 careers you're interested in to see how your skills match up.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {careers.map((career) => (
                            <Card
                                key={career._id}
                                className={`p-4 cursor-pointer transition ${selectedCareers.includes(career._id)
                                    ? 'ring-2 ring-blue-600 bg-blue-50'
                                    : 'hover:shadow-lg'
                                    }`}
                                onClick={() => {
                                    if (selectedCareers.includes(career._id)) {
                                        setSelectedCareers(selectedCareers.filter(id => id !== career._id));
                                    } else if (selectedCareers.length < 3) {
                                        setSelectedCareers([...selectedCareers, career._id]);
                                    }
                                }}
                            >
                                <h3 className="font-bold text-lg">{career.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{career.description?.slice(0, 100)}...</p>
                            </Card>
                        ))}
                        {careers.length === 0 && <p>No careers available to select. (Waiting for Member 4)</p>}
                    </div>

                    <Button
                        onClick={runAnalysis}
                        disabled={selectedCareers.length === 0 || loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? 'Analyzing...' : `Analyze ${selectedCareers.length} Career(s)`}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Analysis Results</h1>
                    <Button variant="outline" onClick={() => setStage('select')}>
                        Analyze Different Careers
                    </Button>
                </div>

                {analyses.map((analysis) => (
                    <div key={analysis.careerId} className="mb-12">
                        <Card className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">{analysis.careerName}</h2>
                                    <div className="mt-2 text-gray-600 max-w-2xl prose prose-sm dark:prose-invert">
                                        <ReactMarkdown>{analysis.aiInsights}</ReactMarkdown>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-600">
                                        {analysis.matchScore}%
                                    </div>
                                    <div className="text-sm text-gray-500">Match Score</div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    onClick={() => router.push('/recommendations')}
                                >
                                    Get Career Recommendations & Learning Resources →
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Missing Skills */}
                                <div>
                                    <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                        Missing Critical Skills
                                    </h3>
                                    <div className="space-y-3">
                                        {analysis.missingSkills.map((skill: any, i: number) => (
                                            <div key={i} className="bg-red-50 p-3 rounded border border-red-100">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{skill.skillName}</span>
                                                    <Badge variant="outline" className="text-red-600 border-red-200">
                                                        {skill.importance}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Target: {skill.requiredProficiency}
                                                </p>
                                            </div>
                                        ))}
                                        {analysis.missingSkills.length === 0 && <p className="text-sm text-gray-500">No missing skills!</p>}
                                    </div>
                                </div>

                                {/* Partial/Matching Skills */}
                                <div>
                                    <h3 className="font-semibold text-yellow-600 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
                                        Skills to Improve
                                    </h3>
                                    <div className="space-y-3">
                                        {analysis.partialSkills.map((skill: any, i: number) => (
                                            <div key={i} className="bg-yellow-50 p-3 rounded border border-yellow-100">
                                                <div className="font-medium">{skill.skillName}</div>
                                                <div className="text-sm text-yellow-700 mt-1">{skill.gap}</div>
                                            </div>
                                        ))}
                                        {analysis.partialSkills.length === 0 && <p className="text-sm text-gray-500">No partial matches.</p>}
                                    </div>

                                    <h3 className="font-semibold text-green-600 mt-6 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                        Strong Matches
                                    </h3>
                                    <div className="space-y-2">
                                        {analysis.matchingSkills.map((skill: any, i: number) => (
                                            <Badge key={i} className="mr-2 mb-2 bg-green-100 text-green-800 hover:bg-green-200">
                                                {skill.skillName} ({skill.userProficiency})
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
