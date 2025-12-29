"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, BookOpen, Lightbulb } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="bg-gradient-to-br from-primary to-purple-600 p-1.5 rounded-lg"
              >
                <BarChart3 className="h-5 w-5 text-white" />
              </motion.div>
              <span className="hidden font-bold sm:inline-block tracking-tight text-lg">
                GapAnalyzer
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="#features"
                className="transition-colors hover:text-primary text-muted-foreground"
              >
                Features
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-primary text-muted-foreground"
              >
                Pricing
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-primary text-muted-foreground"
              >
                About
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-20 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-6 text-center">
            <AnimatedSection direction="up" delay={0.1}>
              <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/60">
                Master Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-purple-600">
                  Future Career
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.2}>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Identify skill gaps, get AI-powered recommendations, and
                accelerate your growth with data-driven insights.
              </p>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.3}>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 rounded-full text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:scale-105">
                    Start Analysis <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-primary/20 hover:bg-primary/5 text-lg transition-all hover:scale-105">
                    Explore Demo
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section
          id="features"
          className="container space-y-12 py-8 md:py-12 lg:py-24"
        >
          <AnimatedSection>
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold tracking-tight">
                Data-Driven <span className="text-primary">Growth</span>
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Everything you need to visualize and bridge your skill gaps.
              </p>
            </div>
          </AnimatedSection>

          <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[70rem] md:grid-cols-3">
            {/* Feature 1: Skill Gap */}
            <AnimatedSection delay={0.2} direction="up" className="md:col-span-1">
              <GlassCard variant="hover" className="h-full relative overflow-hidden group">
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-4 p-3 bg-primary/10 w-fit rounded-xl">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Skill Gap Analysis</h3>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">
                    Visualize the difference between your current skills and job requirements.
                  </p>
                  {/* Micro-Chart: Radar */}
                  <div className="h-[120px] w-full mt-auto opacity-60 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                        <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                        <PolarAngleAxis dataKey="subject" tick={false} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar
                          name="Skills"
                          dataKey="A"
                          stroke="var(--primary)"
                          fill="var(--primary)"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>

            {/* Feature 2: Career Insights */}
            <AnimatedSection delay={0.3} direction="up" className="md:col-span-1">
              <GlassCard variant="hover" className="h-full group">
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-4 p-3 bg-purple-500/10 w-fit rounded-xl">
                    <Lightbulb className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Career Trend AI</h3>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">
                    Predictive analysis for your career trajectory based on market data.
                  </p>
                  {/* Micro-Chart: Line */}
                  <div className="h-[120px] w-full mt-auto opacity-60 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={careerData}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#a855f7"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>

            {/* Feature 3: Learning Paths */}
            <AnimatedSection delay={0.4} direction="up" className="md:col-span-1">
              <GlassCard variant="hover" className="h-full relative">
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-4 p-3 bg-green-500/10 w-fit rounded-xl">
                    <BookOpen className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Curated Paths</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tailored course lists to fill gaps efficiently.
                  </p>
                  {/* Decorative Elements */}
                  <div className="space-y-2 mt-auto">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: "70%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: "45%" }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                    <div className="h-2 w-[80%] bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: "90%" }}
                        transition={{ duration: 1, delay: 0.9 }}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <footer className="py-10 border-t border-white/5 bg-background/50">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Team GapAnalyzer.
          </p>
          <div className="flex gap-4">
            {/* Social placeholders or links */}
          </div>
        </div>
      </footer>
    </div>
  );
}
