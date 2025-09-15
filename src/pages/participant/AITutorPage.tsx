import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mic, Send, Paperclip, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateTutorResponse } from '@/lib/gemini';

export function AITutorPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      toast({ title: "File attached", description: `${acceptedFiles[0].name}` });
    }
  }, [toast]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] }
  });

  const handleSendMessage = async () => {
    if (!input.trim() && !file) return;

    const userMessageContent = input.trim();
    const userMessage = { role: 'user' as const, content: userMessageContent || `Uploaded: ${file?.name}` };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let fileContent: string | undefined = undefined;
    if (file) {
      try {
        fileContent = await file.text();
      } catch (e) {
        toast({ title: "Error reading file", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }

    try {
      const aiResponseText = await generateTutorResponse(userMessageContent, fileContent);
      setMessages(prev => [...prev, { role: 'ai', content: aiResponseText }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get response from AI Tutor.";
      setMessages(prev => [...prev, { role: 'ai', content: `Sorry, I encountered an error: ${errorMessage}` }]);
      toast({ title: "AI Tutor Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };
  
  // Placeholder for voice recognition
  const toggleListening = () => {
    setIsListening(!isListening);
    toast({ title: "Voice support is coming soon!", description: "We're working on enabling voice interaction." });
  };

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader>
        <CardTitle>AI Tutor</CardTitle>
        <CardDescription>Ask questions, upload documents, or use your voice to learn.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn("max-w-sm md:max-w-md lg:max-w-lg rounded-lg px-4 py-2", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-4 border-t">
        {file && (
          <div className="mb-2 flex items-center justify-between bg-muted/50 p-2 rounded-md">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              <span className="text-sm truncate">{file.name}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFile(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your question or describe what you need help with..."
            className="flex-grow resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button {...getRootProps({})} variant="outline" size="icon" asChild>
            <div>
              <input {...getInputProps()} />
              <Paperclip className="h-5 w-5" />
            </div>
          </Button>
          <Button onClick={toggleListening} variant={isListening ? 'destructive' : 'outline'} size="icon">
            <Mic className="h-5 w-5" />
          </Button>
          <Button onClick={handleSendMessage} disabled={isLoading || (!input.trim() && !file)}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
