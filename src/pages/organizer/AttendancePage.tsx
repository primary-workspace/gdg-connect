import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const mockAttendance = [
  { id: 1, event: 'React Hooks Workshop', date: '2025-08-15', attendees: 45, rate: '90%' },
  { id: 2, event: 'Intro to Docker', date: '2025-07-22', attendees: 38, rate: '76%' },
  { id: 3, event: 'Fireside Chat with a PM', date: '2025-07-05', attendees: 52, rate: '87%' },
];

export function AttendancePage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Event Attendance</CardTitle>
          <CardDescription>Monitor and export attendance records for your events.</CardDescription>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All as CSV
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Attendees</TableHead>
              <TableHead>Attendance Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAttendance.map(record => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.event}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.attendees}</TableCell>
                <TableCell>{record.rate}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
