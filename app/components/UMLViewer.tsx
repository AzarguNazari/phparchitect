'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Download, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, Maximize } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import nomnoml from 'nomnoml';

interface UMLViewerProps {
    umlCode: string;
    downloadSVG: () => void;
}

export default function UMLViewer({ umlCode, downloadSVG }: UMLViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (umlCode && canvasRef.current) {
            try {
                nomnoml.draw(canvasRef.current, umlCode);
            } catch (e) {
                console.error('Nomnoml draw error:', e);
            }
        }
    }, [umlCode]);

    if (!umlCode) {
        return (
            <>
                <CardHeader className="border-b border-neutral-100 flex flex-row items-center justify-between py-4 px-6 bg-neutral-50/50">
                    <div className="flex items-center gap-4">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <ImageIcon className="w-5 h-5 text-emerald-600" />
                            UML Visualization
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow relative bg-neutral-50 overflow-hidden">
                    <div className="w-full h-full min-h-[500px] flex items-center justify-center">
                        <div className="text-center space-y-4 max-w-sm">
                            <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
                                <ImageIcon className="w-8 h-8 text-neutral-300" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-700 tracking-tight">Ready for Generation</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">
                                Upload your PHP files and click generate to see your architecture come to life.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </>
        );
    }

    return (
        <TransformWrapper initialScale={1} centerOnInit>
            {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                    <CardHeader className="border-b border-neutral-100 flex flex-row items-center justify-between py-4 px-6 bg-neutral-50/50">
                        <div className="flex items-center gap-4">
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <ImageIcon className="w-5 h-5 text-emerald-600" />
                                UML Visualization
                            </CardTitle>
                            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1">
                                <Button variant="ghost" size="icon" onClick={() => zoomIn()} className="w-8 h-8 text-neutral-500 hover:text-emerald-600">
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => zoomOut()} className="w-8 h-8 text-neutral-500 hover:text-emerald-600">
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => resetTransform()} className="w-8 h-8 text-neutral-500 hover:text-emerald-600">
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={downloadSVG} className="border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600">
                                <Download className="w-4 h-4 mr-2" />
                                Export PNG
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow relative bg-neutral-50 overflow-hidden">
                        <div className="w-full h-full min-h-[500px] flex items-center justify-center">
                            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                                <canvas ref={canvasRef} className="max-w-none h-auto shadow-2xl rounded-lg bg-white p-8 ring-1 ring-black/10 transition-shadow cursor-move" />
                            </TransformComponent>
                        </div>
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-neutral-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-neutral-400 uppercase tracking-widest shadow-sm pointer-events-none">
                            <Maximize className="w-3 h-3" /> Drag to Pan • Scroll to Zoom
                        </div>
                    </CardContent>
                </>
            )}
        </TransformWrapper>
    );

}
