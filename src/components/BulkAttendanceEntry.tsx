
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Save, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BulkAttendanceEntry = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    defaultStatus: "1" // For office staff
  });
  const [individualTimes, setIndividualTimes] = useState<{[key: string]: {inTime: string, outTime: string, status: string}}>({});
  const { toast } = useToast();

  useEffect(() => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    setEmployees(storedEmployees);
  }, []);

  useEffect(() => {
    let filtered = employees;

    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    setFilteredEmployees(filtered);

    // Initialize individual times for new employees
    const newTimes = { ...individualTimes };
    filtered.forEach(emp => {
      if (!newTimes[emp.id]) {
        const isOfficeStaff = emp.department === "OFFICE STAFF";
        newTimes[emp.id] = {
          inTime: isOfficeStaff ? "" : "09:00",
          outTime: isOfficeStaff ? "" : "18:00",
          status: isOfficeStaff ? "1" : "1"
        };
      }
    });
    setIndividualTimes(newTimes);
  }, [departmentFilter, statusFilter, employees]);

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

  const updateIndividualTime = (employeeId: string, field: 'inTime' | 'outTime' | 'status', value: string) => {
    setIndividualTimes(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value
      }
    }));
  };

  const clearDepartmentFilter = () => {
    setDepartmentFilter("");
  };

  const clearStatusFilter = () => {
    setStatusFilter("");
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
      const empTimes = individualTimes[employee.id];
      
      // Check if attendance already exists
      const existingRecordIndex = existingAttendance.findIndex(
        (record: any) => record.employeeId === employee.id && record.date === attendanceData.date
      );

      const workingHours = isOfficeStaff 
        ? (empTimes?.status === "1" ? 8 : 0) 
        : calculateWorkingHours(empTimes?.inTime || "", empTimes?.outTime || "");

      const attendanceRecord = {
        id: existingRecordIndex >= 0 ? existingAttendance[existingRecordIndex].id : Date.now().toString() + employee.id,
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        status: employee.status,
        date: attendanceData.date,
        inTime: isOfficeStaff ? "" : (empTimes?.inTime || ""),
        outTime: isOfficeStaff ? "" : (empTimes?.outTime || ""),
        workingHours: workingHours,
        attendanceStatus: empTimes?.status || "1",
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
    setDepartmentFilter("");
    setStatusFilter("");
    setFilteredEmployees([]);
    setIndividualTimes({});
  };

  return (
    <Card className="max-w-6xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Users size={24} />
          Bulk Attendance Entry
        </CardTitle>
        <CardDescription className="text-purple-100">
          Mark attendance for multiple employees with individual time settings
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={attendanceData.date}
                onChange={(e) => setAttendanceData({ ...attendanceData, date: e.target.value })}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span className="font-medium">Filter by Department:</span>
              </div>
              {getUniqueValues("department").map((dept) => (
                <Button
                  key={dept}
                  variant={departmentFilter === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDepartmentFilter(dept)}
                  className="text-xs"
                >
                  {dept}
                </Button>
              ))}
              {departmentFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDepartmentFilter}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={14} />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span className="font-medium">Filter by Status:</span>
              </div>
              {getUniqueValues("status").map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="text-xs"
                >
                  {status}
                </Button>
              ))}
              {statusFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearStatusFilter}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={14} />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(departmentFilter || statusFilter) && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Active Filters:</h4>
              <div className="flex gap-2">
                {departmentFilter && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Department: {departmentFilter}
                  </Badge>
                )}
                {statusFilter && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Status: {statusFilter}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Employee List with Individual Times */}
          {filteredEmployees.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                Selected Employees ({filteredEmployees.length})
              </h3>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Time</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out Time</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => {
                      const isOfficeStaff = employee.department === "OFFICE STAFF";
                      const empTimes = individualTimes[employee.id] || { inTime: "", outTime: "", status: "1" };
                      
                      return (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-sm">{employee.name}</div>
                              <div className="text-xs text-gray-500">{employee.employeeId}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {employee.department}
                            </Badge>
                          </td>
                          <td className="p-3">
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
                          </td>
                          <td className="p-3">
                            {!isOfficeStaff ? (
                              <Input
                                type="time"
                                value={empTimes.inTime}
                                onChange={(e) => updateIndividualTime(employee.id, 'inTime', e.target.value)}
                                className="w-32"
                              />
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="p-3">
                            {!isOfficeStaff ? (
                              <Input
                                type="time"
                                value={empTimes.outTime}
                                onChange={(e) => updateIndividualTime(employee.id, 'outTime', e.target.value)}
                                className="w-32"
                              />
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="p-3">
                            <Select 
                              value={empTimes.status} 
                              onValueChange={(value) => updateIndividualTime(employee.id, 'status', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Present</SelectItem>
                                <SelectItem value="L">Leave</SelectItem>
                                <SelectItem value="A">Absent</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

          {filteredEmployees.length === 0 && (departmentFilter || statusFilter) && (
            <div className="text-center py-8 text-gray-500">
              No employees found for the selected filters.
            </div>
          )}

          {!departmentFilter && !statusFilter && (
            <div className="text-center py-8 text-gray-500">
              Please select department or status filters to view employees.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkAttendanceEntry;
