import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, type User, type InsertUser, type ActivityLog, type UserSession } from "@shared/schema";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Activity, 
  Clock, 
  UserCheck, 
  UserX,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface UsersPageProps {
  userRole: string;
}

interface UserWithDetails extends User {
  lastLogin?: Date;
  activityCount?: number;
  isOnline?: boolean;
}

export default function UsersPage({ userRole }: UsersPageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: users = [], isLoading: usersLoading } = useQuery<UserWithDetails[]>({
    queryKey: ["/api/users"],
  });

  const { data: activityLogs = [], isLoading: activityLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs", selectedUserId],
    enabled: !!selectedUserId,
  });

  const { data: userSessions = [], isLoading: sessionsLoading } = useQuery<UserSession[]>({
    queryKey: ["/api/user-sessions", selectedUserId],
    enabled: !!selectedUserId,
  });

  const createUserMutation = useMutation({
    mutationFn: (data: InsertUser & { role: string }) => apiRequest("POST", "/api/users", data),
    onSuccess: () => {
      toast({ title: "تم إنشاء المستخدم بنجاح" });
      setShowUserForm(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء المستخدم",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => 
      apiRequest("PUT", `/api/users/${id}`, data),
    onSuccess: () => {
      toast({ title: "تم تحديث المستخدم بنجاح" });
      setShowUserForm(false);
      setEditingUser(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث المستخدم",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      toast({ title: "تم حذف المستخدم بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف المستخدم",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertUser & { role: string }>({
    resolver: zodResolver(insertUserSchema.extend({ role: z.string() })),
    defaultValues: {
      username: "",
      password: "",
      role: "seller",
    },
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const onSubmit = (data: InsertUser & { role: string }) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      password: "",
      role: user.role,
    });
    setShowUserForm(true);
  };

  const handleDelete = (user: User) => {
    if (confirm(`هل أنت متأكد من حذف المستخدم "${user.username}"؟`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const getActionText = (action: string) => {
    const actions: Record<string, string> = {
      add: "إضافة",
      edit: "تعديل",
      delete: "حذف",
      sell: "بيع",
      login: "تسجيل دخول",
      logout: "تسجيل خروج"
    };
    return actions[action] || action;
  };

  const getEntityText = (entityType: string) => {
    const entities: Record<string, string> = {
      inventory: "مخزون",
      user: "مستخدم",
      manufacturer: "شركة مصنعة"
    };
    return entities[entityType] || entityType;
  };

  if (userRole !== "admin") {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ليس لديك صلاحية للوصول إلى هذه الصفحة
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  الصفحة الرئيسية
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">إدارة المستخدمين</h1>
                <p className="text-slate-600">إدارة المستخدمين والصلاحيات وسجل النشاط</p>
              </div>
            </div>
            <Button onClick={() => setShowUserForm(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مستخدم
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="activity">سجل النشاط</TabsTrigger>
            <TabsTrigger value="sessions">جلسات الدخول</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 ml-2" />
                  المستخدمين ({filteredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="البحث عن مستخدم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="فلترة حسب الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأدوار</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                      <SelectItem value="seller">بائع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم المستخدم</TableHead>
                        <TableHead>الدور</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>آخر دخول</TableHead>
                        <TableHead>عدد العمليات</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            جاري التحميل...
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            لا يوجد مستخدمين
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role === "admin" ? "مدير" : "بائع"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.isOnline ? "default" : "outline"}>
                                {user.isOnline ? "متصل" : "غير متصل"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.lastLogin ? 
                                format(new Date(user.lastLogin), "dd/MM/yyyy HH:mm", { locale: ar }) 
                                : "لم يسجل دخول"}
                            </TableCell>
                            <TableCell>{user.activityCount || 0}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedUserId(user.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(user)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 ml-2" />
                  سجل النشاط
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedUserId ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>التاريخ والوقت</TableHead>
                          <TableHead>العملية</TableHead>
                          <TableHead>النوع</TableHead>
                          <TableHead>التفاصيل</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLoading ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8">
                              جاري التحميل...
                            </TableCell>
                          </TableRow>
                        ) : activityLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                              لا يوجد نشاط مسجل
                            </TableCell>
                          </TableRow>
                        ) : (
                          activityLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ar })}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getActionText(log.action)}
                                </Badge>
                              </TableCell>
                              <TableCell>{getEntityText(log.entityType)}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {log.details || "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    اختر مستخدماً لعرض سجل النشاط
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 ml-2" />
                  جلسات الدخول والخروج
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedUserId ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>وقت الدخول</TableHead>
                          <TableHead>وقت الخروج</TableHead>
                          <TableHead>المدة</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>عنوان IP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessionsLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              جاري التحميل...
                            </TableCell>
                          </TableRow>
                        ) : userSessions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                              لا توجد جلسات مسجلة
                            </TableCell>
                          </TableRow>
                        ) : (
                          userSessions.map((session) => (
                            <TableRow key={session.id}>
                              <TableCell>
                                {format(new Date(session.loginTime), "dd/MM/yyyy HH:mm", { locale: ar })}
                              </TableCell>
                              <TableCell>
                                {session.logoutTime ? 
                                  format(new Date(session.logoutTime), "dd/MM/yyyy HH:mm", { locale: ar }) 
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {session.logoutTime ? 
                                  `${Math.round((new Date(session.logoutTime).getTime() - new Date(session.loginTime).getTime()) / (1000 * 60))} دقيقة`
                                  : "جلسة نشطة"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={session.isActive ? "default" : "outline"}>
                                  {session.isActive ? "نشط" : "منتهية"}
                                </Badge>
                              </TableCell>
                              <TableCell>{session.ipAddress || "-"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    اختر مستخدماً لعرض جلسات الدخول
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Form Dialog */}
      <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المستخدم</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل اسم المستخدم" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={editingUser ? "اتركها فارغة للاحتفاظ بالحالية" : "أدخل كلمة المرور"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدور</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر دور المستخدم" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">مدير</SelectItem>
                        <SelectItem value="seller">بائع</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                    form.reset();
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  {editingUser ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}