import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

type CommunityEvent = {
  id: number;
  title: string;
  description?: string;
  start: string;
  end: string;
  created_by: string;
};

export function EventCalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [newEvent, setNewEvent] = useState<{ title: string; start: string; end: string; description?: string }>({
    title: '',
    start: '',
    end: '',
    description: '',
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('community_events').select('*');

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch community events.', variant: 'destructive' });
    } else {
      setEvents(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelect = (selectInfo: any) => {
    setNewEvent({ title: '', start: selectInfo.startStr, end: selectInfo.endStr, description: '' });
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id.toString() === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setNewEvent({ title: event.title, start: event.start, end: event.end, description: event.description || '' });
      setIsDialogOpen(true);
    }
  };

  const handleSaveEvent = async () => {
    if (!user || !newEvent.title) return;

    if (selectedEvent) { // Update existing event
      const { error } = await supabase
        .from('community_events')
        .update({ title: newEvent.title, description: newEvent.description, start: newEvent.start, end: newEvent.end })
        .eq('id', selectedEvent.id);
      if (error) {
        toast({ title: 'Error', description: 'Failed to update event.', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Event updated.' });
        fetchEvents();
      }
    } else { // Create new event
      const { error } = await supabase
        .from('community_events')
        .insert({ ...newEvent, created_by: user.id });
      if (error) {
        toast({ title: 'Error', description: 'Failed to create event.', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Community event created.' });
        fetchEvents();
      }
    }
    setIsDialogOpen(false);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    const { error } = await supabase.from('community_events').delete().eq('id', selectedEvent.id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete event.', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Event deleted.' });
      fetchEvents();
      setIsDialogOpen(false);
    }
  };

  const calendarEvents = events.map(event => ({
    id: event.id.toString(),
    title: event.title,
    start: event.start,
    end: event.end,
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Community Event' : 'Create Community Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="e.g., Monthly Tech Talk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event details, agenda, speakers..."
              />
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
                    <AlertDialogDescription>This will permanently delete this community event for everyone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteEvent}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button onClick={handleSaveEvent}>Save Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
