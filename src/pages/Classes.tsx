import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  BookOpen, 
  User, 
  CheckCircle2, 
  XCircle,
  Clock,
  MoreVertical,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

interface ClassRecord {
  id: string;
  studentId: string;
  studentName: string;
  topic: string;
  date: string;
  status: 'Attended' | 'Missed';
}

interface StudentOption {
  id: string;
  name: string;
}

export default function Classes() {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    topic: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Attended' as const
  });

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Fetch students for the dropdown
      const sQuery = query(collection(db, 'students'), where('userId', '==', currentUser.uid));
      const sSnapshot = await getDocs(sQuery);
      const studentOptions: StudentOption[] = [];
      sSnapshot.forEach(doc => {
        studentOptions.push({ id: doc.id, name: doc.data().name });
      });
      setStudents(studentOptions);

      // Fetch classes
      const cQuery = query(collection(db, 'classes'), where('userId', '==', currentUser.uid), orderBy('date', 'desc'));
      const cSnapshot = await getDocs(cQuery);
      const classRecords: ClassRecord[] = [];
      cSnapshot.forEach(doc => {
        const data = doc.data();
        const student = studentOptions.find(s => s.id === data.studentId);
        classRecords.push({ 
          id: doc.id, 
          ...data,
          studentName: student?.name || 'Unknown Student'
        } as ClassRecord);
      });
      setClasses(classRecords);
    } catch (error) {
      console.error("Error fetching class data:", error);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !formData.studentId) return;

    try {
      await addDoc(collection(db, 'classes'), {
        userId: currentUser.uid,
        studentId: formData.studentId,
        topic: formData.topic,
        date: formData.date,
        status: formData.status,
        createdAt: serverTimestamp()
      });

      toast.success("Class record saved");
      setIsOpen(false);
      setFormData({ studentId: '', topic: '', date: new Date().toISOString().split('T')[0], status: 'Attended' });
      fetchData();
    } catch (error) {
      toast.error("Failed to save record");
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'classes', id));
      toast.success("Class record deleted");
      fetchData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Classes</h1>
          <p className="text-slate-500">Track attendence and session topics.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-xl shadow-lg shadow-indigo-200">
              <Plus className="mr-2 h-5 w-5" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddClass}>
              <DialogHeader>
                <DialogTitle>Record Class Session</DialogTitle>
                <DialogDescription>
                  Keep track of what transpired during the lesson.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="student">Select Student</Label>
                  <Select value={formData.studentId} onValueChange={(val) => setFormData({...formData, studentId: val})}>
                    <SelectTrigger id="student">
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="topic">Lesson Topic</Label>
                  <Input 
                    id="topic" 
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    placeholder="e.g. Linear Equations" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Session Date</Label>
                    <Input 
                      id="date" 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(val: any) => setFormData({...formData, status: val})}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Attended">Attended</SelectItem>
                        <SelectItem value="Missed">Missed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Record Session</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-dashed border-slate-200">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
             <p className="text-slate-400">Fetching session records...</p>
          </div>
        ) : classes.length > 0 ? (
          classes.map((cls) => (
            <Card key={cls.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-5 sm:p-6 gap-6">
                  <div className={`p-4 rounded-2xl shrink-0 ${
                    cls.status === 'Attended' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {cls.status === 'Attended' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-400 tracking-wider uppercase text-[10px]">
                        {cls.date}
                      </span>
                      <Badge variant="outline" className={cls.status === 'Attended' ? 'text-emerald-600 bg-emerald-50/50 border-emerald-100' : 'text-red-500 bg-red-50/50 border-red-100'}>
                         {cls.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 truncate">{cls.studentName}</h3>
                    <div className="flex items-center gap-4 mt-1">
                       <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-indigo-400" />
                        {cls.topic}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                       <Clock size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteClass(cls.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>

                  <div className="sm:hidden">
                    <ChevronRight className="text-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-20 bg-white rounded-2xl border border-slate-100">
            <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No sessions recorded</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't logged any classes yet. Your teaching history will appear here.
            </p>
            <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsOpen(true)}>
              Record Your First Class
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
