"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, BookOpen, Lightbulb, TrendingUp, Target, Zap } from "lucide-react";
import {
  MeshBackground,
  MagneticButton,
  TiltCard,
  BentoGrid
} from "@/components/ui/PremiumComponents";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from "recharts";

// Mock Data for Micro-Charts
const careerData = [
  { name: "Jan", value: 30 },
  { name: "Feb", value: 45 },
  { name: "Mar", value: 55 },
  { name: "Apr", value: 80 },
  { name: "May", value: 95 },
];

const skillData = [
  { subject: "React", A: 120, fullMark: 150 },
  { subject: "Node", A: 98, fullMark: 150 },
  { subject: "Design", A: 86, fullMark: 150 },
  { subject: "Data", A: 99, fullMark: 150 },
  { subject: "AI", A: 85, fullMark: 150 },
  { subject: "Cloud", A: 65, fullMark: 150 },
];

const growthData = [
  { name: 'Week 1', value: 20 },
  { name: 'Week 2', value: 40 },
  { name: 'Week 3', value: 35 },
  { name: 'Week 4', value: 65 },
  { name: 'Week 5', value: 85 },
  { name: 'Week 6', value: 100 },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground font-sans">
      <MeshBackground />

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/0 backdrop-blur-xl transition-all duration-300">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 p-1.5 shadow-lg shadow-primary/10 transition-transform duration-500 group-hover:rotate-12">
                <img src="/logo.svg" alt="SkillGap Logo" className="h-full w-full object-contain" />
              </div>
              <span className="hidden font-bold sm:inline-block tracking-tight text-xl group-hover:text-primary transition-colors">
                SkillGap
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
              <Link href="#" className="hover:text-primary transition-colors">Pricing</Link>
              <Link href="#" className="hover:text-primary transition-colors">About</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hover:bg-white/5">Login</Button>
            </Link>
            <Link href="/register">
              <MagneticButton className="shadow-lg shadow-primary/20">
                Get Started
              </MagneticButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 md:pt-32 lg:pb-40 overflow-visible">
          <div className="container flex flex-col items-center text-center gap-8">
            <AnimatedSection direction="up" delay={0.1}>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-primary backdrop-blur-xl mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                v2.0 Now Live
              </div>
              <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9]">
                Master Your <br />
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-purple-600">
                  Future
                </span>{" "}
                <span className="text-stroke-primary text-transparent relative z-10">
                  Career
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.2}>
              <p className="max-w-[42rem] mx-auto leading-relaxed text-muted-foreground sm:text-xl sm:leading-8">
                Identify skill gaps, get AI-powered recommendations, and accelerate your growth with data-driven insights.
              </p>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-4">
                <Link href="/register">
                  <MagneticButton className="h-14 px-10 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40">
                    Start Analysis <ArrowRight className="ml-2 h-5 w-5" />
                  </MagneticButton>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-14 px-10 rounded-full border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-lg transition-all hover:scale-105">
                    Explore Demo
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-px h-12 bg-gradient-to-b from-transparent via-primary to-transparent"
              />
            </motion.div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="container pb-24">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold">
              Data-Driven <span className="text-primary">Growth</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Everything you need to visualize and bridge your skill gaps in one powerful dashboard.
            </p>
          </div>

          <BentoGrid>
            {/* 1. Skill Gap Analysis (Large Item) */}
            <TiltCard className="h-full min-h-[300px] p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-2xl">Skill Gap Analysis</h3>
                </div>
                <p className="text-muted-foreground text-lg">
                  Visualize the difference between your current skills and job requirements with distinct clarity.
                </p>
              </div>

              <div className="h-[200px] w-full mt-6 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                    <PolarGrid stroke="#ffffff20" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
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
              </div>
            </TiltCard>

            {/* 2. Career Trend AI (Tall Item) */}
            <TiltCard className="h-full min-h-[300px] p-8 flex flex-col">
              <div className="mb-4">
                <div className="p-2.5 bg-purple-500/10 w-fit rounded-xl mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-bold text-2xl mb-2">Market Trends</h3>
                <p className="text-muted-foreground text-sm">
                  Real-time analysis of job market demands.
                </p>
              </div>
              <div className="flex-1 w-full min-h-[150px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={careerData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TiltCard>

            {/* 3. Learning Paths (Wide Item) */}
            <div className="md:col-span-3">
              <TiltCard className="h-full p-8 flex flex-col md:flex-row gap-8 items-center bg-gradient-to-r from-background to-primary/5">
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-green-500/10 rounded-xl">
                        <BookOpen className="h-6 w-6 text-green-500" />
                      </div>
                      <h3 className="font-bold text-2xl">Personalized Learning Paths</h3>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-xl">
                      Don't just see the gaps—fill them. get tailored course lists and resources generated instantly by AI.
                    </p>
                  </div>
                  <Link href="/register">
                    <Button variant="link" className="text-primary p-0 h-auto font-semibold hover:text-primary/80">
                      View Sample Path <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="flex-1 w-full max-w-md space-y-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ x: 50, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-muted-foreground text-sm">
                        0{i}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-24 bg-white/10 rounded-full mb-2" />
                        <div className="h-2 w-32 bg-white/5 rounded-full" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/20" />
                    </motion.div>
                  ))}
                </div>
              </TiltCard>
            </div>

            {/* 4. Stats / Extra (Small) */}
            <TiltCard className="p-6 flex flex-col justify-center items-center text-center space-y-2">
              <Target className="h-8 w-8 text-blue-500 mb-2" />
              <h4 className="text-3xl font-bold">98%</h4>
              <p className="text-sm text-muted-foreground">Accuracy Rate</p>
            </TiltCard>

            {/* 5. Another Stat */}
            <TiltCard className="p-6 md:col-span-2 flex flex-row items-center justify-between gap-6 bg-primary text-primary-foreground relative overflow-hidden">
              <div className="relative z-10 text-left">
                <h3 className="text-2xl font-bold mb-1">Fast-Track Your Promotion</h3>
                <p className="text-white/80">Join 10,000+ developers analyzing their careers.</p>
              </div>
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-md relative z-10">
                <Zap className="h-8 w-8 text-yellow-300 fill-yellow-300" />
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            </TiltCard>

          </BentoGrid>
        </section>
      </main>

      <footer className="py-10 border-t border-white/5 bg-background/30 backdrop-blur-xl">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <span className="font-bold text-foreground">SkillGap Team</span>.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
