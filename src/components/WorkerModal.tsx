import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  Trash2, 
  Camera, 
  Scan, 
  CheckCircle2, 
  ShieldCheck, 
  Upload, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { Worker } from '../types';
import { 
  extractBiometricDescriptor, 
  extractDescriptorFromDataUrl, 
  BiometricDescriptor 
} from '../utils/biometricEngine';

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workerData: Omit<Worker, 'id' | 'initials' | 'avatarColor'>, workerId?: string) => void;
  onDeleteWorker?: (workerId: string) => void;
  workerToEdit?: Worker | null;
}

export const WorkerModal: React.FC<WorkerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDeleteWorker,
  workerToEdit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Tecnología');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [status, setStatus] = useState<'activo' | 'vacaciones' | 'inactivo'>('activo');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);

  // Face ID Biometric State
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [biometricDescriptor, setBiometricDescriptor] = useState<BiometricDescriptor | null>(null);
  const [biometricSignature, setBiometricSignature] = useState<string | undefined>(undefined);
  const [isLiveEnrolled, setIsLiveEnrolled] = useState(false);

  // In-modal Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user', 
            width: { ideal: 640 }, 
            height: { ideal: 480 } 
          },
          audio: false,
        });
        streamRef.current = stream;
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } else {
        setCameraError('Dispositivo de cámara no disponible.');
      }
    } catch (err: any) {
      setCameraError('No se pudo acceder a la cámara web. Verifique los permisos.');
      setIsCameraActive(false);
    }
  };

  const handleCaptureFace = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const descriptor = extractBiometricDescriptor(video);
        const signature = `FID-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        setAvatarUrl(photoDataUrl);
        setBiometricDescriptor(descriptor);
        setBiometricSignature(signature);
        setFaceEnrolled(true);
        setIsLiveEnrolled(true);

        stopCamera();
      }
    } catch (e) {
      console.error('Error capturing face:', e);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const descriptor = await extractDescriptorFromDataUrl(dataUrl);
        const signature = `FID-FILE-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setAvatarUrl(dataUrl);
        setBiometricDescriptor(descriptor);
        setBiometricSignature(signature);
        setFaceEnrolled(true);
        setIsLiveEnrolled(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFID = () => {
    setFaceEnrolled(false);
    setAvatarUrl(undefined);
    setBiometricDescriptor(null);
    setBiometricSignature(undefined);
    setIsLiveEnrolled(false);
    stopCamera();
  };

  useEffect(() => {
    if (workerToEdit) {
      setName(workerToEdit.name);
      setEmail(workerToEdit.email);
      setRole(workerToEdit.role);
      setDepartment(workerToEdit.department);
      setPhone(workerToEdit.phone || '');
      setDocumentId(workerToEdit.documentId || '');
      setPinCode(workerToEdit.pinCode || '');
      setStatus(workerToEdit.status);
      setJoinDate(workerToEdit.joinDate);
      setFaceEnrolled(!!workerToEdit.faceEnrolled);
      setAvatarUrl(workerToEdit.avatarUrl);
      setBiometricDescriptor(workerToEdit.biometricDescriptor || null);
      setBiometricSignature(workerToEdit.biometricSignature);
      setIsLiveEnrolled(!!workerToEdit.isLiveEnrolled);
    } else {
      setName('');
      setEmail('');
      setRole('');
      setDepartment('Tecnología');
      setPhone('');
      setDocumentId('');
      setPinCode('1234');
      setStatus('activo');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setFaceEnrolled(false);
      setAvatarUrl(undefined);
      setBiometricDescriptor(null);
      setBiometricSignature(undefined);
      setIsLiveEnrolled(false);
    }
    stopCamera();
  }, [workerToEdit, isOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !role.trim()) return;

    stopCamera();

    onSave(
      {
        name,
        email,
        role,
        department,
        phone,
        documentId: documentId.trim() || undefined,
        pinCode: pinCode.trim() || '1234',
        faceEnrolled,
        avatarUrl,
        biometricDescriptor: biometricDescriptor || undefined,
        biometricSignature: faceEnrolled ? (biometricSignature || `FID-${Date.now().toString().slice(-6)}`) : undefined,
        isLiveEnrolled,
        status,
        joinDate,
      },
      workerToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-700/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {workerToEdit ? 'Editar Perfil de Colaborador' : 'Registrar Nuevo Colaborador'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Información del trabajador y calibración biométrica Face ID
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }} 
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Face ID Section */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-slate-200">Credencial Biométrica Face ID</h4>
              </div>

              {faceEnrolled ? (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Enrolado
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                  Pendiente
                </span>
              )}
            </div>

            {/* Photo / Camera Viewfinder */}
            {isCameraActive ? (
              <div className="space-y-2">
                <div className="relative w-full aspect-4/3 max-h-48 bg-slate-950 rounded-xl overflow-hidden border border-cyan-500/50 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-cyan-400 flex items-center justify-center bg-cyan-500/10">
                      <span className="text-[9px] font-bold text-cyan-300 bg-black/70 px-2 py-0.5 rounded-full">
                        Encuadre Rostro
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs"
                  >
                    Cancelar Cámara
                  </button>
                  <button
                    type="button"
                    disabled={isCapturing}
                    onClick={handleCaptureFace}
                    className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isCapturing ? 'Capturando...' : 'Capturar Fotografía'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-slate-400" />
                  )}
                  {faceEnrolled && (
                    <span className="absolute bottom-0 right-0 bg-emerald-500 p-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-white" />
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{avatarUrl ? 'Re-capturar' : 'Tomar Foto'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {faceEnrolled && (
                      <button
                        type="button"
                        onClick={handleRemoveFID}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                        title="Quitar Face ID"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {biometricSignature && (
                    <p className="text-[9px] text-slate-400 font-mono">
                      Firma: {biometricSignature}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="Ej: Laura Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Correo Corporativo *</label>
              <input
                type="email"
                required
                placeholder="laura.silva@stfgroup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Cargo / Puesto *</label>
              <input
                type="text"
                required
                placeholder="Ej: Inspectora de Calidad Textil"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Departamento</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              >
                <option value="Calidad">Calidad & Inspección</option>
                <option value="Tecnología">Tecnología & Sistemas</option>
                <option value="Diseño de Producto">Diseño de Producto</option>
                <option value="Operaciones">Operaciones & Planta</option>
                <option value="Logística">Logística & Almacén</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Documento ID</label>
              <input
                type="text"
                placeholder="1111"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Clave PIN (4 dígitos)</label>
              <input
                type="password"
                maxLength={4}
                placeholder="1234"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Teléfono</label>
              <input
                type="tel"
                placeholder="+57 300 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-800">
            <div>
              {workerToEdit && onDeleteWorker && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteWorker(workerToEdit.id);
                    onClose();
                  }}
                  className="px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-rose-500/30 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                {workerToEdit ? 'Guardar Cambios' : 'Registrar Colaborador'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
