import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Award, ShieldCheck, CheckCircle2, QrCode, ArrowLeft } from 'lucide-react';

export default function CertificateVerificationPage() {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyCertificate();
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      const res = await axiosClient.get(`/certificates/verify/${certificateId}`);
      setCert(res.data?.data?.certificate);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl card-paper p-8 space-y-6 text-center border-2 border-primary-main/30 shadow-card">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to LearnHub AI</span>
        </Link>

        {loading ? (
          <div className="py-8 text-gray-400">Verifying certificate authenticity...</div>
        ) : cert ? (
          <div className="space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-success-light text-success-dark flex items-center justify-center">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="badge-soft-success text-xs font-bold px-3 py-1">OFFICIAL VERIFIED CERTIFICATE</span>
              <h1 className="text-3xl font-black text-gray-900 leading-tight">{cert.courseName}</h1>
              <p className="text-sm text-gray-600">
                Issued to <strong className="text-gray-900 font-bold">{cert.studentName}</strong> on {new Date(cert.completionDate).toLocaleDateString()}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Certificate ID:</span>
                <span className="font-mono font-bold text-gray-800">{cert.certificateId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Instructor:</span>
                <span className="font-bold text-gray-800">{cert.instructorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Mastery Grade:</span>
                <span className="font-bold text-primary-dark capitalize">{cert.grade || 'Pass'}</span>
              </div>
            </div>

            {cert.qrCode && (
              <div className="flex justify-center pt-2">
                <img src={cert.qrCode} alt="QR Code" className="h-24 w-24 border p-1 rounded-xl bg-white shadow-sm" />
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-error-main font-bold">
            Certificate not found or revoked.
          </div>
        )}
      </div>
    </div>
  );
}
