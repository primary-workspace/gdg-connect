import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Task } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  completed?: boolean;
  allDay: boolean;
  editable: boolean;
  color?: string;
  isCommunityEvent: boolean;
  originalId: number;
};

export function TaskManagerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newTask, setNewTask] = useState<{ title: string; start: string; end: string; description?: string; completed: boolean }>({
    title: '',
    start: '',
    end: '',
    description: '',
    completed: false,
  });

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [tasksRes, communityEventsRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('community_events').select('*')
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (communityEventsRes.error) throw communityEventsRes.error;

      const personalTasks: CalendarEvent[] = tasksRes.data.map(t => ({
        ...t,
        id: `task-${t.id}`,
        allDay: false,
        editable: true,
        isCommunityEvent: false,
        originalId: t.id,
      }));

      const communityEvents: CalendarEvent[] = communityEventsRes.data.map(e => ({
        ...e,
        id: `community-${e.id}`,
        allDay: false,
        editable: false,
        isCommunityEvent: true,
        color: '#10b981', // emerald-500
        originalId: e.id,
      }));

      setEvents([...personalTasks, ...communityEvents]);

    } catch (error: any) {
      toast({ title: 'Error', description: `Failed to fetch calendar events: ${error.message}`, variant: 'destructive' });
    }
    setLoading(false);
  }, [user, toast]);


  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelect = (selectInfo: any) => {
    setNewTask({ title: '', start: selectInfo.startStr, end: selectInfo.endStr, description: '', completed: false });
    setSelectedEvent(null);
    setIsTaskDialogOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      if (event.isCommunityEvent) {
        setIsEventDialogOpen(true);
      } else {
        setNewTask({ title: event.title, start: event.start, end: event.end, description: event.description || '', completed: event.completed || false });
        setIsTaskDialogOpen(true);
      }
    }
  };

  const handleSaveTask = async () => {
    if (!user || !newTask.title) return;

    if (selectedEvent && !selectedEvent.isCommunityEvent) { // Update existing task
      const { error } = await supabase
        .from('tasks')
        .update({ title: newTask.title, description: newTask.description, start: newTask.start, end: newTask.end, completed: newTask.completed })
        .eq('id', selectedEvent.originalId);
      if (error) {
        toast({ title: 'Error', description: 'Failed to update task.', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Task updated.' });
        fetchEvents();
      }
    } else { // Create new task
      const { error } = await supabase
        .from('tasks')
        .insert({ ...newTask, user_id: user.id });
      if (error) {
        toast({ title: 'Error', description: `Failed to create task: ${error.message}`, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Task created.' });
        fetchEvents();
      }
    }
    setIsTaskDialogOpen(false);
  };

  const handleDeleteTask = async () => {
    if (!selectedEvent || selectedEvent.isCommunityEvent) return;
    const { error } = await supabase.from('tasks').delete().eq('id', selectedEvent.originalId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete task.', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Task deleted.' });
      fetchEvents();
      setIsTaskDialogOpen(false);
    }
  };

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    className: event.isCommunityEvent ? 'fc-community-event' : (event.completed ? 'fc-event-completed' : ''),
    editable: event.editable,
  }));

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="dayGridMonth"
        events={calendarEvents}
        selectable={true}
        select={handleSelect}
        eventClick={handleEventClick}
        height="100%"
      />
      {/* Dialog for Personal Tasks */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Task' : 'Create Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task details"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="completed" 
                checked={newTask.completed} 
                onCheckedChange={(checked) => setNewTask({ ...newTask, completed: !!checked })}
              />
              <Label htmlFor="completed">Mark as completed</Label>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            {selectedEvent && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete this task.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTask}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button onClick={handleSaveTask}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog for Community Events */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Community Event</DialogTitle>
            <DialogDescription>This is a community-wide event. You can view details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <h3 className="font-semibold text-lg">{selectedEvent?.title}</h3>
            <p className="text-sm text-muted-foreground">{selectedEvent?.description}</p>
            <p className="text-sm"><strong>Starts:</strong> {selectedEvent && format(new Date(selectedEvent.start), 'PPP p')}</p>
            <p className="text-sm"><strong>Ends:</strong> {selectedEvent && format(new Date(selectedEvent.end), 'PPP p')}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
