'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Briefcase,
    BookOpen,
    ArrowRight,
    TrendingUp,
    DollarSign,
    Sparkles,
    Target,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
    MeshBackground,
    MagneticButton,
    TiltCard,
} from '@/components/ui/PremiumComponents';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export default function RecommendationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
                <MeshBackground />
                <div className="relative z-10 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-6"></div>
                    <div className="text-xl font-heading font-medium text-foreground">Analyzing your profile & finding best matches...</div>
                </div>
            </div>
        );
    }

    if (stage === 'recommendations') {
        return (
            <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans">
                <MeshBackground />
                <div className="max-w-6xl mx-auto py-12 px-4 relative z-10">
                    <AnimatedSection direction="up">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                            Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Recommendations</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
                            AI-curated career paths perfectly matched to your unique skill profile.
                        </p>
                    </AnimatedSection>

                    <div className="space-y-8">
                        {recommendations.map((rec, idx) => (
                            <AnimatedSection key={idx} direction="up" delay={idx * 0.1}>
                                <GlassCard variant="hover" className="p-8 group">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <h2 className="text-3xl font-bold flex items-center gap-3">
                                                    <Briefcase className="h-6 w-6 text-primary" />
                                                    {rec.careerName}
                                                </h2>
                                                <Badge className={`text-sm px-3 py-1 ${rec.matchScore > 80 ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"}`}>
                                                    {rec.matchScore}% Match
                                                </Badge>
                                            </div>
                                            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{rec.description}</p>

                                            {/* AI Reasoning */}
                                            <div className="bg-primary/5 border border-primary/10 p-5 rounded-xl mb-6 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
                                                <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-2 uppercase tracking-wider">
                                                    <Sparkles className="h-4 w-4" /> Why this fits you
                                                </h4>
                                                <div className="text-foreground/90 prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown>{rec.reasoning}</ReactMarkdown>
                                                </div>
                                            </div>

                                            {/* Salary & Growth */}
                                            <div className="flex flex-wrap gap-6 text-sm mb-6">
                                                {rec.salaryRange && (
                                                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                                                        <DollarSign className="h-4 w-4 text-green-400" />
                                                        <span className="text-muted-foreground">Entry Salary:</span>
                                                        <span className="font-semibold text-foreground">
                                                            ${rec.salaryRange.min?.toLocaleString()} - ${rec.salaryRange.max?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {rec.growthOutlook && (
                                                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                                                        <TrendingUp className="h-4 w-4 text-blue-400" />
                                                        <span className="text-muted-foreground">Growth:</span>
                                                        <span className={`font-semibold ${rec.growthOutlook.includes('High') ? 'text-green-400' : 'text-blue-400'}`}>
                                                            {rec.growthOutlook}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="hidden md:block">
                                            <div className="relative h-32 w-32 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle
                                                        cx="64"
                                                        cy="64"
                                                        r="56"
                                                        stroke="currentColor"
                                                        strokeWidth="12"
                                                        fill="transparent"
                                                        className="text-white/5"
                                                    />
                                                    <circle
                                                        cx="64"
                                                        cy="64"
                                                        r="56"
                                                        stroke="currentColor"
                                                        strokeWidth="12"
                                                        fill="transparent"
                                                        strokeDasharray={351.86}
                                                        strokeDashoffset={351.86 - (351.86 * rec.matchScore) / 100}
                                                        className="text-primary transition-all duration-1000 ease-out"
                                                    />
                                                </svg>
                                                <span className="absolute text-2xl font-bold">{rec.matchScore}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills Breakdown */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-6 border-t border-white/10">
                                        <div>
                                            <h3 className="font-bold text-green-500 text-sm mb-3 flex items-center gap-2 uppercase tracking-wider">
                                                <CheckCircle2 className="h-4 w-4" /> Your Matching Skills
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {rec.matchingSkills?.map((skill: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20 px-3 py-1">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-destructive text-sm mb-3 flex items-center gap-2 uppercase tracking-wider">
                                                <Target className="h-4 w-4" /> Skills to Master
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {rec.missingSkills?.map((skill: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="border-destructive/30 text-destructive bg-destructive/10 hover:bg-destructive/20 px-3 py-1">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <MagneticButton
                                        className="w-full shadow-lg shadow-primary/10"
                                        onClick={() => getLearningPath(rec)}
                                        disabled={rec.missingSkills?.length === 0}
                                    >
                                        {rec.missingSkills?.length === 0
                                            ? 'You\'re Ready! Apply Now'
                                            : 'Get Personalized Learning Path →'
                                        }
                                    </MagneticButton>
                                </GlassCard>
                            </AnimatedSection>
                        ))}
                    </div>

                    {recommendations.length === 0 && !loading && (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                            <p className="text-xl text-muted-foreground mb-6">No matching recommendations found yet.</p>
                            <MagneticButton onClick={() => router.push('/dashboard')}>
                                Add More Skills to Get Matches
                            </MagneticButton>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Learning Path Stage
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans">
            <MeshBackground />
            <div className="max-w-6xl mx-auto py-12 px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                    <div>
                        <AnimatedSection direction="right">
                            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">
                                Learning <span className="text-primary">Path</span>
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Mastering skills for: <span className="font-bold text-foreground">{selectedCareer?.careerName}</span>
                            </p>
                        </AnimatedSection>
                    </div>
                    <AnimatedSection direction="left">
                        <Button variant="outline" onClick={() => setStage('recommendations')} className="bg-white/5 border-white/10 hover:bg-white/10">
                            ← Back to Recommendations
                        </Button>
                    </AnimatedSection>
                </div>

                <div className="space-y-12 relative">
                    {/* Vertical Line for timeline effect */}
                    <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-transparent hidden md:block opacity-30"></div>

                    {learningPaths.map((path, idx) => (
                        <AnimatedSection key={idx} direction="up" delay={idx * 0.1}>
                            <div className="relative pl-0 md:pl-16">
                                {/* Number Badge */}
                                <div className="absolute left-0 top-0 hidden md:flex h-14 w-14 rounded-full bg-background border-4 border-primary items-center justify-center font-bold text-2xl text-primary z-10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]">
                                    {idx + 1}
                                </div>

                                <TiltCard className="p-8 border-white/10 bg-white/5 backdrop-blur-md">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="md:hidden h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                            {idx + 1}
                                        </div>
                                        <h2 className="text-3xl font-bold">{path.skill}</h2>
                                    </div>

                                    {/* AI Learning Strategy */}
                                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-white/5 mb-8">
                                        <h3 className="font-bold text-sm mb-3 text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" /> AI Strategy
                                        </h3>
                                        <div className="text-foreground/90 prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                                            <ReactMarkdown>{path.strategy}</ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Learning Resources */}
                                    <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                                        <BookOpen className="h-5 w-5 text-primary" /> Recommended Resources
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {path.resources.map((resource: any, rIdx: number) => (
                                            <div key={rIdx} className="group flex flex-col sm:flex-row items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary/30 transition-all duration-300">
                                                <div className="flex-1 w-full sm:w-auto mb-4 sm:mb-0">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                                            {resource.title}
                                                        </h4>
                                                        {resource.isFree && (
                                                            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-none text-[10px]">FREE</Badge>
                                                        )}
                                                        <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px]">
                                                            {resource.difficulty}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                                                        <span>{resource.provider}</span>
                                                        <span className="text-white/20">•</span>
                                                        <span>{resource.type}</span>
                                                        <span className="text-white/20">•</span>
                                                        <span>{resource.duration}</span>
                                                        {resource.rating && (
                                                            <>
                                                                <span className="text-white/20">•</span>
                                                                <span className="text-yellow-400">⭐ {resource.rating}/5</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full sm:w-auto"
                                                >
                                                    <Button size="sm" className="w-full sm:w-auto bg-white/5 hover:bg-primary hover:text-primary-foreground border-white/10 transition-all">
                                                        Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </TiltCard>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>

                <AnimatedSection direction="up" delay={0.5}>
                    <GlassCard className="p-8 mt-16 bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20">
                        <div className="flex items-start gap-4">
                            <Target className="h-8 w-8 text-green-400 mt-1" />
                            <div>
                                <h3 className="font-bold text-xl mb-4 text-green-400">Your Action Plan</h3>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500/50" />
                                        Start with the first skill and complete at least one beginner course
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500/50" />
                                        Build a small project to verify your understanding
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500/50" />
                                        Update your profile skills once you feel confident
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </GlassCard>
                </AnimatedSection>
            </div>
        </div>
    );
}
