import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Award, CheckCircle, QrCode, Download, ShieldCheck } from 'lucide-react';

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await axiosClient.get('/certificates/my');
      setCertificates(res.data?.data?.certificates || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="card-paper bg-[#0B5D3B] text-white p-8 rounded-3xl space-y-2 shadow-soft border border-[#06452C]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DDF1E5] px-3.5 py-1 text-xs font-black text-[#0B5D3B]">
          <Award className="h-3.5 w-3.5" />
          <span>VERIFIABLE COMPLETION CERTIFICATES</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">My Course Certificates</h1>
        <p className="text-xs font-medium text-[#DDF1E5]">Earn digital certificates with embedded QR codes upon completing course requirements.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading certificates...</div>
      ) : certificates.length === 0 ? (
        <div className="card-paper text-center py-12 space-y-3">
          <Award className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-800 text-lg">No Certificates Earned Yet</h3>
          <p className="text-xs text-gray-500">Complete 100% of any course lessons and pass required quizzes to earn your certificate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert._id} className="card-paper space-y-4 border-2 border-primary-main/20 hover:shadow-dropdown transition">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="badge-soft-success flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
                <span className="text-xs text-gray-400 font-mono">ID: {cert.certificateId?.substring(0, 8)}...</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-gray-900 text-lg">{cert.courseName}</h3>
                <p className="text-xs text-gray-600">Issued to <strong className="text-gray-900">{cert.studentName}</strong> on {new Date(cert.completionDate).toLocaleDateString()}</p>
              </div>

              {cert.qrCode && (
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                  <img src={cert.qrCode} alt="QR Verification" className="h-16 w-16 rounded-lg bg-white p-1 border" />
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="font-bold text-gray-800">Scan to Verify Authenticity</p>
                    <p className="text-[10px]">Grade: <span className="capitalize font-bold text-primary-dark">{cert.grade}</span></p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
