import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Save, Loader2, Upload } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

export default function ProfileModal({ isOpen, onClose, profile, onUpdate }: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [photoURL, setPhotoURL] = useState(profile.photoURL);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError("Image size should be less than 2MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const storageRef = ref(storage, `profiles/${profile.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setPhotoURL(downloadURL);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', profile.uid);
      const updates = {
        displayName: displayName.trim(),
        photoURL: photoURL.trim(),
      };

      await updateDoc(userRef, updates);
      onUpdate({ ...profile, ...updates });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-black/5 dark:border-white/10"
          >
            <div className="p-6 border-b border-black/5 dark:border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Edit Profile</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors dark:text-white/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="relative w-24 h-24">
                    <img 
                      src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=5A5A40&color=fff`} 
                      alt="Profile" 
                      className={`w-24 h-24 rounded-full object-cover border-4 border-[#5A5A40]/10 transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`}
                      referrerPolicy="no-referrer"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#5A5A40] animate-spin" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 p-2 bg-[#1a1a1a] dark:bg-[#A8A878] text-white dark:text-black rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                <div className="w-full space-y-2">
                  <label className="text-xs font-sans font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
                    Profile Picture URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-4 py-3 rounded-xl bg-[#F5F5F0] dark:bg-white/5 border-none focus:ring-2 focus:ring-[#5A5A40] dark:text-white font-sans text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-xs font-sans font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F5F0] dark:bg-white/5 border-none focus:ring-2 focus:ring-[#5A5A40] dark:text-white font-sans text-sm"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 font-sans text-center">{error}</p>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving || isUploading}
                className="w-full bg-[#1a1a1a] dark:bg-[#A8A878] text-white dark:text-black py-4 rounded-xl font-sans font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
