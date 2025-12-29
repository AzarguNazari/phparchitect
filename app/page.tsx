'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Download, Code, Image as ImageIcon, Trash2, Layers, ArrowRight, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

interface UMLViewerProps {
  umlCode: string;
  downloadSVG: () => void;
}

const UMLViewer = dynamic<UMLViewerProps>(() => import('@/app/components/UMLViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 min-h-[500px]">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
    </div>
  )
});

export default function UMLGeneratorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [umlCode, setUmlCode] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleParse = async () => {
    if (files.length === 0) return;
    setIsParsing(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.uml) {
        setUmlCode(data.uml);
      }
    } catch (error) {
      console.error('Parse error:', error);
    } finally {
      setIsParsing(false);
    }
  };

  const downloadSVG = () => {
    // This will be passed to UMLViewer
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-emerald-600 p-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform hover:scale-110 duration-300">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="text-emerald-600 font-bold tracking-tight uppercase text-sm">Open Source</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-neutral-900 uppercase">
              PHP<span className="text-emerald-600">Architect</span>
            </h1>
            <p className="text-neutral-600 mt-2 text-lg max-w-xl leading-relaxed">
              Professional architecture visualization for modern PHP codebases.
              Transform source code into actionable documentation instantly.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700" asChild>
              <a href="https://github.com/AzarguNazari/PHP-To-UML" target="_blank">View on GitHub</a>
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Star on GitHub
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-white border-neutral-200 text-neutral-900 shadow-xl overflow-hidden ring-1 ring-black/5">
              <CardHeader className="border-b border-neutral-100 bg-neutral-50/50">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Upload className="w-5 h-5 text-emerald-600" />
                  Source Files
                </CardTitle>
                <CardDescription className="text-neutral-500">
                  Select PHP classes and interfaces to analyze.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="php-upload" className="sr-only">Upload Files</Label>
                  <div className="relative group">
                    <Input
                      id="php-upload"
                      type="file"
                      multiple
                      accept=".php"
                      onChange={handleFileChange}
                      className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 bg-neutral-50 border-neutral-200 h-14 pt-2.5 pr-4"
                    />
                    <div className="absolute right-4 top-4 text-neutral-400 group-hover:text-emerald-600 transition-colors pointer-events-none">
                      <Upload className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <ScrollArea className="h-[300px] w-full rounded-md border border-neutral-200 bg-white p-4 text-neutral-900">
                  {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[260px] text-neutral-400 italic">
                      <p>No files selected</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {files.map((file, idx) => (
                        <li key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 group hover:border-emerald-600/50 transition-all">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Code className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm truncate font-medium text-neutral-700">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile(idx)}
                            className="text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </ScrollArea>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg h-14 group shadow-md transition-all"
                  onClick={handleParse}
                  disabled={files.length === 0 || isParsing}
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Generating Architecture...
                    </>
                  ) : (
                    <>
                      Generate UML Diagram
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200 text-neutral-900">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-neutral-400">How it works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-600">1</div>
                  <p className="text-sm text-neutral-600">Upload your PHP class or interface files.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-600">2</div>
                  <p className="text-sm text-neutral-600">Our engine parses the AST and identifies relations.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-600">3</div>
                  <p className="text-sm text-neutral-600">Interact with the generated visual diagram.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-white border-neutral-200 text-neutral-900 shadow-xl overflow-hidden min-h-[600px] flex flex-col ring-1 ring-black/5">
              <UMLViewer umlCode={umlCode} downloadSVG={() => {
                const canvas = document.querySelector('canvas');
                if (!canvas) return;
                const link = document.createElement('a');
                link.download = 'uml-diagram.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
              }} />
            </Card>

            {umlCode && (
              <Card className="bg-white border-neutral-200 text-neutral-900 overflow-hidden">
                <CardHeader className="py-3 bg-neutral-50 border-b border-neutral-100">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                    <Code className="w-3 h-3" /> Nomnoml DSL
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <pre className="text-emerald-700 font-mono text-sm overflow-x-auto">
                    {umlCode}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-6 pb-12">
          <p className="text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} PHP Architect. Built for developers. Released under <span className="text-neutral-900 font-medium">MIT License</span>.
          </p>
          <div className="flex gap-8 text-neutral-500 text-sm">
            <a href="#" className="hover:text-emerald-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Contributing</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
          </div>
        </footer>
      </div>
    </div>
  );

}
