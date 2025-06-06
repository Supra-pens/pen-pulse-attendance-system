
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

const DEPARTMENTS = [
  "MOULDING DEPT. (A & B SHIFT)",
  "FOILING & HOT STAMPING DEPT.",
  "DAY SHIFT REFILLING DEPT.",
  "EXTRUSION DEPT. (A & B SHIFT)",
  "PEN ASSEMBLING DEPT.",
  "DESPATCH DEPT. DAY SHIFT",
  "OFFICE STAFF"
];

const STATUS_OPTIONS = ["PAYROLL", "NON PAYROLL"];

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    status: "",
    employeeId: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.department || !formData.status || !formData.employeeId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Get existing employees from localStorage
    const existingEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    
    // Check if employee ID already exists
    if (existingEmployees.some((emp: any) => emp.employeeId === formData.employeeId)) {
      toast({
        title: "Error",
        description: "Employee ID already exists",
        variant: "destructive"
      });
      return;
    }

    // Add new employee
    const newEmployee = {
      ...formData,
      registeredAt: new Date().toISOString(),
      id: Date.now().toString()
    };

    existingEmployees.push(newEmployee);
    localStorage.setItem("employees", JSON.stringify(existingEmployees));

    toast({
      title: "Success",
      description: "Employee registered successfully"
    });

    // Reset form
    setFormData({
      name: "",
      department: "",
      status: "",
      employeeId: ""
    });
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <UserPlus size={24} />
          Register New Employee
        </CardTitle>
        <CardDescription className="text-blue-100">
          Add a new employee to the attendance system
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                placeholder="Enter employee ID"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Employee Name</Label>
              <Input
                id="name"
                placeholder="Enter employee name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, department: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
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
            <Label>Status</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
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

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            Register Employee
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeRegistration;
