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
  increment,
  runTransaction,
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  History, 
  TrendingDown, 
  MoreVertical,
  Calendar,
  User,
  Trash2,
  FileText
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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { toast } from 'sonner';

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  note: string;
}

interface StudentOption {
  id: string;
  name: string;
  outstandingDue: number;
}

export default function Payments() {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Students
      const sQ = query(collection(db, 'students'), where('userId', '==', currentUser.uid));
      const sS = await getDocs(sQ);
      const studentOptions: StudentOption[] = [];
      sS.forEach(doc => studentOptions.push({ 
        id: doc.id, 
        name: doc.data().name,
        outstandingDue: doc.data().outstandingDue || 0
      }));
      setStudents(studentOptions);

      // Payments
      const pQ = query(collection(db, 'payments'), where('userId', '==', currentUser.uid), orderBy('date', 'desc'));
      const pS = await getDocs(pQ);
      const paymentData: Payment[] = [];
      pS.forEach(doc => {
        const student = studentOptions.find(s => s.id === doc.data().studentId);
        paymentData.push({ 
          id: doc.id, 
          ...doc.data(),
          studentName: student?.name || 'Deleted Student'
        } as Payment);
      });
      setPayments(paymentData);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !formData.studentId) return;

    try {
      const amount = parseFloat(formData.amount);
      const studentRef = doc(db, 'students', formData.studentId);
      
      // Use transaction to update student dues and add payment
      await runTransaction(db, async (transaction) => {
        transaction.set(doc(collection(db, 'payments')), {
          userId: currentUser.uid,
          studentId: formData.studentId,
          amount: amount,
          date: formData.date,
          note: formData.note,
          createdAt: serverTimestamp()
        });
        
        transaction.update(studentRef, {
          totalPaid: increment(amount),
          outstandingDue: increment(-amount)
        });
      });

      toast.success("Payment recorded and student record updated");
      setIsOpen(false);
      setFormData({ studentId: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' });
      fetchData();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to record payment");
    }
  };

  const handleDeletePayment = async (id: string, studentId: string, amount: number) => {
    if (!confirm("Are you sure? This will delete the record and revert the student's paid total.")) return;
    try {
      const studentRef = doc(db, 'students', studentId);
      await runTransaction(db, async (transaction) => {
        transaction.delete(doc(db, 'payments', id));
        transaction.update(studentRef, {
          totalPaid: increment(-amount),
          outstandingDue: increment(amount)
        });
      });
      toast.success("Payment reverted");
      fetchData();
    } catch (error) {
      toast.error("Revert failed");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Payments</h1>
          <p className="text-slate-500">Track and manage student fee records.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-xl shadow-lg shadow-indigo-200">
              <DollarSign className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleRecordPayment}>
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
                <DialogDescription>
                  Enter the payment details received from the student.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                 <div className="grid gap-2">
                  <Label htmlFor="student">Student</Label>
                  <Select value={formData.studentId} onValueChange={(val) => setFormData({...formData, studentId: val})}>
                    <SelectTrigger id="student">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} (Due: ${s.outstandingDue})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input 
                      id="amount" 
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Payment Date</Label>
                    <Input 
                      id="date" 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">Notes (Optional)</Label>
                  <Input 
                    id="note" 
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    placeholder="e.g. Paid for May term" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Confirm Payment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Outstanding Dues List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingDown className="text-red-500" size={20} />
            Outstanding Dues
          </h2>
          {students.filter(s => s.outstandingDue > 0).length > 0 ? (
            students.filter(s => s.outstandingDue > 0).map(s => (
              <Card key={s.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{s.name}</p>
                      <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Unpaid Fee</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">${s.outstandingDue}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="p-12 text-center bg-emerald-50 rounded-2xl border border-emerald-100">
              <TrendingUp size={24} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-emerald-800">All caught up!</p>
              <p className="text-xs text-emerald-600">No students with pending dues.</p>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <History className="text-indigo-500" size={20} />
            Payment History
          </h2>
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-20 text-center text-slate-400">Loading history...</div>
              ) : payments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {payments.map(p => (
                    <div key={p.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <DollarSign size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{p.studentName}</h4>
                            <span className="text-xs text-slate-400">• {p.date}</span>
                          </div>
                          <p className="text-sm text-slate-500">{p.note || 'Regular payment'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-2">
                          <p className="text-lg font-bold text-emerald-600">+${p.amount}</p>
                          <Badge variant="outline" className="text-[10px] uppercase border-emerald-100 text-emerald-600 bg-emerald-50/20">Success</Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-300 hover:text-red-500"
                          onClick={() => handleDeletePayment(p.id, p.studentId, p.amount)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center">
                  <DollarSign size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400">No payment history yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
