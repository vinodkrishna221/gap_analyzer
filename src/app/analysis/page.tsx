'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { Search, Loader2, Briefcase, TrendingUp, DollarSign, Sparkles, AlertCircle, BarChart3, Target } from 'lucide-react';
import {
    MeshBackground,
    MagneticButton,
    TiltCard
} from '@/components/ui/PremiumComponents';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer
} from 'recharts';

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
            // Check both suggested and searched careers
            const allCareers = [...suggestedCareers, ...careers];
            const selectedCareerData = allCareers.filter(c => selectedCareers.includes(c.id));

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

    // Prepare data for Radar Chart
    const getRadarData = (analysis: any) => {
        const missing = analysis.missingSkills.map((s: any) => ({
            subject: s.skillName,
            A: 0,
            fullMark: 100
        }));
        const partial = analysis.partialSkills.map((s: any) => ({
            subject: s.skillName,
            A: 50, // Approximation
            fullMark: 100
        }));
        const matching = analysis.matchingSkills.map((s: any) => ({
            subject: s.skillName,
            A: 100,
            fullMark: 100
        }));

        // Take top 6 skills for the chart to avoid overcrowding
        return [...matching, ...partial, ...missing].slice(0, 6);
    };

    // Helper to render career cards
    const renderCareerCard = (career: any) => (
        <GlassCard
            key={career.id}
            variant="hover"
            className={`p-6 cursor-pointer transition-all duration-300 ${selectedCareers.includes(career.id)
                ? 'ring-2 ring-primary bg-primary/10'
                : ''
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
                    <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                        <Briefcase className="h-4 w-4 text-primary" />
                        {career.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{career.description}</p>
                    {career.matchReason && (
                        <p className="text-xs text-green-500 mt-2 italic flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> {career.matchReason}
                        </p>
                    )}
                </div>
                {selectedCareers.includes(career.id) && (
                    <Badge className="bg-primary hover:bg-primary/90">Selected</Badge>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
                    <DollarSign className="h-3 w-3 text-green-400" />
                    {career.salaryRange}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
                    <TrendingUp className="h-3 w-3 text-blue-400" />
                    {career.growthOutlook}
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-1">
                {career.requiredSkills?.slice(0, 4).map((skill: any, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs border-white/10 text-muted-foreground">
                        {skill.skillName}
                    </Badge>
                ))}
                {career.requiredSkills?.length > 4 && (
                    <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">
                        +{career.requiredSkills.length - 4} more
                    </Badge>
                )}
            </div>
        </GlassCard>
    );

    const currentCareers = viewMode === 'suggested' ? suggestedCareers : careers;

    if (stage === 'select') {
        return (
            <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans selection:bg-primary selection:text-primary-foreground">
                <MeshBackground />

                <div className="relative z-10 max-w-5xl mx-auto py-12 px-4">
                    <AnimatedSection direction="up" delay={0.1}>
                        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-4 tracking-tight">
                            Analyze Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-purple-600">
                                Skill Gap
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                            Discover careers that match your skills or search for specific industries to see where you stand.
                        </p>
                    </AnimatedSection>

                    {/* Tabs: Suggested vs Search */}
                    <AnimatedSection direction="up" delay={0.2}>
                        <div className="flex gap-4 mb-8">
                            <Button
                                variant={viewMode === 'suggested' ? 'default' : 'outline'}
                                onClick={() => setViewMode('suggested')}
                                className={`flex items-center gap-2 h-10 px-6 rounded-full transition-all ${viewMode === 'suggested'
                                    ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <Sparkles className="h-4 w-4" />
                                Suggested for You
                            </Button>
                            <Button
                                variant={viewMode === 'search' ? 'default' : 'outline'}
                                onClick={() => setViewMode('search')}
                                className={`flex items-center gap-2 h-10 px-6 rounded-full transition-all ${viewMode === 'search'
                                    ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <Search className="h-4 w-4" />
                                Search by Industry
                            </Button>
                        </div>
                    </AnimatedSection>

                    {/* Needs Skills Warning */}
                    {needsSkills && viewMode === 'suggested' && (
                        <GlassCard className="p-6 mb-8 border-yellow-500/30 bg-yellow-500/10">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-yellow-500">Add your skills first</h3>
                                    <p className="text-sm text-yellow-500/80 mt-1">
                                        To get personalized career suggestions, please add your skills in your profile.
                                    </p>
                                    <Button
                                        size="sm"
                                        className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black border-none"
                                        onClick={() => router.push('/dashboard')}
                                    >
                                        Go to Profile
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {/* Search Mode UI */}
                    {viewMode === 'search' && (
                        <AnimatedSection direction="up" delay={0.1}>
                            <div className="flex gap-2 mb-8 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Enter industry or job type (e.g., Software Development, Healthcare)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && searchCareers()}
                                        className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/50"
                                    />
                                </div>
                                <Button
                                    onClick={searchCareers}
                                    disabled={searching || !searchQuery.trim()}
                                    className="h-12 px-8 rounded-xl text-md"
                                >
                                    {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
                                </Button>
                            </div>
                        </AnimatedSection>
                    )}

                    {/* Loading States */}
                    {(loadingSuggestions && viewMode === 'suggested') && (
                        <div className="text-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
                            <p className="text-muted-foreground font-medium">Loading personalized career suggestions...</p>
                        </div>
                    )}

                    {(searching && viewMode === 'search') && (
                        <div className="text-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
                            <p className="text-muted-foreground font-medium">Generating careers in {searchQuery}...</p>
                        </div>
                    )}

                    {/* Suggested Careers Section */}
                    {viewMode === 'suggested' && !loadingSuggestions && !needsSkills && suggestedCareers.length > 0 && (
                        <AnimatedSection direction="up" delay={0.3}>
                            <div className="flex items-center gap-2 mb-6 px-1">
                                <Sparkles className="h-5 w-5 text-purple-500" />
                                <p className="text-sm text-muted-foreground">
                                    Based on your skills: <span className="font-medium text-foreground">{userSkills.slice(0, 3).join(', ')}{userSkills.length > 3 && ` +${userSkills.length - 3} more`}</span>
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                {suggestedCareers.map(renderCareerCard)}
                            </div>
                        </AnimatedSection>
                    )}

                    {/* Search Results */}
                    {viewMode === 'search' && !searching && hasSearched && careers.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground">
                            No careers found. Try a different search term.
                        </div>
                    )}

                    {viewMode === 'search' && !searching && careers.length > 0 && (
                        <AnimatedSection direction="up" delay={0.2}>
                            <p className="text-sm text-muted-foreground mb-6 px-1">
                                Found {careers.length} careers in "{searchQuery}"
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                {careers.map(renderCareerCard)}
                            </div>
                        </AnimatedSection>
                    )}

                    {/* Empty state for search */}
                    {viewMode === 'search' && !searching && !hasSearched && (
                        <div className="text-center py-20 text-muted-foreground/50">
                            <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Enter an industry above to discover careers</p>
                        </div>
                    )}

                    {/* Analyze Button */}
                    <AnimatedSection direction="up" delay={0.4} className="sticky bottom-8 z-50">
                        {currentCareers.length > 0 && selectedCareers.length > 0 ? (
                            <MagneticButton
                                onClick={runAnalysis}
                                disabled={loading}
                                className="w-full max-w-md mx-auto shadow-xl shadow-primary/20 text-lg py-6"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Analyze {selectedCareers.length} Career{selectedCareers.length > 1 ? 's' : ''} <BarChart3 className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </MagneticButton>
                        ) : currentCareers.length > 0 && selectedCareers.length === 0 ? (
                            <div className="text-center bg-background/50 backdrop-blur-md py-2 px-4 rounded-full border border-white/10 w-fit mx-auto">
                                <p className="text-sm text-muted-foreground">
                                    Select up to 3 careers to analyze your skill gap
                                </p>
                            </div>
                        ) : null}
                    </AnimatedSection>
                </div>
            </div>
        );
    }

    // Results Stage
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans">
            <MeshBackground />

            <div className="relative z-10 max-w-7xl mx-auto py-12 px-4">
                <div className="flex justify-between items-center mb-12">
                    <AnimatedSection direction="right">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold">Analysis Results</h1>
                    </AnimatedSection>
                    <AnimatedSection direction="left">
                        <Button
                            variant="outline"
                            onClick={() => setStage('select')}
                            className="bg-white/5 border-white/10 hover:bg-white/10"
                        >
                            Analyze Different Careers
                        </Button>
                    </AnimatedSection>
                </div>

                <div className="space-y-16">
                    {analyses.map((analysis, idx) => (
                        <AnimatedSection key={analysis.careerId} direction="up" delay={idx * 0.1}>
                            <TiltCard className="p-0 overflow-hidden border-white/10 bg-white/5">
                                <div className="p-8 border-b border-white/10 bg-white/5">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                        <div className="flex-1">
                                            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                                {analysis.careerName}
                                                <Badge variant={analysis.matchScore > 70 ? "default" : "secondary"} className="text-lg px-3 py-1">
                                                    {analysis.matchScore}% Match
                                                </Badge>
                                            </h2>
                                            <div className="mt-2 text-muted-foreground prose prose-invert max-w-2xl text-lg leading-relaxed">
                                                <ReactMarkdown>{analysis.aiInsights}</ReactMarkdown>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-[300px] h-[250px] relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData(analysis)}>
                                                    <PolarGrid stroke="#ffffff20" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 10 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                    <Radar
                                                        name="Skills"
                                                        dataKey="A"
                                                        stroke="var(--primary)"
                                                        strokeWidth={3}
                                                        fill="var(--primary)"
                                                        fillOpacity={0.4}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                            <div className="absolute -bottom-2 w-full text-center text-xs text-muted-foreground">
                                                Skill Proficiency Radar
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <MagneticButton
                                            className="w-full md:w-auto bg-primary text-primary-foreground hover:opacity-90 px-8"
                                            onClick={() => router.push('/recommendations')}
                                        >
                                            Get Career Recommendations & Learning Resources →
                                        </MagneticButton>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
                                    {/* Missing Skills */}
                                    <div className="bg-background/40 backdrop-blur-sm p-6">
                                        <h3 className="font-semibold text-destructive mb-4 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            Missing Critical Skills
                                        </h3>
                                        <div className="space-y-3">
                                            {analysis.missingSkills.map((skill: any, i: number) => (
                                                <div key={i} className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">{skill.skillName}</span>
                                                        <Badge variant="outline" className="text-destructive border-destructive/30 text-[10px] uppercase">
                                                            {skill.importance}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Target: {skill.requiredProficiency}
                                                    </p>
                                                </div>
                                            ))}
                                            {analysis.missingSkills.length === 0 && <p className="text-sm text-muted-foreground italic">No missing skills! Great job.</p>}
                                        </div>
                                    </div>

                                    {/* Partial Skills */}
                                    <div className="bg-background/40 backdrop-blur-sm p-6">
                                        <h3 className="font-semibold text-yellow-500 mb-4 flex items-center gap-2">
                                            <Target className="h-5 w-5" />
                                            Skills to Improve
                                        </h3>
                                        <div className="space-y-3">
                                            {analysis.partialSkills.map((skill: any, i: number) => (
                                                <div key={i} className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                                                    <div className="font-medium">{skill.skillName}</div>
                                                    <div className="text-xs text-yellow-500/80 mt-1">{skill.gap}</div>
                                                </div>
                                            ))}
                                            {analysis.partialSkills.length === 0 && <p className="text-sm text-muted-foreground italic">No partial matches.</p>}
                                        </div>
                                    </div>

                                    {/* Matching Skills */}
                                    <div className="bg-background/40 backdrop-blur-sm p-6">
                                        <h3 className="font-semibold text-green-500 mb-4 flex items-center gap-2">
                                            <Sparkles className="h-5 w-5" />
                                            Strong Matches
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.matchingSkills.map((skill: any, i: number) => (
                                                <Badge key={i} className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 px-3 py-1">
                                                    {skill.skillName}
                                                </Badge>
                                            ))}
                                            {analysis.matchingSkills.length === 0 && <p className="text-sm text-muted-foreground italic">No matches yet.</p>}
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </div>
    );
}
