
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BulkAttendanceEntry = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"department" | "status">("department");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    defaultInTime: "09:00",
    defaultOutTime: "18:00",
    defaultStatus: "1" // For office staff
  });
  const { toast } = useToast();

  useEffect(() => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    setEmployees(storedEmployees);
  }, []);

  useEffect(() => {
    if (selectedFilter) {
      const filtered = employees.filter(emp => 
        filterType === "department" 
          ? emp.department === selectedFilter
          : emp.status === selectedFilter
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees([]);
    }
  }, [selectedFilter, filterType, employees]);

  const getUniqueValues = (field: string) => {
    return Array.from(new Set(employees.map(emp => emp[field])));
  };

  const calculateWorkingHours = (inTime: string, outTime: string) => {
    if (!inTime || !outTime) return 0;
    
    const inDate = new Date(`2000-01-01T${inTime}`);
    const outDate = new Date(`2000-01-01T${outTime}`);
    
    if (outDate < inDate) {
      outDate.setDate(outDate.getDate() + 1);
    }
    
    const diffMs = outDate.getTime() - inDate.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const handleBulkSave = () => {
    if (filteredEmployees.length === 0) {
      toast({
        title: "Error",
        description: "No employees selected for bulk attendance",
        variant: "destructive"
      });
      return;
    }

    const existingAttendance = JSON.parse(localStorage.getItem("attendance") || "[]");
    let updatedCount = 0;
    let addedCount = 0;

    filteredEmployees.forEach(employee => {
      const isOfficeStaff = employee.department === "OFFICE STAFF";
      
      // Check if attendance already exists
      const existingRecordIndex = existingAttendance.findIndex(
        (record: any) => record.employeeId === employee.id && record.date === attendanceData.date
      );

      const workingHours = isOfficeStaff 
        ? (attendanceData.defaultStatus === "1" ? 8 : 0) 
        : calculateWorkingHours(attendanceData.defaultInTime, attendanceData.defaultOutTime);

      const attendanceRecord = {
        id: existingRecordIndex >= 0 ? existingAttendance[existingRecordIndex].id : Date.now().toString() + employee.id,
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        status: employee.status,
        date: attendanceData.date,
        inTime: isOfficeStaff ? "" : attendanceData.defaultInTime,
        outTime: isOfficeStaff ? "" : attendanceData.defaultOutTime,
        workingHours: workingHours,
        attendanceStatus: isOfficeStaff ? attendanceData.defaultStatus : "1",
        isOfficeStaff: isOfficeStaff,
        createdAt: existingRecordIndex >= 0 ? existingAttendance[existingRecordIndex].createdAt : new Date().toISOString()
      };

      if (existingRecordIndex >= 0) {
        existingAttendance[existingRecordIndex] = attendanceRecord;
        updatedCount++;
      } else {
        existingAttendance.push(attendanceRecord);
        addedCount++;
      }
    });

    localStorage.setItem("attendance", JSON.stringify(existingAttendance));

    toast({
      title: "Success",
      description: `Bulk attendance recorded: ${addedCount} new records, ${updatedCount} updated records`
    });

    // Reset form
    setSelectedFilter("");
    setFilteredEmployees([]);
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Users size={24} />
          Bulk Attendance Entry
        </CardTitle>
        <CardDescription className="text-purple-100">
          Mark attendance for multiple employees by department or status
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Date and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={attendanceData.date}
                onChange={(e) => setAttendanceData({ ...attendanceData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Filter By</Label>
              <Select onValueChange={(value: "department" | "status") => {
                setFilterType(value);
                setSelectedFilter("");
                setFilteredEmployees([]);
              }} value={filterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{filterType === "department" ? "Department" : "Status"}</Label>
              <Select onValueChange={setSelectedFilter} value={selectedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${filterType}`} />
                </SelectTrigger>
                <SelectContent>
                  {getUniqueValues(filterType).map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Default Time Settings for Factory Workers */}
          {filteredEmployees.some(emp => emp.department !== "OFFICE STAFF") && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-3 text-blue-800">Default Times for Factory Workers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default In Time</Label>
                  <Input
                    type="time"
                    value={attendanceData.defaultInTime}
                    onChange={(e) => setAttendanceData({ ...attendanceData, defaultInTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Out Time</Label>
                  <Input
                    type="time"
                    value={attendanceData.defaultOutTime}
                    onChange={(e) => setAttendanceData({ ...attendanceData, defaultOutTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Default Status for Office Staff */}
          {filteredEmployees.some(emp => emp.department === "OFFICE STAFF") && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-3 text-green-800">Default Status for Office Staff</h3>
              <div className="space-y-2">
                <Label>Default Attendance Status</Label>
                <Select onValueChange={(value) => setAttendanceData({ ...attendanceData, defaultStatus: value })}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Present (1)</SelectItem>
                    <SelectItem value="L">Leave (L)</SelectItem>
                    <SelectItem value="A">Absent (A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Employee List Preview */}
          {filteredEmployees.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                Selected Employees ({filteredEmployees.length})
              </h3>
              <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="font-medium text-sm">{employee.name}</div>
                      <div className="text-xs text-gray-600">{employee.employeeId}</div>
                      <div className="flex gap-1 mt-1">
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-blue-100 text-blue-800"
                        >
                          {employee.department}
                        </Badge>
                        <Badge 
                          variant={employee.status === "PAYROLL" ? "default" : "secondary"}
                          className={`text-xs ${
                            employee.status === "PAYROLL" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {employee.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleBulkSave}
              disabled={filteredEmployees.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Save size={16} className="mr-2" />
              Save Bulk Attendance ({filteredEmployees.length} employees)
            </Button>
          </div>

          {filteredEmployees.length === 0 && selectedFilter && (
            <div className="text-center py-8 text-gray-500">
              No employees found for the selected {filterType}.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkAttendanceEntry;
