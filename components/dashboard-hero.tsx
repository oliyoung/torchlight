"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "./ui/heading";

export function DashboardHero() {
    return (
        <section className="space-y-6">
            <div>
                <Heading level={1}>Ready to help your athletes grow today?</Heading>
                <Heading level={3}>Your coaching is making a real difference. Keep building those meaningful relationships.</Heading>
            </div>
            <div className="flex gap-4">
                <Button variant="default">Log New Session</Button>
                <Button variant="secondary">View Training Plans</Button>
                <Button variant="secondary">Get AI Coaching Tips</Button>
            </div>
        </section>
    );
}