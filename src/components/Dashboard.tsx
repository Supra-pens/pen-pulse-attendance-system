
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";

interface EmployeeStats {
  name: string;
  department: string;
  status: string;
  totalHours: number;
  totalDays: number;
  presentDays: number;
  leaveDays: number;
  absentDays: number;
}

interface DepartmentSummary {
  name: string;
  totalHours: number;
  totalEmployees: number;
  presentCount: number;
  leaveCount: number;
  absentCount: number;
}

const Dashboard = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");

  useEffect(() => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    const storedAttendance = JSON.parse(localStorage.getItem("attendance") || "[]");
    setEmployees(storedEmployees);
    setAttendance(storedAttendance);
  }, []);

  const getMonthlyReport = (): EmployeeStats[] => {
    const monthAttendance = attendance.filter(record => 
      record.date.startsWith(selectedMonth) &&
      (selectedDepartment === "ALL" || record.department === selectedDepartment)
    );

    const employeeStats: Record<string, EmployeeStats> = {};

    monthAttendance.forEach(record => {
      if (!employeeStats[record.employeeId]) {
        employeeStats[record.employeeId] = {
          name: record.employeeName,
          department: record.department,
          status: record.status,
          totalHours: 0,
          totalDays: 0,
          presentDays: 0,
          leaveDays: 0,
          absentDays: 0
        };
      }

      if (record.isOfficeStaff) {
        if (record.attendanceStatus === "1") {
          employeeStats[record.employeeId].totalHours += 8;
          employeeStats[record.employeeId].totalDays += 1;
          employeeStats[record.employeeId].presentDays += 1;
        } else if (record.attendanceStatus === "L") {
          employeeStats[record.employeeId].leaveDays += 1;
        } else if (record.attendanceStatus === "A") {
          employeeStats[record.employeeId].absentDays += 1;
        }
      } else {
        employeeStats[record.employeeId].totalHours += record.workingHours;
        employeeStats[record.employeeId].totalDays += 1;
        employeeStats[record.employeeId].presentDays += 1;
      }
    });

    return Object.values(employeeStats);
  };

  const getDepartmentSummary = (): DepartmentSummary[] => {
    const monthAttendance = attendance.filter(record => record.date.startsWith(selectedMonth));
    const summary: Record<string, Omit<DepartmentSummary, 'totalEmployees'> & { totalEmployees: Set<string> }> = {};

    monthAttendance.forEach(record => {
      if (!summary[record.department]) {
        summary[record.department] = {
          name: record.department,
          totalHours: 0,
          totalEmployees: new Set(),
          presentCount: 0,
          leaveCount: 0,
          absentCount: 0
        };
      }

      summary[record.department].totalEmployees.add(record.employeeId);
      summary[record.department].totalHours += record.workingHours || 0;

      if (record.attendanceStatus === "1") {
        summary[record.department].presentCount += 1;
      } else if (record.attendanceStatus === "L") {
        summary[record.department].leaveCount += 1;
      } else if (record.attendanceStatus === "A") {
        summary[record.department].absentCount += 1;
      }
    });

    return Object.values(summary).map((dept) => ({
      ...dept,
      totalEmployees: dept.totalEmployees.size
    }));
  };

  const monthlyReport = getMonthlyReport();
  const departmentSummary = getDepartmentSummary();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const departments = ["ALL", ...Array.from(new Set(employees.map(emp => emp.department)))];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Report Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Department</label>
              <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-blue-600">{monthlyReport.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-3xl font-bold text-green-600">
                  {monthlyReport.reduce((sum, emp) => sum + emp.totalHours, 0).toFixed(1)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Hours/Employee</p>
                <p className="text-3xl font-bold text-purple-600">
                  {monthlyReport.length > 0 
                    ? (monthlyReport.reduce((sum, emp) => sum + emp.totalHours, 0) / monthlyReport.length).toFixed(1)
                    : "0"}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-orange-600">{departmentSummary.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentSummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={10}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalHours" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentSummary}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${percent > 5 ? name.substring(0, 10) : ''} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalEmployees"
                >
                  {departmentSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Employee Report */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Monthly Report - {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
          <CardDescription>
            Detailed breakdown of working hours and days for each employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Employee Name</th>
                  <th className="border border-gray-300 p-3 text-left">Department</th>
                  <th className="border border-gray-300 p-3 text-left">Status</th>
                  <th className="border border-gray-300 p-3 text-right">Total Hours</th>
                  <th className="border border-gray-300 p-3 text-right">Working Days</th>
                  <th className="border border-gray-300 p-3 text-right">Present</th>
                  <th className="border border-gray-300 p-3 text-right">Leave</th>
                  <th className="border border-gray-300 p-3 text-right">Absent</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport.map((employee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">{employee.name}</td>
                    <td className="border border-gray-300 p-3 text-sm">{employee.department}</td>
                    <td className="border border-gray-300 p-3">
                      <Badge 
                        variant={employee.status === "PAYROLL" ? "default" : "secondary"}
                        className={employee.status === "PAYROLL" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                      >
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="border border-gray-300 p-3 text-right font-mono">
                      {employee.totalHours.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-3 text-right font-mono">
                      {employee.totalDays}
                    </td>
                    <td className="border border-gray-300 p-3 text-right font-mono text-green-600">
                      {employee.presentDays}
                    </td>
                    <td className="border border-gray-300 p-3 text-right font-mono text-yellow-600">
                      {employee.leaveDays}
                    </td>
                    <td className="border border-gray-300 p-3 text-right font-mono text-red-600">
                      {employee.absentDays}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {monthlyReport.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendance data found for the selected month and department.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
