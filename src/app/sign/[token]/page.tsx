'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  PenLine,
  Eraser,
  Download,
  AlertTriangle,
  Shield,
  Clock,
} from 'lucide-react';

export default function SignDocumentPage() {
  const params = useParams();
  const token = params.token as string;
  const doc = useQuery(api.clientDocuments.getBySignatureToken, { token });
  const markViewed = useMutation(api.clientDocuments.markViewed);
  const signDoc = useMutation(api.clientDocuments.sign);
  const declineDoc = useMutation(api.clientDocuments.decline);

  const [signerName, setSignerName] = useState('');
  const [signed, setSigned] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [signing, setSigning] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Mark as viewed when document loads
  useEffect(() => {
    if (doc && doc.signature_status === 'sent') {
      markViewed({ token });
    }
  }, [doc?.signature_status, token, markViewed]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
  }, [doc]);

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

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    if (!hasSignature || !signerName.trim()) return;
    setSigning(true);

    try {
      const canvas = canvasRef.current;
      const signatureData = canvas?.toDataURL('image/png') ?? '';

      await signDoc({
        token,
        signature_data: signatureData,
        signer_name: signerName.trim(),
      });
      setSigned(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit signature. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  const handleDecline = async () => {
    try {
      await declineDoc({ token });
      setDeclined(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Loading state
  if (doc === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading document...</div>
      </div>
    );
  }

  // Not found
  if (doc === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h1>
          <p className="text-gray-600">This signing link is invalid or has expired. Please contact the sender for a new link.</p>
        </div>
      </div>
    );
  }

  // Already signed
  if (doc.signature_status === 'signed' || signed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-20 h-20 mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Signed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you{doc.signer_name ? `, ${doc.signer_name}` : ''}. Your signature has been recorded.
          </p>
          {doc.signed_at && (
            <p className="text-sm text-gray-400">
              Signed on {new Date(doc.signed_at).toLocaleString()}
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            Signature securely stored
          </div>
        </div>
      </div>
    );
  }

  // Declined
  if (doc.signature_status === 'declined' || declined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <XCircle className="w-20 h-20 mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Declined</h1>
          <p className="text-gray-600">You have declined to sign this document. The sender has been notified.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <PenLine className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">Document Signing</h1>
              <p className="text-xs text-gray-500">From Eric Tomchik — ArcLight Press</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            Secure
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Document info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{doc.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Sent to {doc.client_name ?? 'you'} for signature
                {doc.sent_for_signature_at && (
                  <> · {new Date(doc.sent_for_signature_at).toLocaleDateString()}</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Document content */}
        {doc.generated_content && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Document Content</p>
            </div>
            <pre className="p-6 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-[50vh] overflow-auto">
              {doc.generated_content}
            </pre>
          </div>
        )}

        {/* File download if attached */}
        {doc.file_url && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700">Attached document</span>
            </div>
            <a
              href={doc.file_url}
              target="_blank"
              download
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        )}

        {/* Signature Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <PenLine className="w-4 h-4" />
              Your Signature
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Please type your name and draw your signature below to sign this document.
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Signer name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
              <input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Type your full name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Signature canvas */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Draw Signature *</label>
                {hasSignature && (
                  <button
                    onClick={clearCanvas}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Eraser className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
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
              {!hasSignature && (
                <p className="text-xs text-gray-400 mt-1">Draw your signature in the box above</p>
              )}
            </div>

            {/* Legal notice */}
            <p className="text-xs text-gray-400 leading-relaxed">
              By clicking &quot;Sign Document&quot; below, I agree that my electronic signature is the
              legal equivalent of my manual/handwritten signature and I consent to be legally
              bound by this document.
            </p>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSign}
                disabled={signing || !hasSignature || !signerName.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {signing ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {signing ? 'Signing...' : 'Sign Document'}
              </button>

              {!showDeclineConfirm ? (
                <button
                  onClick={() => setShowDeclineConfirm(true)}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Decline
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDecline}
                    className="px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors text-sm"
                  >
                    Confirm Decline
                  </button>
                  <button
                    onClick={() => setShowDeclineConfirm(false)}
                    className="px-4 py-3 rounded-xl border border-gray-300 text-gray-500 text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-gray-400">
          <span>Powered by Eric Tomchik · erictomchik.com</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Secure digital signature
          </span>
        </div>
      </footer>
    </div>
  );
}
