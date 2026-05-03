import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  collectionGroup 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    monthlyEarnings: 0,
    pendingDues: 0,
    classesThisMonth: 0
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be Firestore queries
        // const studentsQuery = query(collection(db, 'students'), where('userId', '==', currentUser.uid));
        // const paymentsQuery = query(collection(db, 'payments'), where('userId', '==', currentUser.uid), orderBy('date', 'desc'), limit(5));
        
        // Mock data for initial UI
        setTimeout(() => {
          setStats({
            totalStudents: 12,
            monthlyEarnings: 2450,
            pendingDues: 450,
            classesThisMonth: 38
          });
          
          setRecentPayments([
            { id: '1', studentName: 'Alex Johnson', amount: 200, date: '2026-05-01', status: 'Completed' },
            { id: '2', studentName: 'Sarah Smith', amount: 150, date: '2026-04-28', status: 'Completed' },
            { id: '3', studentName: 'Michael Brown', amount: 300, date: '2026-04-25', status: 'Completed' },
          ]);

          setRecentClasses([
            { id: '1', studentName: 'Alex Johnson', topic: 'Calculus III', date: '2026-05-02', status: 'Attended' },
            { id: '2', studentName: 'Emma Davis', topic: 'Organic Chemistry', date: '2026-05-01', status: 'Attended' },
            { id: '3', studentName: 'Sarah Smith', topic: 'Physics 101', date: '2026-05-01', status: 'Missed' },
          ]);
          
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Active students this term' },
    { title: 'Monthly Earnings', value: `$${stats.monthlyEarnings}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Revenue this month' },
    { title: 'Pending Dues', value: `$${stats.pendingDues}`, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Unpaid fees' },
    { title: 'Classes Taught', value: stats.classesThisMonth, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Sessions this month' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back!</h1>
        <p className="text-slate-500">Here's a summary of your tutoring practice this month.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className={`text-2xl font-bold ${stat.title === 'Pending Dues' ? 'text-rose-500' : 'text-slate-800'}`}>
                {stat.value}
              </h3>
              <p className={`text-xs font-medium mt-2 ${
                stat.title === 'Monthly Earnings' ? 'text-indigo-500' : 
                stat.title === 'Total Students' ? 'text-emerald-500' : 
                stat.title === 'Pending Dues' ? 'text-slate-400' : 'text-amber-500'
              }`}>
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Classes */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-slate-800">Recent Classes</h3>
            <button className="text-indigo-600 text-xs font-semibold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentClasses.map((c) => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{c.studentName}</p>
                  <p className="text-xs text-slate-500">{c.topic}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    c.status === 'Attended' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {c.status}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">{c.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dues by Student */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-slate-800">Dues by Student</h3>
            <button className="text-indigo-600 text-xs font-semibold hover:underline">Reminder All</button>
          </div>
          <div className="p-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Student</TableHead>
                  <TableHead className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Amount</TableHead>
                  <TableHead className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50 border-slate-50">
                    <TableCell className="px-6 py-4 text-sm font-medium text-slate-800">{p.studentName}</TableCell>
                    <TableCell className="px-6 py-4 text-sm font-bold text-rose-500">${p.amount}</TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button variant="secondary" size="sm" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-xs">
                        Record
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
