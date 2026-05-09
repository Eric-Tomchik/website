'use client';

import { useParams } from 'next/navigation';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { useState, useRef, useEffect, useCallback } from 'react';
import { CheckCircle2, Eraser, PenLine } from 'lucide-react';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';

export default function AdminSignPage() {
  const params = useParams();
  const id = params.id as string;
  const docs = useAdminQuery(api.clientDocuments.list, {});
  const clients = useAdminQuery(api.clients.list, {});
  const adminSign = useAdminMutation(api.clientDocuments.adminSign);

  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const foundDoc = docs?.find((d) => d._id === id);
  const clientName = foundDoc?.client_id ? clients?.find((c) => c._id === foundDoc.client_id)?.name : undefined;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
  }, [foundDoc]);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  }, [isDrawing]);

  const stopDrawing = useCallback(() => setIsDrawing(false), []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    if (!hasSignature) return;
    setSigning(true);
    try {
      const canvas = canvasRef.current;
      const signatureData = canvas?.toDataURL('image/png') ?? '';
      await adminSign({ id: id as Id<'client_documents'>, signature_data: signatureData });
      setSigned(true);
    } catch (err) {
      alert('Failed to sign. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  if (signed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Document Signed!</h2>
          <p className="text-surface-400">Your developer signature has been recorded.</p>
          <button onClick={() => window.close()} className="mt-4 px-6 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-400">
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <PenLine className="w-6 h-6 text-brand-400" />
        <h1 className="text-2xl font-bold text-white">Sign as Developer</h1>
      </div>

      {foundDoc && (
        <div className="bg-surface-900 rounded-xl border border-surface-800 p-4 mb-6">
          <p className="text-white font-medium">{foundDoc.name}</p>
          {clientName && <p className="text-surface-400 text-sm">Client: {clientName}</p>}
        </div>
      )}

      <div className="bg-surface-900 rounded-xl border border-surface-800 p-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-surface-300">Draw Your Signature</label>
          {hasSignature && (
            <button onClick={clearCanvas} className="flex items-center gap-1 text-xs text-surface-400 hover:text-red-400">
              <Eraser className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
        <div className="border-2 border-dashed border-surface-700 rounded-xl overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-40 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <button
          onClick={handleSign}
          disabled={signing || !hasSignature}
          className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-5 h-5" />
          {signing ? 'Signing...' : 'Sign Document'}
        </button>
      </div>
    </div>
  );
}
