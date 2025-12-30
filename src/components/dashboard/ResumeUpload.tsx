'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeAnalysis {
    skills: string[];
    experience: string;
    summary: string;
    recommendations: string[];
}

interface ResumeData {
    fileName: string;
    uploadedAt: string;
    analysis: ResumeAnalysis;
}

export default function ResumeUpload() {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchResumeData();
    }, []);

    const fetchResumeData = async () => {
        try {
            const res = await fetch('/api/profile/resume');
            if (res.ok) {
                const data = await res.json();
                if (data.data) {
                    setResumeData(data.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch resume data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await fetch('/api/profile/resume', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setResumeData({
                    fileName: data.data.fileName,
                    uploadedAt: new Date().toISOString(),
                    analysis: data.data.analysis
                });
            } else {
                setError(data.error || 'Failed to upload resume');
            }
        } catch (error) {
            setError('An error occurred while uploading');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-8 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Resume Analysis
                </CardTitle>
                <CardDescription>
                    Upload your resume to get AI-powered insights and skill extraction.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Upload Zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                        transition-all duration-300 ease-out
                        ${dragActive
                            ? 'border-primary bg-primary/5 scale-[1.02]'
                            : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30'
                        }
                        ${uploading ? 'pointer-events-none opacity-60' : ''}
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <AnimatePresence mode="wait">
                        {uploading ? (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="text-sm font-medium">Analyzing your resume with AI...</p>
                                <p className="text-xs text-muted-foreground">This may take a moment</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <Upload className={`h-10 w-10 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div>
                                    <p className="text-sm font-medium">
                                        {dragActive ? 'Drop your resume here' : 'Drag and drop your resume'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        or click to browse (PDF only)
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                    >
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                {/* Analysis Results */}
                {resumeData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* File Info */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">{resumeData.fileName}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {new Date(resumeData.uploadedAt).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Summary */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                AI Summary
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {resumeData.analysis.summary}
                            </p>
                        </div>

                        {/* Skills */}
                        {resumeData.analysis.skills.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Extracted Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {resumeData.analysis.skills.map((skill, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                                        >
                                            {skill}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Experience Overview</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {resumeData.analysis.experience}
                            </p>
                        </div>

                        {/* Recommendations */}
                        {resumeData.analysis.recommendations.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Recommendations</h4>
                                <ul className="space-y-2">
                                    {resumeData.analysis.recommendations.map((rec, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-2 text-sm text-muted-foreground"
                                        >
                                            <span className="text-primary font-bold">•</span>
                                            {rec}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}
