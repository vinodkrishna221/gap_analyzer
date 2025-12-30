'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { Search, Loader2, Briefcase, TrendingUp, DollarSign, Sparkles, AlertCircle } from 'lucide-react';

export default function AnalysisPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [careers, setCareers] = useState<any[]>([]);
    const [suggestedCareers, setSuggestedCareers] = useState<any[]>([]);
    const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [stage, setStage] = useState<'select' | 'results'>('select');
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [userSkills, setUserSkills] = useState<string[]>([]);
    const [needsSkills, setNeedsSkills] = useState(false);
    const [viewMode, setViewMode] = useState<'suggested' | 'search'>('suggested');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            loadSuggestions();
        }
    }, [status, router]);

    const loadSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const res = await fetch('/api/careers/suggestions');
            const data = await res.json();
            if (data.success) {
                setSuggestedCareers(data.data.careers);
                setUserSkills(data.data.basedOnSkills || []);
            } else if (data.needsSkills) {
                setNeedsSkills(true);
            }
        } catch (e) {
            console.error("Failed to load suggestions", e);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const searchCareers = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        setSelectedCareers([]);
        try {
            const res = await fetch(`/api/careers/search?keyword=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data.success) {
                setCareers(data.data.careers);
                setHasSearched(true);
                setViewMode('search');
            } else {
                alert(data.error || 'Search failed');
            }
        } catch (e) {
            console.error("Failed to search careers", e);
            alert('Failed to search careers');
        } finally {
            setSearching(false);
        }
    };

    const runAnalysis = async () => {
        if (selectedCareers.length === 0) {
            alert('Please select at least one career');
            return;
        }

        setLoading(true);
        try {
            // For AI-generated careers, we pass the full career data
            const selectedCareerData = careers.filter(c => selectedCareers.includes(c.id));

            const res = await fetch('/api/analysis/skill-gap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aiCareers: selectedCareerData
                })
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

    // Helper to render career cards
    const renderCareerCard = (career: any) => (
        <Card
            key={career.id}
            className={`p-4 cursor-pointer transition ${selectedCareers.includes(career.id)
                ? 'ring-2 ring-blue-600 bg-blue-50'
                : 'hover:shadow-lg'
                }`}
            onClick={() => {
                if (selectedCareers.includes(career.id)) {
                    setSelectedCareers(selectedCareers.filter(id => id !== career.id));
                } else if (selectedCareers.length < 3) {
                    setSelectedCareers([...selectedCareers, career.id]);
                }
            }}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        {career.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{career.description}</p>
                    {career.matchReason && (
                        <p className="text-xs text-green-600 mt-1 italic">✨ {career.matchReason}</p>
                    )}
                </div>
                {selectedCareers.includes(career.id) && (
                    <Badge className="bg-blue-600">Selected</Badge>
                )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <DollarSign className="h-3 w-3" />
                    {career.salaryRange}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    {career.growthOutlook}
                </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
                {career.requiredSkills?.slice(0, 4).map((skill: any, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                        {skill.skillName}
                    </Badge>
                ))}
                {career.requiredSkills?.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                        +{career.requiredSkills.length - 4} more
                    </Badge>
                )}
            </div>
        </Card>
    );

    const currentCareers = viewMode === 'suggested' ? suggestedCareers : careers;

    if (stage === 'select') {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">Analyze Your Skill Gap</h1>
                    <p className="text-gray-600 mb-6">
                        Discover careers that match your skills or search for specific industries.
                    </p>

                    {/* Tabs: Suggested vs Search */}
                    <div className="flex gap-2 mb-6">
                        <Button
                            variant={viewMode === 'suggested' ? 'default' : 'outline'}
                            onClick={() => setViewMode('suggested')}
                            className="flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            Suggested for You
                        </Button>
                        <Button
                            variant={viewMode === 'search' ? 'default' : 'outline'}
                            onClick={() => setViewMode('search')}
                            className="flex items-center gap-2"
                        >
                            <Search className="h-4 w-4" />
                            Search by Industry
                        </Button>
                    </div>

                    {/* Needs Skills Warning */}
                    {needsSkills && viewMode === 'suggested' && (
                        <Card className="p-6 mb-6 border-yellow-200 bg-yellow-50">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-yellow-800">Add your skills first</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        To get personalized career suggestions, please add your skills in your profile.
                                    </p>
                                    <Button
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => router.push('/dashboard')}
                                    >
                                        Go to Profile
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Search Mode UI */}
                    {viewMode === 'search' && (
                        <div className="flex gap-2 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Enter industry or job type (e.g., Software Development, Healthcare)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchCareers()}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={searchCareers} disabled={searching || !searchQuery.trim()}>
                                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                            </Button>
                        </div>
                    )}

                    {/* Loading States */}
                    {(loadingSuggestions && viewMode === 'suggested') && (
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                            <p className="mt-4 text-gray-600">Loading personalized career suggestions...</p>
                        </div>
                    )}

                    {(searching && viewMode === 'search') && (
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                            <p className="mt-4 text-gray-600">Generating careers in {searchQuery}...</p>
                        </div>
                    )}

                    {/* Suggested Careers Section */}
                    {viewMode === 'suggested' && !loadingSuggestions && !needsSkills && suggestedCareers.length > 0 && (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                                <p className="text-sm text-gray-600">
                                    Based on your skills: <span className="font-medium">{userSkills.slice(0, 3).join(', ')}{userSkills.length > 3 && ` +${userSkills.length - 3} more`}</span>
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {suggestedCareers.map(renderCareerCard)}
                            </div>
                        </>
                    )}

                    {/* Search Results */}
                    {viewMode === 'search' && !searching && hasSearched && careers.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No careers found. Try a different search term.
                        </div>
                    )}

                    {viewMode === 'search' && !searching && careers.length > 0 && (
                        <>
                            <p className="text-sm text-gray-500 mb-4">
                                Found {careers.length} careers in "{searchQuery}"
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {careers.map(renderCareerCard)}
                            </div>
                        </>
                    )}

                    {/* Empty state for search */}
                    {viewMode === 'search' && !searching && !hasSearched && (
                        <div className="text-center py-12 text-gray-400">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Enter an industry above to discover careers</p>
                        </div>
                    )}

                    {/* Analyze Button */}
                    {currentCareers.length > 0 && selectedCareers.length > 0 && (
                        <Button
                            onClick={runAnalysis}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? 'Analyzing...' : `Analyze ${selectedCareers.length} Career(s)`}
                        </Button>
                    )}

                    {currentCareers.length > 0 && selectedCareers.length === 0 && (
                        <p className="text-center text-sm text-gray-500">
                            Select up to 3 careers to analyze your skill gap
                        </p>
                    )}
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
