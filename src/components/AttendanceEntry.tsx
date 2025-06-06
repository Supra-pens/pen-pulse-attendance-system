
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, Save } from "lucide-react";

const AttendanceEntry = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    inTime: "",
    outTime: "",
    status: "" // For office staff: 1, L, A
  });
  const { toast } = useToast();

  useEffect(() => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    setEmployees(storedEmployees);
  }, []);

  const selectedEmp = employees.find(emp => emp.id === selectedEmployee);
  const isOfficeStaff = selectedEmp?.department === "OFFICE STAFF";

  const calculateWorkingHours = (inTime: string, outTime: string) => {
    if (!inTime || !outTime) return 0;
    
    const inDate = new Date(`2000-01-01T${inTime}`);
    const outDate = new Date(`2000-01-01T${outTime}`);
    
    if (outDate < inDate) {
      outDate.setDate(outDate.getDate() + 1);
    }
    
    const diffMs = outDate.getTime() - inDate.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive"
      });
      return;
    }

    if (isOfficeStaff) {
      if (!attendanceData.status) {
        toast({
          title: "Error",
          description: "Please enter status for office staff (1 for present, L for leave, A for absent)",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!attendanceData.inTime || !attendanceData.outTime) {
        toast({
          title: "Error",
          description: "Please enter both in-time and out-time for factory workers",
          variant: "destructive"
        });
        return;
      }
    }

    // Get existing attendance records
    const existingAttendance = JSON.parse(localStorage.getItem("attendance") || "[]");
    
    // Check if attendance already exists for this employee on this date
    const existingRecord = existingAttendance.find(
      (record: any) => record.employeeId === selectedEmployee && record.date === attendanceData.date
    );

    const workingHours = isOfficeStaff 
      ? (attendanceData.status === "1" ? 8 : 0) 
      : calculateWorkingHours(attendanceData.inTime, attendanceData.outTime);

    const attendanceRecord = {
      id: existingRecord?.id || Date.now().toString(),
      employeeId: selectedEmployee,
      employeeName: selectedEmp.name,
      department: selectedEmp.department,
      status: selectedEmp.status,
      date: attendanceData.date,
      inTime: isOfficeStaff ? "" : attendanceData.inTime,
      outTime: isOfficeStaff ? "" : attendanceData.outTime,
      workingHours: workingHours,
      attendanceStatus: isOfficeStaff ? attendanceData.status : "1",
      isOfficeStaff: isOfficeStaff,
      createdAt: existingRecord?.createdAt || new Date().toISOString()
    };

    if (existingRecord) {
      // Update existing record
      const updatedAttendance = existingAttendance.map((record: any) =>
        record.id === existingRecord.id ? attendanceRecord : record
      );
      localStorage.setItem("attendance", JSON.stringify(updatedAttendance));
    } else {
      // Add new record
      existingAttendance.push(attendanceRecord);
      localStorage.setItem("attendance", JSON.stringify(existingAttendance));
    }

    toast({
      title: "Success",
      description: "Attendance recorded successfully"
    });

    // Reset form
    setAttendanceData({
      date: new Date().toISOString().split('T')[0],
      inTime: "",
      outTime: "",
      status: ""
    });
    setSelectedEmployee("");
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Clock size={24} />
          Daily Attendance Entry
        </CardTitle>
        <CardDescription className="text-green-100">
          Record daily attendance for employees
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={attendanceData.date}
                onChange={(e) => setAttendanceData({ ...attendanceData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.employeeId} ({emp.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEmp && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Employee Details</h3>
              <p><strong>Name:</strong> {selectedEmp.name}</p>
              <p><strong>Department:</strong> {selectedEmp.department}</p>
              <p><strong>Status:</strong> {selectedEmp.status}</p>
            </div>
          )}

          {isOfficeStaff ? (
            <div className="space-y-2">
              <Label>Attendance Status</Label>
              <Select onValueChange={(value) => setAttendanceData({ ...attendanceData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Present (1)</SelectItem>
                  <SelectItem value="L">Leave (L)</SelectItem>
                  <SelectItem value="A">Absent (A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>In Time</Label>
                <Input
                  type="time"
                  value={attendanceData.inTime}
                  onChange={(e) => setAttendanceData({ ...attendanceData, inTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Out Time</Label>
                <Input
                  type="time"
                  value={attendanceData.outTime}
                  onChange={(e) => setAttendanceData({ ...attendanceData, outTime: e.target.value })}
                />
              </div>
            </div>
          )}

          {!isOfficeStaff && attendanceData.inTime && attendanceData.outTime && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-800">
                Total Working Hours: {calculateWorkingHours(attendanceData.inTime, attendanceData.outTime).toFixed(2)} hours
              </p>
            </div>
          )}

          <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Save size={16} className="mr-2" />
            Save Attendance
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttendanceEntry;
