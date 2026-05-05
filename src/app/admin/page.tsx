import { createServerSupabase } from '@/lib/supabase/server';
import { BookOpen, ShoppingCart, DollarSign, MessageSquare } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = createServerSupabase();

  // Fetch counts (these will work once Supabase is connected)
  // const { count: bookCount } = await supabase.from('books').select('*', { count: 'exact', head: true });
  // const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  // const { count: messageCount } = await supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false);

  const stats = [
    { label: 'Total Books', value: '—', icon: BookOpen, color: 'text-blue-400' },
    { label: 'Total Orders', value: '—', icon: ShoppingCart, color: 'text-green-400' },
    { label: 'Revenue', value: '—', icon: DollarSign, color: 'text-yellow-400' },
    { label: 'Unread Messages', value: '—', icon: MessageSquare, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-surface-400 mt-1">Welcome back, Eric.</p>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-surface-400">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent orders placeholder */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
        <div className="text-center py-8 text-surface-400">
          <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Orders will appear here once your store is live.</p>
        </div>
      </div>
    </div>
  );
}
