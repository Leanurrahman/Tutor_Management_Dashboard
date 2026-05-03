import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  UserPlus, 
  Phone, 
  Book, 
  DollarSign,
  Edit,
  Trash2,
  Filter,
  Users
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  phone: string;
  subject: string;
  monthlyFee: number;
  status: 'Active' | 'Inactive';
  totalPaid: number;
}

export default function Students() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    monthlyFee: '',
    status: 'Active'
  });

  const fetchStudents = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'students'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const studentData: Student[] = [];
      querySnapshot.forEach((doc) => {
        studentData.push({ id: doc.id, ...doc.data() } as Student);
      });
      setStudents(studentData);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentUser]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      await addDoc(collection(db, 'students'), {
        userId: currentUser.uid,
        name: formData.name,
        phone: formData.phone,
        subject: formData.subject,
        monthlyFee: parseFloat(formData.monthlyFee),
        status: formData.status,
        totalPaid: 0,
        outstandingDue: 0,
        createdAt: serverTimestamp()
      });
      
      toast.success("Student added successfully");
      setIsAddDialogOpen(false);
      setFormData({ name: '', phone: '', subject: '', monthlyFee: '', status: 'Active' });
      fetchStudents();
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await deleteDoc(doc(db, 'students', id));
      toast.success("Student removed");
      fetchStudents();
    } catch (error) {
      toast.error("Failed to delete student");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Students</h1>
          <p className="text-slate-500">Manage and track your students' progress and fees.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-xl shadow-lg shadow-indigo-200">
              <UserPlus className="mr-2 h-5 w-5" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleAddStudent}>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter details to register a new student in your dashboard.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter student name" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="e.g. Mathematics" 
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fee">Monthly Fee ($)</Label>
                    <Input 
                      id="fee" 
                      type="number"
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData({...formData, monthlyFee: e.target.value})}
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(val: any) => setFormData({...formData, status: val})}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Save Student</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input 
            placeholder="Search students or subjects..." 
            className="pl-10 border-none focus-visible:ring-0 shadow-none h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />
        <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-500">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            Loading students...
          </div>
        ) : filteredStudents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="font-semibold text-slate-700 pl-6">Student</TableHead>
                <TableHead className="font-semibold text-slate-700">Subject</TableHead>
                <TableHead className="font-semibold text-slate-700">Monthly Fee</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="text-right pr-6 font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {student.name[0]}
                      </div>
                      <div>
                        <div className="text-slate-900 truncate max-w-[150px]">{student.name}</div>
                        <div className="text-xs text-slate-500 font-normal">{student.phone || 'No phone'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-normal">
                      {student.subject}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">${student.monthlyFee}</TableCell>
                  <TableCell>
                    <Badge className={
                      student.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-none'
                    }>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No students found</h3>
            <p className="text-slate-500 mb-6">Start growing your practice by adding your first student.</p>
            <Button 
              variant="outline" 
              className="border-slate-200"
              onClick={() => setIsAddDialogOpen(true)}
            >
              Add Student
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
