
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Calendar, BarChart3 } from "lucide-react";
import EmployeeRegistration from "@/components/EmployeeRegistration";
import AttendanceEntry from "@/components/AttendanceEntry";
import EmployeeList from "@/components/EmployeeList";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pen Factory Attendance System
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive employee attendance management for all departments
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock size={16} />
              Attendance Entry
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users size={16} />
              Employee List
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <Calendar size={16} />
              Register Employee
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceEntry />
          </TabsContent>

          <TabsContent value="employees">
            <EmployeeList />
          </TabsContent>

          <TabsContent value="register">
            <EmployeeRegistration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
