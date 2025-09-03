import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, fileName: string) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fileName = `voice-note-${Date.now()}.webm`;
        onRecordingComplete(audioBlob, fileName);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      
      toast({
        title: "Recording started",
        description: "Voice recording is now active",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        toast({
          title: "Recording resumed",
          description: "Voice recording is active again",
        });
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        toast({
          title: "Recording paused",
          description: "Voice recording is paused",
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      toast({
        title: "Recording completed",
        description: "Voice note has been saved",
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {!isRecording ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startRecording}
          className="flex items-center space-x-2"
        >
          <Mic className="h-4 w-4" />
          <span>Record Voice Note</span>
        </Button>
      ) : (
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={pauseRecording}
            className={`flex items-center space-x-2 ${isPaused ? 'bg-yellow-50' : 'bg-red-50'}`}
          >
            {isPaused ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </Button>
          
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={stopRecording}
            className="flex items-center space-x-2"
          >
            <Square className="h-4 w-4" />
            <span>Stop</span>
          </Button>
          
          <div className="flex items-center space-x-1 text-sm text-red-600">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
            <span>{isPaused ? 'Paused' : 'Recording...'}</span>
          </div>
        </div>
      )}
    </div>
  );
}