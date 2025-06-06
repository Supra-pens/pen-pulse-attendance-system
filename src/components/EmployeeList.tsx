
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Filter } from "lucide-react";

const DEPARTMENTS = [
  "ALL",
  "MOULDING DEPT. (A & B SHIFT)",
  "FOILING & HOT STAMPING DEPT.",
  "DAY SHIFT REFILLING DEPT.",
  "EXTRUSION DEPT. (A & B SHIFT)",
  "PEN ASSEMBLING DEPT.",
  "DESPATCH DEPT. DAY SHIFT",
  "OFFICE STAFF"
];

const STATUS_OPTIONS = ["ALL", "PAYROLL", "NON PAYROLL"];

const EmployeeList = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    setEmployees(storedEmployees);
    setFilteredEmployees(storedEmployees);
  }, []);

  useEffect(() => {
    let filtered = employees;

    if (selectedDepartment !== "ALL") {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }

    if (selectedStatus !== "ALL") {
      filtered = filtered.filter(emp => emp.status === selectedStatus);
    }

    setFilteredEmployees(filtered);
  }, [employees, selectedDepartment, selectedStatus]);

  const getDepartmentStats = () => {
    const stats: any = {};
    employees.forEach(emp => {
      if (!stats[emp.department]) {
        stats[emp.department] = { total: 0, payroll: 0, nonPayroll: 0 };
      }
      stats[emp.department].total++;
      if (emp.status === "PAYROLL") {
        stats[emp.department].payroll++;
      } else {
        stats[emp.department].nonPayroll++;
      }
    });
    return stats;
  };

  const departmentStats = getDepartmentStats();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-blue-600">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payroll Employees</p>
                <p className="text-3xl font-bold text-green-600">
                  {employees.filter(emp => emp.status === "PAYROLL").length}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Payroll</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non-Payroll Employees</p>
                <p className="text-3xl font-bold text-orange-600">
                  {employees.filter(emp => emp.status === "NON PAYROLL").length}
                </p>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">Non-Payroll</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Users size={24} />
            Employee Directory
          </CardTitle>
          <CardDescription className="text-purple-100">
            Department and status wise employee listing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Department</label>
              <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Status</label>
              <Select onValueChange={setSelectedStatus} value={selectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Employee Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Employee ID</th>
                  <th className="border border-gray-300 p-3 text-left">Name</th>
                  <th className="border border-gray-300 p-3 text-left">Department</th>
                  <th className="border border-gray-300 p-3 text-left">Status</th>
                  <th className="border border-gray-300 p-3 text-left">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-mono">{employee.employeeId}</td>
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
                    <td className="border border-gray-300 p-3 text-sm text-gray-600">
                      {new Date(employee.registeredAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No employees found matching the selected filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Statistics */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Department Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(departmentStats).map(([dept, stats]: [string, any]) => (
              <div key={dept} className="p-4 border rounded-lg">
                <h4 className="font-semibold text-sm mb-2">{dept}</h4>
                <div className="space-y-1 text-xs">
                  <p>Total: <span className="font-bold">{stats.total}</span></p>
                  <p>Payroll: <span className="font-bold text-green-600">{stats.payroll}</span></p>
                  <p>Non-Payroll: <span className="font-bold text-orange-600">{stats.nonPayroll}</span></p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeList;
