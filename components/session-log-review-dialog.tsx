"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { YouthSessionReview } from "@/components/youth-session-review";
import { Badge } from "@/components/ui/badge";

interface SessionLogReviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewSubmit: (transcript: string, reviewType: 'guided' | 'freeform') => void;
  athleteAge?: number;
  athleteName?: string;
  currentTranscript?: string;
}

export function SessionLogReviewDialog({
  isOpen,
  onOpenChange,
  onReviewSubmit,
  athleteAge = 16,
  athleteName = "Athlete",
  currentTranscript = ""
}: SessionLogReviewDialogProps) {
  const [activeTab, setActiveTab] = useState<'guided' | 'freeform'>(
    athleteAge < 16 ? 'guided' : 'freeform'
  );
  const [freeformText, setFreeformText] = useState(currentTranscript);

  const isYouthAthlete = athleteAge < 16;

  const handleGuidedReviewComplete = (transcript: string) => {
    onReviewSubmit(transcript, 'guided');
    onOpenChange(false);
  };

  const handleFreeformSubmit = () => {
    onReviewSubmit(freeformText, 'freeform');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Session Review for {athleteName}</DialogTitle>
            <div className="flex gap-2">
              {isYouthAthlete && <Badge variant="secondary">Youth Athlete</Badge>}
              <Badge variant="outline">Age {athleteAge}</Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'guided' | 'freeform')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guided" className="flex items-center gap-2">
              🎯 Guided Review
              {isYouthAthlete && <Badge variant="default" className="text-xs">Recommended</Badge>}
            </TabsTrigger>
            <TabsTrigger value="freeform">
              ✏️ Free Writing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guided" className="mt-6">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4  border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">📝 Guided Session Review</h3>
                <p className="text-blue-700 text-sm">
                  Answer a few simple questions about your training session. This helps your coach understand
                  how you're feeling and what you're learning!
                </p>
              </div>

              <YouthSessionReview
                onReviewComplete={handleGuidedReviewComplete}
                athleteAge={athleteAge}
              />
            </div>
          </TabsContent>

          <TabsContent value="freeform" className="mt-6">
            <div className="space-y-4">
              <div className="bg-green-50 p-4  border border-green-200">
                <h3 className="font-medium text-green-900 mb-2">✏️ Free Writing</h3>
                <p className="text-green-700 text-sm">
                  Share your thoughts about today's training session in your own words.
                  Think about what went well, what was challenging, and how you're feeling.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Your session feedback:</label>
                <Textarea
                  value={freeformText}
                  onChange={(e) => setFreeformText(e.target.value)}
                  placeholder={isYouthAthlete
                    ? "Tell your coach about today's training... How did it go? What did you learn? How are you feeling?"
                    : "Describe your training session experience, including what went well, challenges faced, energy levels, and any other observations..."
                  }
                  rows={8}
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleFreeformSubmit}
                  disabled={!freeformText.trim()}
                >
                  Save Review
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}