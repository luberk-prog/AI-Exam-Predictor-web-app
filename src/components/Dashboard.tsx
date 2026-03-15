import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Course, UserProfile } from '../types';
import { Plus, BookOpen, Trash2, ChevronRight, GraduationCap, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UNIVERSITIES = [
  "Ghana Communication Technology University (GCTU)",
  "University of Ghana (UG)",
  "Kwame Nkrumah University of Science and Technology (KNUST)",
  "University of Cape Coast (UCC)",
  "University for Development Studies (UDS)",
  "University of Education, Winneba (UEW)",
  "Ashesi University",
  "Central University",
  "Pentecost University",
  "Valley View University",
  "Academic City University College",
  "Lancaster University Ghana"
];

const LEVELS = ["100", "200", "300", "400", "500", "600"];
const SEMESTERS = ["1", "2"];

export default function Dashboard({ userProfile, onSelectCourse }: { userProfile: UserProfile, onSelectCourse: (id: string) => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseUni, setNewCourseUni] = useState(UNIVERSITIES[0]);
  const [newCourseLevel, setNewCourseLevel] = useState(LEVELS[0]);
  const [newCourseSemester, setNewCourseSemester] = useState(SEMESTERS[0]);

  useEffect(() => {
    const q = query(collection(db, 'courses'), where('ownerId', '==', userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const courseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(courseList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    await addDoc(collection(db, 'courses'), {
      name: newCourseName,
      university: newCourseUni,
      level: newCourseLevel,
      semester: newCourseSemester,
      ownerId: userProfile.uid,
      createdAt: new Date().toISOString(),
    });

    setNewCourseName('');
    setIsModalOpen(false);
  };

  const handleDeleteCourse = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    setCourseToDelete(course);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'courses', courseToDelete.id));
      setCourseToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courses/${courseToDelete.id}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold dark:text-white">Welcome back, {userProfile.displayName?.split(' ')[0]}</h1>
          <p className="text-sm md:text-base text-[#1a1a1a]/60 dark:text-white/60 font-sans">Manage your courses and predict your exams.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-[#1a1a1a] dark:bg-[#A8A878] text-white dark:text-black px-6 py-3 rounded-full font-sans font-semibold flex items-center justify-center gap-2 hover:bg-[#333] dark:hover:bg-[#8A8A58] transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white dark:bg-black/40 rounded-[2rem] p-12 md:p-20 border border-dashed border-black/20 dark:border-white/20 text-center space-y-4 transition-colors">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#F5F5F0] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-[#5A5A40] dark:text-[#A0A080]">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold">No courses yet</h3>
          <p className="text-sm md:text-base text-[#1a1a1a]/60 dark:text-white/60 font-sans max-w-xs mx-auto">
            Create your first course to start analyzing materials and predicting exam topics.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-sm md:text-base text-[#5A5A40] dark:text-[#A0A080] font-bold font-sans hover:underline"
          >
            Create a course now →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {courses.map((course) => (
            <motion.div
              layoutId={course.id}
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="group bg-white dark:bg-black/40 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-black/5 dark:border-white/5 hover:border-[#5A5A40]/30 dark:hover:border-[#A0A080]/30 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 md:p-6 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleDeleteCourse(e, course)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#F5F5F0] dark:bg-white/5 flex items-center justify-center text-[#5A5A40] dark:text-[#A0A080]">
                  <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold group-hover:text-[#5A5A40] dark:group-hover:text-[#A0A080] transition-colors">{course.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <p className="text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-widest bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md opacity-60">{course.university}</p>
                    <p className="text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-widest bg-[#5A5A40]/10 dark:bg-[#A0A080]/20 text-[#5A5A40] dark:text-[#A0A080] px-2 py-1 rounded-md">L{course.level} S{course.semester}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                  <span className="text-xs md:text-sm font-sans opacity-60">View Analysis</span>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#1a1a1a] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 w-full max-w-lg shadow-2xl space-y-6 md:space-y-8 max-h-[90vh] overflow-y-auto transition-colors"
            >
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold">Create New Course</h2>
                <p className="text-sm md:text-base text-[#1a1a1a]/60 dark:text-white/60 font-sans">Enter the details of the course you want to analyze.</p>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-wider opacity-50">Course Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F5F5F0] dark:bg-white/5 border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 font-sans text-sm md:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-wider opacity-50">University</label>
                  <select 
                    value={newCourseUni}
                    onChange={(e) => setNewCourseUni(e.target.value)}
                    className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F5F5F0] dark:bg-white/5 border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 font-sans appearance-none text-sm md:text-base"
                  >
                    {UNIVERSITIES.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-wider opacity-50">Level</label>
                    <select 
                      value={newCourseLevel}
                      onChange={(e) => setNewCourseLevel(e.target.value)}
                      className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F5F5F0] dark:bg-white/5 border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 font-sans appearance-none text-sm md:text-base"
                    >
                      {LEVELS.map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-wider opacity-50">Semester</label>
                    <select 
                      value={newCourseSemester}
                      onChange={(e) => setNewCourseSemester(e.target.value)}
                      className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F5F5F0] dark:bg-white/5 border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 font-sans appearance-none text-sm md:text-base"
                    >
                      {SEMESTERS.map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 md:py-4 rounded-full font-sans font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 md:py-4 rounded-full font-sans font-bold bg-[#1a1a1a] dark:bg-white text-white dark:text-black hover:opacity-90 transition-all shadow-lg text-sm md:text-base"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {courseToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setCourseToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 w-full max-w-md shadow-2xl space-y-6 transition-colors"
            >
              <div className="flex items-center gap-4 text-red-500">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Delete Course?</h2>
              </div>
              
              <div className="space-y-2">
                <p className="text-[#1a1a1a]/60 dark:text-white/60 font-sans">
                  Are you sure you want to delete <span className="font-bold text-[#1a1a1a] dark:text-white">"{courseToDelete.name}"</span>?
                </p>
                <p className="text-xs text-red-500/80 font-sans italic">
                  This action cannot be undone and all analysis data will be lost.
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  disabled={isDeleting}
                  onClick={() => setCourseToDelete(null)}
                  className="flex-1 px-6 py-3 rounded-full font-sans font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 rounded-full font-sans font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
