import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockResults = [
  { id: 1, title: 'JavaScript Basics Quiz', date: '2025-08-10', participants: 50, status: 'Published' },
  { id: 2, title: 'Python Data Structures Test', date: '2025-07-20', participants: 42, status: 'Published' },
  { id: 3, title: 'React State Management Challenge', date: '2025-06-30', participants: 35, status: 'Draft' },
];

export function ReleaseResultsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Release Results</CardTitle>
        <CardDescription>Manage and publish results for quizzes and tests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockResults.map(result => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">{result.title}</TableCell>
                <TableCell>{result.date}</TableCell>
                <TableCell>{result.participants}</TableCell>
                <TableCell>
                  <Badge variant={result.status === 'Published' ? 'default' : 'secondary'}>
                    {result.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">Manage</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
