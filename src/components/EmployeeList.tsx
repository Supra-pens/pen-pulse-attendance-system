
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Filter, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const DUMMY_EMPLOYEES = [
  { name: "Rajesh Kumar", department: "MOULDING DEPT. (A & B SHIFT)", status: "PAYROLL", employeeId: "MP001" },
  { name: "Priya Sharma", department: "MOULDING DEPT. (A & B SHIFT)", status: "NON PAYROLL", employeeId: "MN001" },
  { name: "Amit Singh", department: "FOILING & HOT STAMPING DEPT.", status: "PAYROLL", employeeId: "FP001" },
  { name: "Sunita Devi", department: "FOILING & HOT STAMPING DEPT.", status: "NON PAYROLL", employeeId: "FN001" },
  { name: "Vikash Yadav", department: "DAY SHIFT REFILLING DEPT.", status: "PAYROLL", employeeId: "RP001" },
  { name: "Kavita Gupta", department: "DAY SHIFT REFILLING DEPT.", status: "NON PAYROLL", employeeId: "RN001" },
  { name: "Ravi Verma", department: "EXTRUSION DEPT. (A & B SHIFT)", status: "PAYROLL", employeeId: "EP001" },
  { name: "Meera Joshi", department: "EXTRUSION DEPT. (A & B SHIFT)", status: "NON PAYROLL", employeeId: "EN001" },
  { name: "Suresh Patel", department: "PEN ASSEMBLING DEPT.", status: "PAYROLL", employeeId: "PP001" },
  { name: "Anita Roy", department: "PEN ASSEMBLING DEPT.", status: "NON PAYROLL", employeeId: "PN001" },
  { name: "Deepak Mishra", department: "DESPATCH DEPT. DAY SHIFT", status: "PAYROLL", employeeId: "DP001" },
  { name: "Rekha Singh", department: "DESPATCH DEPT. DAY SHIFT", status: "NON PAYROLL", employeeId: "DN001" },
  { name: "Manish Agarwal", department: "OFFICE STAFF", status: "PAYROLL", employeeId: "OP001" },
  { name: "Seema Khanna", department: "OFFICE STAFF", status: "PAYROLL", employeeId: "OP002" },
  { name: "Rohit Saxena", department: "OFFICE STAFF", status: "NON PAYROLL", employeeId: "ON001" }
];

const EmployeeList = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const { toast } = useToast();

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

  const addDummyEmployees = () => {
    const existingEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    const existingIds = existingEmployees.map((emp: any) => emp.employeeId);
    
    const newEmployees = DUMMY_EMPLOYEES.filter(emp => !existingIds.includes(emp.employeeId));
    
    if (newEmployees.length === 0) {
      toast({
        title: "Info",
        description: "All dummy employees already exist in the system",
        variant: "default"
      });
      return;
    }

    const employeesToAdd = newEmployees.map(emp => ({
      ...emp,
      registeredAt: new Date().toISOString(),
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));

    const updatedEmployees = [...existingEmployees, ...employeesToAdd];
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
    setEmployees(updatedEmployees);

    toast({
      title: "Success",
      description: `Added ${newEmployees.length} dummy employees for testing`
    });
  };

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

  const getFilteredStats = () => {
    return {
      total: filteredEmployees.length,
      payroll: filteredEmployees.filter(emp => emp.status === "PAYROLL").length,
      nonPayroll: filteredEmployees.filter(emp => emp.status === "NON PAYROLL").length
    };
  };

  const filteredStats = getFilteredStats();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                <p className="text-3xl font-bold text-purple-600">{filteredStats.total}</p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
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
          {/* Add Dummy Data Button */}
          <div className="mb-6">
            <Button 
              onClick={addDummyEmployees}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <UserPlus size={16} className="mr-2" />
              Add Dummy Employees for Testing
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Filter Results</label>
              <div className="p-2 border rounded-md bg-gray-50">
                <div className="text-sm">
                  <span className="font-medium">Total: {filteredStats.total}</span>
                  <span className="mx-2">|</span>
                  <span className="text-green-600">Payroll: {filteredStats.payroll}</span>
                  <span className="mx-2">|</span>
                  <span className="text-orange-600">Non-Payroll: {filteredStats.nonPayroll}</span>
                </div>
              </div>
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
