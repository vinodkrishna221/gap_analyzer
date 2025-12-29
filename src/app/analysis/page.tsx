'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export default function AnalysisPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [careers, setCareers] = useState<any[]>([]);
    const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState<'select' | 'results'>('select');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchCareers();
        }
    }, [status]);

    const fetchCareers = async () => {
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
                setCurrentView('results');
            } else {
                alert(data.error || 'Analysis failed');
            }
        } catch (error) {
            alert('Error running analysis');
        } finally {
            setLoading(false);
        }
    };

    if (currentView === 'select') {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Analyze Your Skill Gap</h1>
                        <p className="text-xl text-gray-600">Select your target careers to see how your current skills match up.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {careers.map((career) => (
                            <Card
                                key={career._id}
                                className={`p-6 cursor-pointer transition-all duration-200 border-2 hover:shadow-lg ${selectedCareers.includes(career._id)
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-transparent hover:border-gray-200'
                                    }`}
                                onClick={() => {
                                    if (selectedCareers.includes(career._id)) {
                                        setSelectedCareers(selectedCareers.filter(id => id !== career._id));
                                    } else if (selectedCareers.length < 3) {
                                        setSelectedCareers([...selectedCareers, career._id]);
                                    } else {
                                        alert("You can only select up to 3 careers at once.");
                                    }
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-900">{career.title}</h3>
                                    {selectedCareers.includes(career._id) && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                                </div>
                                <div className="space-y-2">
                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">{career.outlook}</span>
                                    <p className="text-sm text-gray-500 line-clamp-2">{career.description}</p>
                                    <p className="text-xs text-gray-400 font-mono">{career.salaryRange}</p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <Button
                            onClick={runAnalysis}
                            disabled={selectedCareers.length === 0 || loading}
                            className="px-8 py-6 text-lg shadow-xl"
                        >
                            {loading ? 'Analyzing...' : `Analyze ${selectedCareers.length} Career(s)`}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Analysis Results</h1>
                    <Button variant="outline" onClick={() => setCurrentView('select')}>New Analysis</Button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {analyses.map((analysis, index) => (
                        <Card key={index} className="overflow-hidden">
                            <div className="p-6 border-b bg-white">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{analysis.careerName}</h2>
                                        <p className="text-gray-500">Match Score</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-blue-600">{analysis.matchScore}%</div>
                                    </div>
                                </div>
                                <Progress value={analysis.matchScore} className="h-3" />

                                {analysis.aiInsights && (
                                    <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                                            <h3 className="font-semibold text-indigo-900">AI Insights</h3>
                                        </div>
                                        <p className="text-indigo-800 leading-relaxed whitespace-pre-line">{analysis.aiInsights}</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x bg-gray-50">
                                {/* Matching Skills */}
                                <div className="p-6">
                                    <h3 className="font-semibold text-green-700 flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="h-5 w-5" /> Strong Match
                                    </h3>
                                    <div className="space-y-3">
                                        {analysis.matchingSkills.map((skill: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                                <span className="font-medium">{skill.skillName}</span>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">{skill.userProficiency}</Badge>
                                            </div>
                                        ))}
                                        {analysis.matchingSkills.length === 0 && <p className="text-sm text-gray-500 italic">No exact matches yet.</p>}
                                    </div>
                                </div>

                                {/* Partial Matches */}
                                <div className="p-6">
                                    <h3 className="font-semibold text-yellow-700 flex items-center gap-2 mb-4">
                                        <AlertCircle className="h-5 w-5" /> Needs Improvement
                                    </h3>
                                    <div className="space-y-3">
                                        {analysis.partialSkills.map((skill: any, i: number) => (
                                            <div key={i} className="bg-white p-3 rounded shadow-sm">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-medium">{skill.skillName}</span>
                                                    <span className="text-xs text-yellow-600 font-bold">Gap</span>
                                                </div>
                                                <p className="text-xs text-gray-500">{skill.gap}</p>
                                            </div>
                                        ))}
                                        {analysis.partialSkills.length === 0 && <p className="text-sm text-gray-500 italic">No partial matches.</p>}
                                    </div>
                                </div>

                                {/* Missing Skills */}
                                <div className="p-6">
                                    <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-4">
                                        <AlertCircle className="h-5 w-5" /> Missing Skills
                                    </h3>
                                    <div className="space-y-3">
                                        {analysis.missingSkills.map((skill: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded shadow-sm opacity-90">
                                                <span className="font-medium">{skill.skillName}</span>
                                                <Badge variant="outline" className="border-red-200 text-red-700">{skill.importance}</Badge>
                                            </div>
                                        ))}
                                        {analysis.missingSkills.length === 0 && <p className="text-sm text-gray-500 italic">Great job! No major skills missing.</p>}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
