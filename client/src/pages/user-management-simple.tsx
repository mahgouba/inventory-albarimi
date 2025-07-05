import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  ArrowLeft,
  Sun,
  Moon
} from "lucide-react";

interface User {
  id: number;
  username: string;
  role: string;
  createdAt?: string;
}

export default function UserManagementSimple() {
  const { toast } = useToast();
  const { darkMode, toggleDarkMode } = useTheme();
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "seller"
  });

  // Fetch users
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/users"],
    retry: false,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string; role: string }) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء المستخدم بنجاح",
        description: "تم إضافة المستخدم الجديد إلى النظام",
      });
      setNewUserOpen(false);
      setFormData({ username: "", password: "", role: "seller" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء المستخدم",
        description: error.message || "حدث خطأ أثناء إنشاء المستخدم",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await apiRequest("PUT", `/api/users/${userData.id}`, userData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث المستخدم بنجاح",
        description: "تم حفظ التغييرات",
      });
      setEditUserOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث المستخدم",
        description: error.message || "حدث خطأ أثناء تحديث المستخدم",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "تم حذف المستخدم بنجاح",
        description: "تم إزالة المستخدم من النظام",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف المستخدم",
        description: error.message || "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    if (!formData.username || !formData.password) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(formData);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: "",
      role: user.role
    });
    setEditUserOpen(true);
  };

  const handleUpdateUser = () => {
    if (!formData.username || !selectedUser) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const updateData: any = {
      id: selectedUser.id,
      username: formData.username,
      role: formData.role
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    updateUserMutation.mutate(updateData);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive" className="bg-red-600 text-white"><Shield size={12} className="ml-1" />أدمن</Badge>;
      case "seller":
        return <Badge variant="secondary" className="bg-blue-600 text-white"><ShieldCheck size={12} className="ml-1" />مستخدم</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">جاري تحميل المستخدمين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black" dir="rtl">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-slate-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100">
                  <ArrowLeft size={18} className="ml-2" />
                  العودة للرئيسية
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">إدارة المستخدمين</h1>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* Dark Mode Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100" 
                onClick={toggleDarkMode}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Users className="w-8 h-8 text-teal-600" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">المستخدمين</h2>
                <p className="text-slate-600 dark:text-slate-400">إدارة حسابات المستخدمين في النظام</p>
              </div>
            </div>

            <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  <Plus size={16} className="ml-2" />
                  إضافة مستخدم جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  أدخل بيانات المستخدم الجديد
                </div>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="أدخل اسم المستخدم"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="أدخل كلمة المرور"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">نوع المستخدم</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع المستخدم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seller">مستخدم عادي</SelectItem>
                        <SelectItem value="admin">أدمن</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2 space-x-reverse pt-4">
                    <Button
                      onClick={handleCreateUser}
                      disabled={createUserMutation.isPending}
                      className="bg-teal-600 hover:bg-teal-700 text-white flex-1"
                    >
                      {createUserMutation.isPending ? "جاري الإنشاء..." : "إنشاء المستخدم"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setNewUserOpen(false)}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المستخدمين ({(users as User[]).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المستخدم</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(users as User[]).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('ar-SA')
                          : 'غير محدد'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 space-x-reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit size={14} className="ml-1" />
                            تعديل
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} className="ml-1" />
                            حذف
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل المستخدم</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              تحديث بيانات المستخدم المحدد
            </div>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-username">اسم المستخدم</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
              <div>
                <Label htmlFor="edit-password">كلمة المرور الجديدة (اختياري)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="اتركه فارغ للاحتفاظ بكلمة المرور الحالية"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">نوع المستخدم</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المستخدم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seller">مستخدم عادي</SelectItem>
                    <SelectItem value="admin">أدمن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2 space-x-reverse pt-4">
                <Button
                  onClick={handleUpdateUser}
                  disabled={updateUserMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700 text-white flex-1"
                >
                  {updateUserMutation.isPending ? "جاري التحديث..." : "حفظ التغييرات"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditUserOpen(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}